import { describe, expect, it } from "vitest";
import {
  SAMPLE_PACKETS,
  STARTER_POLICY,
  evaluatePacket,
  evaluationOrder,
  fqdnMatches,
  type Packet,
  type RuleCollection,
} from "./firewall";

const packet = (over: Partial<Packet> = {}): Packet => ({
  sourceIp: "10.20.1.10",
  destinationIp: "23.53.1.1",
  destinationPort: 443,
  protocol: "TCP",
  ...over,
});

describe("fqdnMatches", () => {
  it("matches an exact name", () => {
    expect(fqdnMatches("registry.npmjs.org", "registry.npmjs.org")).toBe(true);
    expect(fqdnMatches("registry.npmjs.org", "evil.npmjs.org")).toBe(false);
  });

  it("matches subdomains under a leading wildcard", () => {
    expect(fqdnMatches("*.windowsupdate.com", "download.windowsupdate.com")).toBe(true);
    expect(fqdnMatches("*.windowsupdate.com", "a.b.windowsupdate.com")).toBe(true);
  });

  // The apex needs its own entry, which is why allow-lists so often half-work.
  it("does not match the apex domain under a wildcard", () => {
    expect(fqdnMatches("*.windowsupdate.com", "windowsupdate.com")).toBe(false);
  });

  it("does not match a lookalike suffix", () => {
    expect(fqdnMatches("*.contoso.com", "evilcontoso.com")).toBe(false);
    expect(fqdnMatches("*.contoso.com", "contoso.com.attacker.net")).toBe(false);
  });

  it("is case insensitive", () => {
    expect(fqdnMatches("*.Microsoft.COM", "Download.microsoft.com")).toBe(true);
  });
});

describe("evaluationOrder", () => {
  // Type order outranks every priority number, which is the whole trap.
  it("puts DNAT before network and network before application", () => {
    const order = evaluationOrder(STARTER_POLICY).map((c) => c.type);
    expect(order).toEqual(["DNAT", "Network", "Network", "Application"]);
  });

  it("ignores priority when the types differ", () => {
    const collections: RuleCollection[] = [
      {
        name: "app-first-by-number",
        type: "Application",
        action: "Allow",
        priority: 100,
        groupName: "g",
        groupPriority: 100,
        applicationRules: [],
      },
      {
        name: "network-last-by-number",
        type: "Network",
        action: "Deny",
        priority: 60000,
        groupName: "g",
        groupPriority: 60000,
        networkRules: [],
      },
    ];
    expect(evaluationOrder(collections).map((c) => c.name)).toEqual([
      "network-last-by-number",
      "app-first-by-number",
    ]);
  });

  it("orders by group priority then collection priority within a type", () => {
    const order = evaluationOrder(STARTER_POLICY)
      .filter((c) => c.type === "Network")
      .map((c) => c.name);
    expect(order).toEqual(["block-known-bad", "allow-infra"]);
  });
});

