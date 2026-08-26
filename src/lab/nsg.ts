/**
 * Network security group rule evaluation.
 *
 * Reproduces how Azure actually decides a flow: rules are ordered by priority,
 * only rules matching direction, protocol, source, destination and ports are
 * considered, and the first match wins. Default rules always sit at the bottom.
 *
 * This is the part people consistently get wrong from reading alone — a rule
 * with a lower number does not win unless it also matches.
 */

export type Direction = "Inbound" | "Outbound";
export type Access = "Allow" | "Deny";
export type Protocol = "Any" | "TCP" | "UDP" | "ICMP";

export type NsgRule = {
  name: string;
  priority: number;
  direction: Direction;
  access: Access;
  protocol: Protocol;
  /** CIDR, single address, `*`, or a service tag such as Internet. */
  source: string;
  sourcePort: string;
  destination: string;
  destinationPort: string;
  /** Default rules cannot be edited or removed. */
  readonly isDefault?: boolean;
  description?: string;
};

export type Flow = {
  direction: Direction;
  protocol: Exclude<Protocol, "Any">;
  sourceIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
};

export type Evaluation = {
  allowed: boolean;
  /** The rule that decided the flow. */
  matchedRule: NsgRule;
  /** Every rule considered, in evaluation order, with why it did or did not match. */
  trace: { rule: NsgRule; matched: boolean; reason: string }[];
};

/** The address space of the lab virtual network, used by the VirtualNetwork tag. */
export const VNET_PREFIXES = ["10.20.0.0/16"];

export const DEFAULT_RULES: NsgRule[] = [
  {
    name: "AllowVnetInBound",
    priority: 65000,
    direction: "Inbound",
    access: "Allow",
    protocol: "Any",
    source: "VirtualNetwork",
    sourcePort: "*",
    destination: "VirtualNetwork",
    destinationPort: "*",
    isDefault: true,
    description: "Allows traffic within the virtual network.",
  },
  {
    name: "AllowAzureLoadBalancerInBound",
    priority: 65001,
    direction: "Inbound",
    access: "Allow",
    protocol: "Any",
    source: "AzureLoadBalancer",
    sourcePort: "*",
    destination: "*",
    destinationPort: "*",
    isDefault: true,
    description: "Allows health probes from the Azure load balancer.",
  },
  {
    name: "DenyAllInBound",
    priority: 65500,
    direction: "Inbound",
    access: "Deny",
    protocol: "Any",
    source: "*",
    sourcePort: "*",
    destination: "*",
    destinationPort: "*",
    isDefault: true,
    description: "Denies everything not allowed by an earlier rule.",
  },
  {
    name: "AllowVnetOutBound",
    priority: 65000,
    direction: "Outbound",
    access: "Allow",
    protocol: "Any",
    source: "VirtualNetwork",
    sourcePort: "*",
    destination: "VirtualNetwork",
    destinationPort: "*",
    isDefault: true,
    description: "Allows traffic within the virtual network.",
  },
  {
    name: "AllowInternetOutBound",
    priority: 65001,
    direction: "Outbound",
    access: "Allow",
    protocol: "Any",
    source: "*",
    sourcePort: "*",
    destination: "Internet",
    destinationPort: "*",
    isDefault: true,
    description: "Allows outbound traffic to the internet.",
  },
  {
    name: "DenyAllOutBound",
    priority: 65500,
    direction: "Outbound",
    access: "Deny",
    protocol: "Any",
    source: "*",
    sourcePort: "*",
    destination: "*",
    destinationPort: "*",
    isDefault: true,
    description: "Denies everything not allowed by an earlier rule.",
  },
];

/* ------------------------------------------------------------ matching */

function ipToLong(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let out = 0;
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    out = out * 256 + n;
  }
  return out;
}

export function isPrivate(ip: string): boolean {
  const n = ipToLong(ip);
  if (n === null) return false;
  return (
    (n >= ipToLong("10.0.0.0")! && n <= ipToLong("10.255.255.255")!) ||
    (n >= ipToLong("172.16.0.0")! && n <= ipToLong("172.31.255.255")!) ||
    (n >= ipToLong("192.168.0.0")! && n <= ipToLong("192.168.255.255")!)
  );
}

