import { addressMatches, portMatches } from "./nsg";
import type { FirewallProtocol, Packet } from "./firewall";

/**
 * Azure Firewall Premium IDPS — intrusion detection and prevention.
 *
 * Modelled on the real blade because the behaviour has three layers people
 * conflate:
 *
 *  1. The **policy mode** (Off / Alert / Alert and deny) is the default for
 *     every signature.
 *  2. A **signature override** beats the policy mode for that one signature.
 *     This is how you silence a noisy rule without weakening the whole policy,
 *     and how you deny one thing while the rest is only alerting.
 *  3. The **bypass list** skips IDPS entirely for matching traffic — it is
 *     evaluated before signatures, so a bypass entry silently defeats every
 *     override you set. That ordering is the part that catches people.
 *
 * IDPS also runs *after* the firewall rules have allowed a packet. Traffic the
 * rules denied never reaches inspection, so a deny rule and an IDPS signature
 * are not interchangeable.
 */

export type IdpsMode = "Off" | "Alert" | "Alert and deny";

/** The real severity values in the signature rules blade. */
export type SignatureSeverity = "Low" | "Medium" | "High";

/**
 * Direction as the portal expresses it. "Internal" means both endpoints are in
 * the configured private IP ranges, which is why those ranges are a setting.
 */
export type SignatureDirection =
  | "Inbound"
  | "Outbound"
  | "Bidirectional"
  | "Internal"
  | "Internal/Inbound"
  | "Internal/Outbound"
  | "Any";

export type SignatureGroup =
  | "Malware Command and Control"
  | "Phishing"
  | "Exploit Kit"
  | "Web Application Attack"
  | "Information Leak"
  | "Coin Mining"
  | "Botnet"
  | "DNS"
  | "Credential Theft"
  | "Policy Violation";

export type Signature = {
  /** Signature IDs are numeric in the portal and searched by exact match. */
  id: number;
  group: SignatureGroup;
  severity: SignatureSeverity;
  direction: SignatureDirection;
  protocol: string;
  description: string;
  /**
   * What the signature actually looks for in this simulation. Real IDPS matches
   * packet content; here a small set of observable conditions stands in.
   */
  match: {
    destinationIp?: string;
    destinationPort?: number;
    fqdn?: string;
    protocol?: FirewallProtocol;
  };
};

/** A per-signature mode override, as configured in the signature rules blade. */
export type SignatureOverride = {
  signatureId: number;
  mode: IdpsMode;
};

export type BypassRule = {
  name: string;
  description?: string;
  protocol: FirewallProtocol;
  sourceAddresses: string;
  destinationAddresses: string;
  destinationPorts: string;
};

export type IdpsConfig = {
  mode: IdpsMode;
  overrides: SignatureOverride[];
  bypass: BypassRule[];
  /** Used to decide whether an endpoint counts as internal for direction. */
  privateRanges: string[];
};

/* ------------------------------------------------------------- signatures */

/**
 * A slice of the signature set, chosen so the lab's own intrusion is detectable
 * and so every group and severity is represented. The real product ships tens
 * of thousands; the blade behaviour is identical either way.
 */
