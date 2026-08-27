import { addressMatches, portMatches } from "./nsg";

/**
 * Azure Firewall policy evaluation.
 *
 * The rule that catches people is not about priority numbers at all: rule
 * *types* are processed in a fixed order — DNAT, then network, then application
 * — and that order outranks every priority you can set. A network rule at
 * priority 60000 is still evaluated before an application rule at priority 100,
 * so an application rule allowing a friendly FQDN is unreachable if a network
 * rule already decided the packet.
 *
 * Network rules are also terminating. A match there ends evaluation, allow or
 * deny, and the application rules never run.
 *
 * Address and port matching is shared with the NSG blade, since Azure uses the
 * same CIDR and service-tag semantics in both.
 */

export type RuleType = "DNAT" | "Network" | "Application";
export type FirewallAction = "Allow" | "Deny";
export type FirewallProtocol = "TCP" | "UDP" | "ICMP" | "Any";

export type NetworkRule = {
  name: string;
  sourceAddresses: string;
  destinationAddresses: string;
  destinationPorts: string;
  protocols: FirewallProtocol[];
  description?: string;
};

export type ApplicationRule = {
  name: string;
  sourceAddresses: string;
  /** Supports a leading wildcard, as the portal does: *.windowsupdate.com */
  targetFqdns: string[];
  /** http, https, mssql — application rules only see these. */
  protocols: { type: "http" | "https" | "mssql"; port: number }[];
  description?: string;
};

export type DnatRule = {
  name: string;
  sourceAddresses: string;
  /** The firewall's own public address. */
  destinationAddresses: string;
  destinationPorts: string;
  translatedAddress: string;
  translatedPort: number;
  protocols: FirewallProtocol[];
  description?: string;
};

export type RuleCollection = {
  name: string;
  type: RuleType;
  /** DNAT and network collections carry an action; application collections too. */
  action: FirewallAction;
  priority: number;
  groupName: string;
  groupPriority: number;
  networkRules?: NetworkRule[];
  applicationRules?: ApplicationRule[];
  dnatRules?: DnatRule[];
};

export type Packet = {
  sourceIp: string;
  destinationIp: string;
  destinationPort: number;
  protocol: FirewallProtocol;
  /** Present for HTTP/S traffic — application rules need a name, not an address. */
  fqdn?: string;
};

export type FirewallStep = {
  stage: RuleType | "Threat intelligence" | "Default";
  collection: string | null;
  rule: string | null;
  matched: boolean;
  reason: string;
};

export type FirewallVerdict = {
  action: FirewallAction;
  /** Where the decision was made. */
  decidedBy: string;
  /** Set when a DNAT rule rewrote the destination. */
  translatedTo: string | null;
  trace: FirewallStep[];
};

/* --------------------------------------------------------------- matching */

/**
 * Target FQDNs allow a single leading wildcard label.
 *
 * `*.contoso.com` covers subdomains only — it does not cover `contoso.com`
 * itself. List the apex separately when you need both, which is the safe habit
 * regardless of which service you are writing the rule in.
 */
export function fqdnMatches(pattern: string, fqdn: string): boolean {
  const p = pattern.trim().toLowerCase();
  const f = fqdn.trim().toLowerCase();
  if (p === "*") return true;
  if (p.startsWith("*.")) return f.endsWith(p.slice(1));
  return p === f;
}

function protocolMatches(rule: FirewallProtocol[], packet: FirewallProtocol): boolean {
  return rule.includes("Any") || rule.includes(packet);
}

/**
 * Sorts collections into the order the firewall actually evaluates them:
 * by type first, then rule collection group priority, then collection priority.
 */
export function evaluationOrder(collections: RuleCollection[]): RuleCollection[] {
  const typeRank: Record<RuleType, number> = { DNAT: 0, Network: 1, Application: 2 };
  return [...collections].sort(
    (a, b) =>
      typeRank[a.type] - typeRank[b.type] ||
      a.groupPriority - b.groupPriority ||
      a.priority - b.priority,
  );
}