function inCidr(ip: string, cidr: string): boolean {
  const [base, bitsRaw] = cidr.split("/");
  const bits = bitsRaw === undefined ? 32 : Number(bitsRaw);
  const ipN = ipToLong(ip);
  const baseN = ipToLong(base);
  if (ipN === null || baseN === null || !Number.isInteger(bits) || bits < 0 || bits > 32) {
    return false;
  }
  if (bits === 0) return true;
  const mask = bits === 32 ? -1 : ~((1 << (32 - bits)) - 1);
  return (ipN & mask) === (baseN & mask);
}

function inVnet(ip: string): boolean {
  return VNET_PREFIXES.some((p) => inCidr(ip, p));
}

/** Resolves a rule address field, including service tags, against an address. */
export function addressMatches(field: string, ip: string): boolean {
  const value = field.trim();
  if (value === "*" || value.toLowerCase() === "any") return true;

  switch (value) {
    case "VirtualNetwork":
      return inVnet(ip);
    case "Internet":
      // Azure treats anything outside the virtual network's private space as internet.
      return !inVnet(ip) && !isPrivate(ip);
    case "AzureLoadBalancer":
      return ip === "168.63.129.16";
    default:
      break;
  }

  // Comma-separated list of prefixes is allowed in the portal.
  return value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .some((p) => (p.includes("/") ? inCidr(ip, p) : p === ip));
}

/** Port fields accept `*`, a single port, ranges, and comma-separated lists. */
export function portMatches(field: string, port: number): boolean {
  const value = field.trim();
  if (value === "*" || value === "") return true;
  return value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .some((part) => {
      if (part.includes("-")) {
        const [lo, hi] = part.split("-").map((n) => Number(n));
        return Number.isFinite(lo) && Number.isFinite(hi) && port >= lo && port <= hi;
      }
      return Number(part) === port;
    });
}

function protocolMatches(rule: Protocol, flow: Flow["protocol"]): boolean {
  return rule === "Any" || rule === flow;
}

/** Explains, in the order Azure checks them, why a rule did not apply. */
function whyNot(rule: NsgRule, flow: Flow): string | null {
  if (rule.direction !== flow.direction) return `direction is ${rule.direction}`;
  if (!protocolMatches(rule.protocol, flow.protocol)) return `protocol is ${rule.protocol}`;
  if (!addressMatches(rule.source, flow.sourceIp)) return `source ${rule.source} does not cover ${flow.sourceIp}`;
  if (!portMatches(rule.sourcePort, flow.sourcePort)) return `source port ${rule.sourcePort} excludes ${flow.sourcePort}`;
  if (!addressMatches(rule.destination, flow.destinationIp)) {
    return `destination ${rule.destination} does not cover ${flow.destinationIp}`;
  }
  if (!portMatches(rule.destinationPort, flow.destinationPort)) {
    return `destination port ${rule.destinationPort} excludes ${flow.destinationPort}`;
  }
  return null;
}

/**
 * Evaluates a flow against a rule set.
 *
 * Custom rules and default rules are merged and sorted by priority, so a
 * custom rule at 4000 is still evaluated before DenyAllInBound at 65500.
 */
export function evaluateFlow(rules: NsgRule[], flow: Flow): Evaluation {
  const applicable = [...rules, ...DEFAULT_RULES]
    .filter((r) => r.direction === flow.direction)
    .sort((a, b) => a.priority - b.priority);

  const trace: Evaluation["trace"] = [];
  for (const rule of applicable) {
    const reason = whyNot(rule, flow);
    if (reason === null) {
      trace.push({ rule, matched: true, reason: "matches — evaluation stops here" });
      return { allowed: rule.access === "Allow", matchedRule: rule, trace };
    }
    trace.push({ rule, matched: false, reason });
  }

  // Unreachable while the default deny rules are present, but keep it safe.
  const fallback = DEFAULT_RULES.find(
    (r) => r.direction === flow.direction && r.name.startsWith("DenyAll"),
  )!;
  return { allowed: false, matchedRule: fallback, trace };
}