export const SIGNATURES: Signature[] = [
  {
    id: 2033078,
    group: "Malware Command and Control",
    severity: "High",
    direction: "Outbound",
    protocol: "TCP",
    description: "ET MALWARE Observed Cobalt Strike beacon check-in to known C2 host",
    match: { destinationIp: "185.220.101.44" },
  },
  {
    id: 2027758,
    group: "Malware Command and Control",
    severity: "High",
    direction: "Outbound",
    protocol: "TLS",
    description: "ET MALWARE Suspicious TLS handshake to anonymising infrastructure",
    match: { destinationIp: "185.220.101.44", destinationPort: 443 },
  },
  {
    id: 2019401,
    group: "Phishing",
    severity: "High",
    direction: "Outbound",
    protocol: "HTTP",
    description: "ET PHISHING Credential harvesting page impersonating a benefits portal",
    match: { fqdn: "contoso-benefits.com" },
  },
  {
    id: 2024897,
    group: "Credential Theft",
    severity: "High",
    direction: "Outbound",
    protocol: "TCP",
    description: "ET ATTACK_RESPONSE Possible LSASS memory dump exfiltration over HTTP",
    match: { destinationPort: 8080 },
  },
  {
    id: 2018959,
    group: "Web Application Attack",
    severity: "Medium",
    direction: "Inbound",
    protocol: "HTTP",
    description: "ET WEB_SERVER SQL injection attempt in query string",
    // Scoped to the published front end. An inbound web signature that matched
    // on port alone would fire on every outbound request to port 80 as well.
    match: { destinationIp: "20.90.10.5", destinationPort: 80 },
  },
  {
    id: 2016184,
    group: "Exploit Kit",
    severity: "High",
    direction: "Inbound",
    protocol: "HTTP",
    description: "ET EXPLOIT_KIT Landing page redirect observed",
    match: { destinationIp: "20.90.10.5", destinationPort: 80, protocol: "TCP" },
  },
  {
    id: 2031452,
    group: "Coin Mining",
    severity: "Low",
    direction: "Outbound",
    protocol: "TCP",
    description: "ET COINMINER Stratum mining protocol handshake",
    match: { destinationPort: 3333 },
  },
  {
    id: 2022973,
    group: "DNS",
    severity: "Medium",
    direction: "Outbound",
    protocol: "DNS",
    description: "ET DNS Query to a known dynamic DNS provider used for tunnelling",
    match: { destinationPort: 53 },
  },
  {
    id: 2014726,
    group: "Information Leak",
    severity: "Medium",
    direction: "Outbound",
    protocol: "TCP",
    description: "ET POLICY Large outbound archive transfer to an external host",
    match: { destinationPort: 21 },
  },
  {
    id: 2010935,
    group: "Botnet",
    severity: "Medium",
    direction: "Bidirectional",
    protocol: "TCP",
    description: "ET TROJAN Known botnet controller communication pattern",
    match: { destinationPort: 6667 },
  },
  {
    id: 2013028,
    group: "Policy Violation",
    severity: "Low",
    direction: "Outbound",
    protocol: "TCP",
    description: "ET POLICY Remote desktop traffic leaving the corporate network",
    match: { destinationPort: 3389 },
  },
  {
    id: 2021089,
    group: "Web Application Attack",
    severity: "High",
    direction: "Inbound",
    protocol: "HTTP",
    description: "ET WEB_SERVER Possible path traversal attempt",
    match: { destinationIp: "20.90.10.5", destinationPort: 443, protocol: "TCP" },
  },
];

export const SIGNATURE_GROUPS: SignatureGroup[] = [
  "Malware Command and Control",
  "Phishing",
  "Exploit Kit",
  "Web Application Attack",
  "Information Leak",
  "Coin Mining",
  "Botnet",
  "DNS",
  "Credential Theft",
  "Policy Violation",
];

export const SEVERITIES: SignatureSeverity[] = ["Low", "Medium", "High"];
export const IDPS_MODES: IdpsMode[] = ["Off", "Alert", "Alert and deny"];

/* ------------------------------------------------------------ evaluation */

/**
 * The mode actually in force for a signature: its override if one exists,
 * otherwise the policy mode.
 */
export function effectiveMode(
  signature: Signature,
  config: Pick<IdpsConfig, "mode" | "overrides">,
): { mode: IdpsMode; overridden: boolean } {
  const override = config.overrides.find((o) => o.signatureId === signature.id);
  return override
    ? { mode: override.mode, overridden: true }
    : { mode: config.mode, overridden: false };
}

/** Whether a bypass entry covers this packet. Checked before any signature. */
export function matchingBypass(config: IdpsConfig, packet: Packet): BypassRule | null {
  for (const rule of config.bypass) {
    const protocolOk = rule.protocol === "Any" || rule.protocol === packet.protocol;
    if (
      protocolOk &&
      addressMatches(rule.sourceAddresses, packet.sourceIp) &&
      addressMatches(rule.destinationAddresses, packet.destinationIp) &&
      portMatches(rule.destinationPorts, packet.destinationPort)
    ) {
      return rule;
    }
  }
  return null;
}

function signatureMatches(signature: Signature, packet: Packet): boolean {
  const m = signature.match;
  if (m.destinationIp !== undefined && m.destinationIp !== packet.destinationIp) return false;
  if (m.destinationPort !== undefined && m.destinationPort !== packet.destinationPort) return false;
  if (m.protocol !== undefined && m.protocol !== packet.protocol) return false;
  if (m.fqdn !== undefined) {
    if (packet.fqdn === undefined) return false;
    const f = packet.fqdn.toLowerCase();
    const want = m.fqdn.toLowerCase();
    if (f !== want && !f.endsWith(`.${want}`)) return false;
  }
  // A signature with no conditions would match everything; treat it as inert.
  return Object.keys(m).length > 0;
}