/* ------------------------------------------------------------- evaluation */

export type ThreatIntelMode = "Off" | "Alert only" | "Alert and deny";

/** Addresses and names the threat intelligence feed knows to be malicious. */
export const THREAT_INTEL_FEED = {
  addresses: ["185.220.101.44"],
  fqdns: ["contoso-benefits.com"],
};

function threatIntelHit(packet: Packet): boolean {
  return (
    THREAT_INTEL_FEED.addresses.includes(packet.destinationIp) ||
    (packet.fqdn !== undefined &&
      THREAT_INTEL_FEED.fqdns.some((f) => fqdnMatches(`*.${f}`, packet.fqdn!) || f === packet.fqdn))
  );
}

/**
 * Evaluates a packet against a firewall policy.
 *
 * Order of business, and every step is recorded so the verdict is explainable:
 *  1. Threat intelligence, before any rule you wrote.
 *  2. DNAT rules — a match rewrites the destination and implicitly allows.
 *  3. Network rules — terminating, whether they allow or deny.
 *  4. Application rules — only reached if no network rule matched.
 *  5. Default deny.
 */
export function evaluatePacket(
  collections: RuleCollection[],
  packet: Packet,
  threatIntel: ThreatIntelMode = "Alert and deny",
): FirewallVerdict {
  const trace: FirewallStep[] = [];

  // 1. Threat intelligence runs ahead of the rule collections.
  if (threatIntel !== "Off" && threatIntelHit(packet)) {
    const denied = threatIntel === "Alert and deny";
    trace.push({
      stage: "Threat intelligence",
      collection: null,
      rule: null,
      matched: true,
      reason: denied
        ? "Destination is on the Microsoft threat intelligence feed, and the mode is alert and deny — this is refused before any rule is consulted."
        : "Destination is on the threat intelligence feed. The mode is alert only, so it is logged and evaluation continues.",
    });
    if (denied) {
      return {
        action: "Deny",
        decidedBy: "Threat intelligence",
        translatedTo: null,
        trace,
      };
    }
  } else if (threatIntel !== "Off") {
    trace.push({
      stage: "Threat intelligence",
      collection: null,
      rule: null,
      matched: false,
      reason: "Destination is not on the threat intelligence feed.",
    });
  }

  const ordered = evaluationOrder(collections);
  let translatedTo: string | null = null;
  let effective = packet;

  // 2. DNAT.
  for (const collection of ordered.filter((c) => c.type === "DNAT")) {
    for (const rule of collection.dnatRules ?? []) {
      const ok =
        protocolMatches(rule.protocols, packet.protocol) &&
        addressMatches(rule.sourceAddresses, packet.sourceIp) &&
        addressMatches(rule.destinationAddresses, packet.destinationIp) &&
        portMatches(rule.destinationPorts, packet.destinationPort);

      if (ok) {
        translatedTo = `${rule.translatedAddress}:${rule.translatedPort}`;
        effective = {
          ...packet,
          destinationIp: rule.translatedAddress,
          destinationPort: rule.translatedPort,
        };
        trace.push({
          stage: "DNAT",
          collection: collection.name,
          rule: rule.name,
          matched: true,
          reason: `Translated to ${translatedTo}. A DNAT match implicitly allows the traffic — you do not write a matching network rule for it.`,
        });
        return {
          action: "Allow",
          decidedBy: `${collection.name} / ${rule.name}`,
          translatedTo,
          trace,
        };
      }
      trace.push({
        stage: "DNAT",
        collection: collection.name,
        rule: rule.name,
        matched: false,
        reason: "Does not match the source, destination or port.",
      });
    }
  }

  // 3. Network rules — terminating either way.
  for (const collection of ordered.filter((c) => c.type === "Network")) {
    for (const rule of collection.networkRules ?? []) {
      const ok =
        protocolMatches(rule.protocols, effective.protocol) &&
        addressMatches(rule.sourceAddresses, effective.sourceIp) &&
        addressMatches(rule.destinationAddresses, effective.destinationIp) &&
        portMatches(rule.destinationPorts, effective.destinationPort);

      if (ok) {
        trace.push({
          stage: "Network",
          collection: collection.name,
          rule: rule.name,
          matched: true,
          reason: `Network rules are terminating, so evaluation stops here and the application rules are never consulted.`,
        });
        return {
          action: collection.action,
          decidedBy: `${collection.name} / ${rule.name}`,
          translatedTo,
          trace,
        };
      }
      trace.push({
        stage: "Network",
        collection: collection.name,
        rule: rule.name,
        matched: false,
        reason: "Does not match the source, destination, port or protocol.",
      });
    }
  }

  // 4. Application rules — name-based, and only for web protocols.
  const appCollections = ordered.filter((c) => c.type === "Application");
  if (effective.fqdn === undefined && appCollections.length > 0) {
    trace.push({
      stage: "Application",
      collection: null,
      rule: null,
      matched: false,
      reason:
        "No hostname on this packet. Application rules match on FQDN, so traffic without one cannot be allowed by them.",
    });
  } else {
    for (const collection of appCollections) {
      for (const rule of collection.applicationRules ?? []) {
        const portOk = rule.protocols.some((p) => p.port === effective.destinationPort);
        const sourceOk = addressMatches(rule.sourceAddresses, effective.sourceIp);
        const fqdnOk = rule.targetFqdns.some((t) => fqdnMatches(t, effective.fqdn!));

        if (portOk && sourceOk && fqdnOk) {
          trace.push({
            stage: "Application",
            collection: collection.name,
            rule: rule.name,
            matched: true,
            reason: `Matched ${effective.fqdn} against ${rule.targetFqdns.join(", ")}.`,
          });
          return {
            action: collection.action,
            decidedBy: `${collection.name} / ${rule.name}`,
            translatedTo,
            trace,
          };
        }
        trace.push({
          stage: "Application",
          collection: collection.name,
          rule: rule.name,
          matched: false,
          reason: !sourceOk
            ? "Source is outside this rule."
            : !portOk
              ? `Rule does not cover port ${effective.destinationPort}.`
              : `${effective.fqdn} does not match ${rule.targetFqdns.join(", ")}.`,
        });
      }
    }
  }

  // 5. Nothing matched.
  trace.push({
    stage: "Default",
    collection: null,
    rule: null,
    matched: true,
    reason: "No rule matched. Azure Firewall denies anything not explicitly allowed.",
  });

  return { action: "Deny", decidedBy: "Default deny", translatedTo, trace };
}