describe("evaluatePacket", () => {
  it("denies on threat intelligence before any rule is consulted", () => {
    const v = evaluatePacket(STARTER_POLICY, packet({ destinationIp: "185.220.101.44" }));
    expect(v.action).toBe("Deny");
    expect(v.decidedBy).toBe("Threat intelligence");
    // Nothing after the threat intel step ran.
    expect(v.trace).toHaveLength(1);
  });

  it("falls through to the deny rule when threat intel is alert only", () => {
    const v = evaluatePacket(
      STARTER_POLICY,
      packet({ destinationIp: "185.220.101.44" }),
      "Alert only",
    );
    expect(v.action).toBe("Deny");
    expect(v.decidedBy).toBe("block-known-bad / deny-c2-range");
  });

  it("skips threat intelligence entirely when it is off", () => {
    const v = evaluatePacket(STARTER_POLICY, packet({ destinationIp: "185.220.101.44" }), "Off");
    expect(v.trace.some((s) => s.stage === "Threat intelligence")).toBe(false);
    expect(v.decidedBy).toBe("block-known-bad / deny-c2-range");
  });

  it("translates and implicitly allows on a DNAT match", () => {
    const v = evaluatePacket(
      STARTER_POLICY,
      packet({ sourceIp: "203.0.113.40", destinationIp: "20.90.10.5", destinationPort: 3389 }),
    );
    expect(v.action).toBe("Allow");
    expect(v.translatedTo).toBe("10.20.9.4:3389");
  });

  it("denies the published port from outside the DNAT source range", () => {
    const v = evaluatePacket(
      STARTER_POLICY,
      packet({ sourceIp: "198.51.100.7", destinationIp: "20.90.10.5", destinationPort: 3389 }),
    );
    expect(v.action).toBe("Deny");
    expect(v.decidedBy).toBe("Default deny");
  });

  it("reaches the application rules when no network rule matches", () => {
    const v = evaluatePacket(STARTER_POLICY, packet({ fqdn: "registry.npmjs.org" }));
    expect(v.action).toBe("Allow");
    expect(v.decidedBy).toBe("allow-approved-sites / package-feeds");
  });

  // The lesson: a broad network allow silently disables your FQDN allow-list.
  it("lets a network rule pre-empt the application rules for the same request", () => {
    const viaApp = evaluatePacket(
      STARTER_POLICY,
      packet({ sourceIp: "10.20.1.10", fqdn: "registry.npmjs.org" }),
    );
    const viaNetwork = evaluatePacket(
      STARTER_POLICY,
      packet({ sourceIp: "10.20.5.10", fqdn: "registry.npmjs.org" }),
    );

    expect(viaApp.decidedBy).toContain("package-feeds");
    expect(viaNetwork.decidedBy).toBe("allow-infra / allow-web-any");
    // Both are allowed, but only one of them applied the FQDN restriction.
    expect(viaNetwork.action).toBe("Allow");
    expect(viaNetwork.trace.some((s) => s.stage === "Application")).toBe(false);
  });

  it("denies a hostname that no application rule targets", () => {
    const v = evaluatePacket(STARTER_POLICY, packet({ fqdn: "pastebin.com" }));
    expect(v.action).toBe("Deny");
    expect(v.decidedBy).toBe("Default deny");
  });

  it("cannot allow traffic with no hostname through an application rule", () => {
    const v = evaluatePacket(STARTER_POLICY, packet({ destinationPort: 8443 }));
    expect(v.action).toBe("Deny");
    expect(
      v.trace.find((s) => s.stage === "Application")?.reason.includes("No hostname"),
    ).toBe(true);
  });

  it("records every step it took", () => {
    const v = evaluatePacket(STARTER_POLICY, packet({ fqdn: "pastebin.com" }));
    for (const step of v.trace) expect(step.reason.length).toBeGreaterThan(0);
    expect(v.trace.at(-1)?.stage).toBe("Default");
  });

  it("matches a network rule on protocol as well as address", () => {
    // allow-ntp is UDP only, so the same port over TCP is not covered by it.
    const udp = evaluatePacket(
      STARTER_POLICY,
      packet({ sourceIp: "10.20.1.10", destinationPort: 123, protocol: "UDP" }),
    );
    const tcp = evaluatePacket(
      STARTER_POLICY,
      packet({ sourceIp: "10.20.1.10", destinationPort: 123, protocol: "TCP" }),
    );
    expect(udp.decidedBy).toBe("allow-infra / allow-ntp");
    expect(tcp.action).toBe("Deny");
  });
});

// The sample packets carry teaching copy; if the engine disagrees with the
// copy, the copy is what learners will believe.
describe("sample packets behave as their explanations claim", () => {
  const verdict = (label: string) => {
    const sample = SAMPLE_PACKETS.find((s) => s.label === label)!;
    return evaluatePacket(STARTER_POLICY, sample.packet);
  };

  it("allows web browsing from the app subnet by FQDN", () => {
    expect(verdict("Web browsing from the app subnet").decidedBy).toBe(
      "allow-approved-sites / package-feeds",
    );
  });

  it("allows the same request from the web subnet by address instead", () => {
    expect(verdict("The same request from the web subnet").decidedBy).toBe(
      "allow-infra / allow-web-any",
    );
  });

  it("denies the command-and-control connection on threat intelligence", () => {
    expect(verdict("Connection to the command-and-control address").decidedBy).toBe(
      "Threat intelligence",
    );
  });

  it("translates published RDP from the corporate range", () => {
    expect(verdict("Published RDP from the corporate range").translatedTo).toBe("10.20.9.4:3389");
  });

  it("denies published RDP from anywhere else", () => {
    expect(verdict("Published RDP from anywhere else").action).toBe("Deny");
  });

  it("denies a site outside the allow-list", () => {
    expect(verdict("A blocked site over HTTPS").action).toBe("Deny");
  });

  it("gives every sample an explanation", () => {
    for (const s of SAMPLE_PACKETS) expect(s.teaches.length).toBeGreaterThan(20);
  });
});
