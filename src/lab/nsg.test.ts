import { describe, expect, it } from "vitest";
import {
  DEFAULT_RULES,
  STARTER_RULES,
  SAMPLE_FLOWS,
  addressMatches,
  evaluateFlow,
  portMatches,
  validateRule,
  type Flow,
  type NsgRule,
} from "./nsg";

const inbound = (over: Partial<Flow> = {}): Flow => ({
  direction: "Inbound",
  protocol: "TCP",
  sourceIp: "203.0.113.9",
  sourcePort: 50000,
  destinationIp: "10.20.1.10",
  destinationPort: 3389,
  ...over,
});

describe("addressMatches", () => {
  it("treats * and Any as everything", () => {
    expect(addressMatches("*", "8.8.8.8")).toBe(true);
    expect(addressMatches("Any", "10.20.1.1")).toBe(true);
  });

  it("resolves the VirtualNetwork tag against the vnet space", () => {
    expect(addressMatches("VirtualNetwork", "10.20.4.9")).toBe(true);
    expect(addressMatches("VirtualNetwork", "10.99.0.1")).toBe(false);
    expect(addressMatches("VirtualNetwork", "203.0.113.1")).toBe(false);
  });

  // The single most misunderstood point: Internet excludes private space.
  it("resolves the Internet tag to public addresses only", () => {
    expect(addressMatches("Internet", "203.0.113.1")).toBe(true);
    expect(addressMatches("Internet", "10.20.1.5")).toBe(false);
    expect(addressMatches("Internet", "192.168.1.5")).toBe(false);
    expect(addressMatches("Internet", "172.16.4.4")).toBe(false);
  });

  it("resolves the AzureLoadBalancer tag to the platform address", () => {
    expect(addressMatches("AzureLoadBalancer", "168.63.129.16")).toBe(true);
    expect(addressMatches("AzureLoadBalancer", "10.20.1.1")).toBe(false);
  });

  it("matches CIDR prefixes and exact addresses", () => {
    expect(addressMatches("10.20.9.0/24", "10.20.9.7")).toBe(true);
    expect(addressMatches("10.20.9.0/24", "10.20.10.7")).toBe(false);
    expect(addressMatches("10.20.1.10", "10.20.1.10")).toBe(true);
    expect(addressMatches("10.20.1.10", "10.20.1.11")).toBe(false);
  });

  it("matches any prefix in a comma-separated list", () => {
    expect(addressMatches("10.20.1.0/24, 10.20.2.0/24", "10.20.2.5")).toBe(true);
    expect(addressMatches("10.20.1.0/24, 10.20.2.0/24", "10.20.3.5")).toBe(false);
  });

  it("handles /32 and /0 correctly", () => {
    expect(addressMatches("10.20.1.10/32", "10.20.1.10")).toBe(true);
    expect(addressMatches("10.20.1.10/32", "10.20.1.11")).toBe(false);
    expect(addressMatches("0.0.0.0/0", "8.8.8.8")).toBe(true);
  });
});

describe("portMatches", () => {
  it("matches wildcards, singles, ranges and lists", () => {
    expect(portMatches("*", 3389)).toBe(true);
    expect(portMatches("3389", 3389)).toBe(true);
    expect(portMatches("3389", 22)).toBe(false);
    expect(portMatches("1000-2000", 1500)).toBe(true);
    expect(portMatches("1000-2000", 2001)).toBe(false);
    expect(portMatches("80,443,8080", 443)).toBe(true);
    expect(portMatches("80,443,8080", 444)).toBe(false);
  });

  it("includes both ends of a range", () => {
    expect(portMatches("100-200", 100)).toBe(true);
    expect(portMatches("100-200", 200)).toBe(true);
  });
});