/* ---------------------------------------------------------- starter policy */

export const STARTER_POLICY: RuleCollection[] = [
  {
    name: "dnat-inbound",
    type: "DNAT",
    action: "Allow",
    priority: 200,
    groupName: "DefaultDnatRuleCollectionGroup",
    groupPriority: 100,
    dnatRules: [
      {
        name: "rdp-to-jumpbox",
        sourceAddresses: "203.0.113.0/24",
        destinationAddresses: "20.90.10.5",
        destinationPorts: "3389",
        translatedAddress: "10.20.9.4",
        translatedPort: 3389,
        protocols: ["TCP"],
        description: "Publishes the jump box to the corporate range only.",
      },
    ],
  },
  {
    name: "block-known-bad",
    type: "Network",
    action: "Deny",
    priority: 100,
    groupName: "DefaultNetworkRuleCollectionGroup",
    groupPriority: 200,
    networkRules: [
      {
        name: "deny-c2-range",
        sourceAddresses: "*",
        destinationAddresses: "185.220.101.0/24",
        destinationPorts: "*",
        protocols: ["Any"],
        description: "The range the lab intrusion used for command and control.",
      },
    ],
  },
  {
    name: "allow-infra",
    type: "Network",
    action: "Allow",
    priority: 300,
    groupName: "DefaultNetworkRuleCollectionGroup",
    groupPriority: 200,
    networkRules: [
      {
        name: "allow-dns",
        sourceAddresses: "10.20.0.0/16",
        destinationAddresses: "*",
        destinationPorts: "53",
        protocols: ["UDP", "TCP"],
        description: "Outbound DNS.",
      },
      {
        name: "allow-ntp",
        sourceAddresses: "10.20.0.0/16",
        destinationAddresses: "*",
        destinationPorts: "123",
        protocols: ["UDP"],
      },
      {
        name: "allow-web-any",
        sourceAddresses: "10.20.5.0/24",
        destinationAddresses: "*",
        destinationPorts: "80,443",
        protocols: ["TCP"],
        description:
          "Over-permissive on purpose: this is the rule that makes the application rules below unreachable for that subnet.",
      },
    ],
  },
  {
    name: "allow-approved-sites",
    type: "Application",
    action: "Allow",
    priority: 100,
    groupName: "DefaultApplicationRuleCollectionGroup",
    groupPriority: 300,
    applicationRules: [
      {
        name: "windows-update",
        sourceAddresses: "10.20.0.0/16",
        targetFqdns: ["*.windowsupdate.com", "*.microsoft.com"],
        protocols: [
          { type: "http", port: 80 },
          { type: "https", port: 443 },
        ],
      },
      {
        name: "package-feeds",
        sourceAddresses: "10.20.1.0/24",
        targetFqdns: ["registry.npmjs.org", "*.githubusercontent.com"],
        protocols: [{ type: "https", port: 443 }],
      },
    ],
  },
];