export type SignatureHit = {
  signature: Signature;
  mode: IdpsMode;
  overridden: boolean;
};

export type IdpsVerdict = {
  /** True when IDPS blocked the packet the firewall had already allowed. */
  denied: boolean;
  /** Signatures that fired, whatever their mode. */
  hits: SignatureHit[];
  /** Signatures that fired in a mode that alerts but does not block. */
  alerts: SignatureHit[];
  bypassedBy: BypassRule | null;
  summary: string;
};

/**
 * Inspects a packet the firewall rules have already allowed.
 *
 * Order: bypass list, then signatures. A signature in "Alert and deny" blocks;
 * "Alert" records only; "Off" does neither. The strictest matching signature
 * decides, so one denying signature blocks even when a dozen others only alert.
 */
export function inspect(config: IdpsConfig, packet: Packet): IdpsVerdict {
  if (config.mode === "Off" && config.overrides.length === 0) {
    return {
      denied: false,
      hits: [],
      alerts: [],
      bypassedBy: null,
      summary: "IDPS is off, so nothing is inspected.",
    };
  }

  const bypass = matchingBypass(config, packet);
  if (bypass) {
    return {
      denied: false,
      hits: [],
      alerts: [],
      bypassedBy: bypass,
      summary: `Bypassed by "${bypass.name}". The bypass list is evaluated before signatures, so no signature runs — including any you set to alert and deny.`,
    };
  }

  const hits: SignatureHit[] = [];
  for (const signature of SIGNATURES) {
    if (!signatureMatches(signature, packet)) continue;
    const { mode, overridden } = effectiveMode(signature, config);
    if (mode === "Off") continue;
    hits.push({ signature, mode, overridden });
  }

  const denying = hits.filter((h) => h.mode === "Alert and deny");
  const alerts = hits.filter((h) => h.mode === "Alert");

  if (denying.length > 0) {
    const first = denying[0];
    return {
      denied: true,
      hits,
      alerts,
      bypassedBy: null,
      summary: `Blocked by signature ${first.signature.id} (${first.signature.group}, ${first.signature.severity})${
        first.overridden ? ", set by a signature override" : ""
      }. The firewall rules allowed this packet — IDPS stopped it afterwards.`,
    };
  }

  if (alerts.length > 0) {
    return {
      denied: false,
      hits,
      alerts,
      bypassedBy: null,
      summary: `${alerts.length} signature${alerts.length === 1 ? "" : "s"} alerted but did not block. In alert mode the traffic still reaches its destination — you get a log entry, not protection.`,
    };
  }

  return {
    denied: false,
    hits: [],
    alerts: [],
    bypassedBy: null,
    summary: "No signature matched this traffic.",
  };
}

/* ------------------------------------------------------------- filtering */

export type SignatureFilters = {
  search: string;
  group: SignatureGroup | "All";
  severity: SignatureSeverity | "All";
  direction: SignatureDirection | "All";
  mode: IdpsMode | "All";
};

export const EMPTY_SIGNATURE_FILTERS: SignatureFilters = {
  search: "",
  group: "All",
  severity: "All",
  direction: "All",
  mode: "All",
};

/** Mirrors the signature rules blade's filter bar, including ID search. */
export function filterSignatures(
  signatures: Signature[],
  filters: SignatureFilters,
  config: Pick<IdpsConfig, "mode" | "overrides">,
): Signature[] {
  const q = filters.search.trim().toLowerCase();
  return signatures.filter((s) => {
    if (q && !String(s.id).includes(q) && !s.description.toLowerCase().includes(q)) return false;
    if (filters.group !== "All" && s.group !== filters.group) return false;
    if (filters.severity !== "All" && s.severity !== filters.severity) return false;
    if (filters.direction !== "All" && s.direction !== filters.direction) return false;
    if (filters.mode !== "All" && effectiveMode(s, config).mode !== filters.mode) return false;
    return true;
  });
}

/* ------------------------------------------------------------- defaults */

export const DEFAULT_IDPS: IdpsConfig = {
  mode: "Alert",
  overrides: [],
  bypass: [
    {
      name: "backup-replication",
      description: "Nightly replication between the file server and the backup target.",
      protocol: "TCP",
      sourceAddresses: "10.20.0.0/16",
      destinationAddresses: "10.40.0.0/16",
      destinationPorts: "445",
    },
  ],
  privateRanges: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
};