describe("evaluateFlow", () => {
  it("denies anything no rule allows, via the default deny", () => {
    const r = evaluateFlow([], inbound({ destinationPort: 22 }));
    expect(r.allowed).toBe(false);
    expect(r.matchedRule.name).toBe("DenyAllInBound");
  });

  it("allows outbound internet by default", () => {
    const r = evaluateFlow([], {
      direction: "Outbound",
      protocol: "TCP",
      sourceIp: "10.20.1.10",
      sourcePort: 50000,
      destinationIp: "20.50.1.1",
      destinationPort: 443,
    });
    expect(r.allowed).toBe(true);
    expect(r.matchedRule.name).toBe("AllowInternetOutBound");
  });

  it("allows vnet-internal traffic by default", () => {
    const r = evaluateFlow([], inbound({ sourceIp: "10.20.5.5", destinationPort: 445 }));
    expect(r.allowed).toBe(true);
    expect(r.matchedRule.name).toBe("AllowVnetInBound");
  });

  // The core lesson: lowest matching priority wins, not lowest priority.
  it("takes the lowest-numbered rule that actually matches", () => {
    const r = evaluateFlow(STARTER_RULES, inbound());
    expect(r.allowed).toBe(false);
    expect(r.matchedRule.name).toBe("Deny-RDP-From-Internet");
    expect(r.matchedRule.priority).toBe(200);
  });

  it("skips a lower-numbered rule that does not match the source", () => {
    // Same port, but from the management subnet: the Internet-scoped deny is skipped.
    const r = evaluateFlow(STARTER_RULES, inbound({ sourceIp: "10.20.9.5" }));
    expect(r.allowed).toBe(true);
    expect(r.matchedRule.name).toBe("Allow-RDP-From-Management");
  });

  it("stops at the first match and does not consider later rules", () => {
    const rules: NsgRule[] = [
      { ...STARTER_RULES[1], priority: 100 },
      { ...STARTER_RULES[2], priority: 110, source: "*" },
    ];
    const r = evaluateFlow(rules, inbound());
    expect(r.allowed).toBe(false);
    const matchedIndex = r.trace.findIndex((t) => t.matched);
    expect(matchedIndex).toBe(0);
    expect(r.trace.slice(matchedIndex + 1)).toHaveLength(0);
  });

  it("ignores rules in the other direction", () => {
    const outboundOnly: NsgRule[] = [
      { ...STARTER_RULES[0], direction: "Outbound", access: "Deny", priority: 100 },
    ];
    const r = evaluateFlow(outboundOnly, inbound({ destinationPort: 443 }));
    expect(r.matchedRule.direction).toBe("Inbound");
  });

  it("respects protocol on the rule", () => {
    const udpOnly: NsgRule[] = [
      { ...STARTER_RULES[0], protocol: "UDP", destinationPort: "443", access: "Allow", priority: 100 },
    ];
    const r = evaluateFlow(udpOnly, inbound({ destinationPort: 443 }));
    expect(r.matchedRule.name).not.toBe(udpOnly[0].name);
  });

  it("evaluates custom rules before the default deny", () => {
    const allowSsh: NsgRule[] = [
      { ...STARTER_RULES[0], name: "Allow-SSH", priority: 4000, destinationPort: "22" },
    ];
    const r = evaluateFlow(allowSsh, inbound({ destinationPort: 22 }));
    expect(r.allowed).toBe(true);
    expect(r.matchedRule.priority).toBe(4000);
  });

  it("explains why each skipped rule did not apply", () => {
    const r = evaluateFlow(STARTER_RULES, inbound());
    const skipped = r.trace.find((t) => t.rule.name === "Allow-HTTPS-Inbound");
    expect(skipped?.matched).toBe(false);
    expect(skipped?.reason).toContain("443");
  });

  it("orders the trace by priority", () => {
    const r = evaluateFlow(STARTER_RULES, inbound({ destinationPort: 8080 }));
    const priorities = r.trace.map((t) => t.rule.priority);
    expect([...priorities].sort((a, b) => a - b)).toEqual(priorities);
  });

  it("agrees with the explanation on every sample flow", () => {
    for (const sample of SAMPLE_FLOWS) {
      const r = evaluateFlow(STARTER_RULES, sample.flow);
      expect(r.matchedRule, sample.label).toBeTruthy();
      // Every sample must resolve to a real rule, not fall off the end.
      expect(r.trace.some((t) => t.matched), sample.label).toBe(true);
    }
  });
});

describe("validateRule", () => {
  const base: NsgRule = { ...STARTER_RULES[0], name: "New-Rule", priority: 500 };

  it("accepts a well-formed rule", () => {
    expect(validateRule(base, STARTER_RULES)).toBeNull();
  });

  it("requires a name", () => {
    expect(validateRule({ ...base, name: "  " }, [])).toMatch(/name/i);
  });

  it("enforces the 100 to 4096 priority range", () => {
    expect(validateRule({ ...base, priority: 99 }, [])).toMatch(/100 and 4096/);
    expect(validateRule({ ...base, priority: 4097 }, [])).toMatch(/100 and 4096/);
    expect(validateRule({ ...base, priority: 100 }, [])).toBeNull();
    expect(validateRule({ ...base, priority: 4096 }, [])).toBeNull();
  });

  it("rejects a duplicate priority in the same direction", () => {
    expect(validateRule({ ...base, priority: 200 }, STARTER_RULES)).toMatch(/already used/);
  });

  it("allows the same priority in the opposite direction", () => {
    expect(
      validateRule({ ...base, priority: 200, direction: "Outbound" }, STARTER_RULES),
    ).toBeNull();
  });

  it("rejects a duplicate name", () => {
    expect(validateRule({ ...base, name: "Allow-HTTPS-Inbound" }, STARTER_RULES)).toMatch(/name/i);
  });
});

describe("default rules", () => {
  it("provides the three inbound and three outbound platform rules", () => {
    expect(DEFAULT_RULES.filter((r) => r.direction === "Inbound")).toHaveLength(3);
    expect(DEFAULT_RULES.filter((r) => r.direction === "Outbound")).toHaveLength(3);
    expect(DEFAULT_RULES.every((r) => r.isDefault)).toBe(true);
  });

  it("numbers them above the custom range so custom rules always win", () => {
    for (const r of DEFAULT_RULES) expect(r.priority).toBeGreaterThan(4096);
  });
});