export const SAMPLE_PACKETS: { label: string; packet: Packet; teaches: string }[] = [
  {
    label: "Web browsing from the app subnet",
    packet: {
      sourceIp: "10.20.1.10",
      destinationIp: "23.53.1.1",
      destinationPort: 443,
      protocol: "TCP",
      fqdn: "registry.npmjs.org",
    },
    teaches:
      "No network rule covers 10.20.1.0/24 on 443, so evaluation reaches the application rules and the FQDN is allowed by name.",
  },
  {
    label: "The same request from the web subnet",
    packet: {
      sourceIp: "10.20.5.10",
      destinationIp: "23.53.1.1",
      destinationPort: 443,
      protocol: "TCP",
      fqdn: "registry.npmjs.org",
    },
    teaches:
      "allow-web-any matches first because network rules outrank application rules. The traffic is allowed, but by address — the FQDN restriction you thought you had is not applied at all.",
  },
  {
    label: "Connection to the command-and-control address",
    packet: {
      sourceIp: "10.20.1.44",
      destinationIp: "185.220.101.44",
      destinationPort: 443,
      protocol: "TCP",
    },
    teaches:
      "Threat intelligence denies this before any rule collection is consulted. Turn it to alert only and the deny rule catches it instead — one step later.",
  },
  {
    label: "Published RDP from the corporate range",
    packet: {
      sourceIp: "203.0.113.40",
      destinationIp: "20.90.10.5",
      destinationPort: 3389,
      protocol: "TCP",
    },
    teaches:
      "The DNAT rule translates to 10.20.9.4 and implicitly allows. You do not write a matching network rule.",
  },
  {
    label: "Published RDP from anywhere else",
    packet: {
      sourceIp: "198.51.100.7",
      destinationIp: "20.90.10.5",
      destinationPort: 3389,
      protocol: "TCP",
    },
    teaches: "Outside the DNAT rule's source range, so nothing matches and the default deny applies.",
  },
  {
    label: "A blocked site over HTTPS",
    packet: {
      sourceIp: "10.20.1.10",
      destinationIp: "104.18.1.1",
      destinationPort: 443,
      protocol: "TCP",
      fqdn: "pastebin.com",
    },
    teaches:
      "Reaches the application rules but matches no target FQDN, so the default deny ends it. Application rules are an allow-list.",
  },
];