/** Priority must be unique per direction, as the portal enforces. */
export function validateRule(rule: NsgRule, existing: NsgRule[]): string | null {
  if (!rule.name.trim()) return "Give the rule a name.";
  if (!Number.isInteger(rule.priority) || rule.priority < 100 || rule.priority > 4096) {
    return "Priority must be a whole number between 100 and 4096.";
  }
  if (
    existing.some(
      (r) => r !== rule && r.direction === rule.direction && r.priority === rule.priority,
    )
  ) {
    return `Priority ${rule.priority} is already used by another ${rule.direction.toLowerCase()} rule.`;
  }
  if (existing.some((r) => r !== rule && r.name.toLowerCase() === rule.name.trim().toLowerCase())) {
    return "Another rule already has that name.";
  }
  return null;
}

/** A starting rule set that mirrors a typical, slightly over-permissive NSG. */
export const STARTER_RULES: NsgRule[] = [
  {
    name: "Allow-HTTPS-Inbound",
    priority: 100,
    direction: "Inbound",
    access: "Allow",
    protocol: "TCP",
    source: "Internet",
    sourcePort: "*",
    destination: "*",
    destinationPort: "443",
    description: "Public web traffic.",
  },
  {
    name: "Deny-RDP-From-Internet",
    priority: 200,
    direction: "Inbound",
    access: "Deny",
    protocol: "TCP",
    source: "Internet",
    sourcePort: "*",
    destination: "*",
    destinationPort: "3389",
    description: "Blocks RDP exposed to the internet.",
  },
  {
    name: "Allow-RDP-From-Management",
    priority: 300,
    direction: "Inbound",
    access: "Allow",
    protocol: "TCP",
    source: "10.20.9.0/24",
    sourcePort: "*",
    destination: "*",
    destinationPort: "3389",
    description: "Admin jump subnet only.",
  },
];

export const SAMPLE_FLOWS: { label: string; flow: Flow; teaches: string }[] = [
  {
    label: "RDP from the internet",
    flow: {
      direction: "Inbound",
      protocol: "TCP",
      sourceIp: "203.0.113.9",
      sourcePort: 51000,
      destinationIp: "10.20.1.10",
      destinationPort: 3389,
    },
    teaches: "The explicit deny at 200 stops this before the management allow at 300 is reached.",
  },
  {
    label: "RDP from the management subnet",
    flow: {
      direction: "Inbound",
      protocol: "TCP",
      sourceIp: "10.20.9.5",
      sourcePort: 51000,
      destinationIp: "10.20.1.10",
      destinationPort: 3389,
    },
    teaches:
      "The deny at 200 only covers the Internet tag, so a private source falls through to the allow at 300.",
  },
  {
    label: "HTTPS from the internet",
    flow: {
      direction: "Inbound",
      protocol: "TCP",
      sourceIp: "198.51.100.4",
      sourcePort: 44300,
      destinationIp: "10.20.1.10",
      destinationPort: 443,
    },
    teaches: "Matched by the allow at 100.",
  },
  {
    label: "SSH from the internet",
    flow: {
      direction: "Inbound",
      protocol: "TCP",
      sourceIp: "203.0.113.9",
      sourcePort: 51000,
      destinationIp: "10.20.1.10",
      destinationPort: 22,
    },
    teaches: "Nothing allows it, so DenyAllInBound at 65500 decides.",
  },
  {
    label: "Outbound to the internet",
    flow: {
      direction: "Outbound",
      protocol: "TCP",
      sourceIp: "10.20.1.10",
      sourcePort: 51000,
      destinationIp: "20.50.1.1",
      destinationPort: 443,
    },
    teaches: "AllowInternetOutBound permits this by default — outbound is open unless you close it.",
  },
];
