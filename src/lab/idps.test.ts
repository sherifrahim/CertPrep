import { describe, expect, it } from "vitest";
import {
  DEFAULT_IDPS,
  EMPTY_SIGNATURE_FILTERS,
  SIGNATURES,
  effectiveMode,
  filterSignatures,
  inspect,
  matchingBypass,
  type IdpsConfig,
} from "./idps";
import type { Packet } from "./firewall";

const packet = (over: Partial<Packet> = {}): Packet => ({
  sourceIp: "10.20.1.44",
  destinationIp: "185.220.101.44",
  destinationPort: 443,
  protocol: "TCP",
  ...over,
});

const config = (over: Partial<IdpsConfig> = {}): IdpsConfig => ({
  mode: "Alert",
  overrides: [],
  bypass: [],
  privateRanges: DEFAULT_IDPS.privateRanges,
  ...over,
});

describe("effectiveMode", () => {
  const signature = SIGNATURES[0];

  it("falls back to the policy mode when there is no override", () => {
    const r = effectiveMode(signature, { mode: "Alert", overrides: [] });
    expect(r.mode).toBe("Alert");
    expect(r.overridden).toBe(false);
  });

  // The override is the point of the signature rules blade.
  it("lets an override beat the policy mode in both directions", () => {
    const stricter = effectiveMode(signature, {
      mode: "Alert",
      overrides: [{ signatureId: signature.id, mode: "Alert and deny" }],
    });
    const looser = effectiveMode(signature, {
      mode: "Alert and deny",
      overrides: [{ signatureId: signature.id, mode: "Off" }],
    });
    expect(stricter.mode).toBe("Alert and deny");
    expect(stricter.overridden).toBe(true);
    expect(looser.mode).toBe("Off");
  });

  it("only applies an override to its own signature", () => {
    const other = SIGNATURES[1];
    const r = effectiveMode(other, {
      mode: "Alert",
      overrides: [{ signatureId: SIGNATURES[0].id, mode: "Off" }],
    });
    expect(r.mode).toBe("Alert");
    expect(r.overridden).toBe(false);
  });
});

describe("inspect", () => {
  it("does nothing when the policy is off and nothing is overridden", () => {
    const v = inspect(config({ mode: "Off" }), packet());
    expect(v.hits).toEqual([]);
    expect(v.denied).toBe(false);
  });

  it("alerts without blocking in alert mode", () => {
    const v = inspect(config({ mode: "Alert" }), packet());
    expect(v.denied).toBe(false);
    expect(v.alerts.length).toBeGreaterThan(0);
    // The wording has to make clear that alerting is not protection.
    expect(v.summary).toContain("not protection");
  });

  it("blocks in alert and deny mode", () => {
    const v = inspect(config({ mode: "Alert and deny" }), packet());
    expect(v.denied).toBe(true);
    expect(v.summary).toContain("Blocked by signature");
  });

  it("blocks a single signature via an override while the policy only alerts", () => {
    const v = inspect(
      config({ mode: "Alert", overrides: [{ signatureId: 2033078, mode: "Alert and deny" }] }),
      packet(),
    );
    expect(v.denied).toBe(true);
    expect(v.summary).toContain("signature override");
  });

  it("silences one noisy signature without weakening the rest", () => {
    const strict = config({ mode: "Alert and deny" });
    const withOff = config({
      mode: "Alert and deny",
      overrides: [
        { signatureId: 2033078, mode: "Off" },
        { signatureId: 2027758, mode: "Off" },
      ],
    });
    expect(inspect(strict, packet()).denied).toBe(true);
    expect(inspect(withOff, packet()).denied).toBe(false);
    // Other traffic is still denied by the unchanged policy mode.
    expect(inspect(withOff, packet({ destinationIp: "1.2.3.4", destinationPort: 3333 })).denied).toBe(
      true,
    );
  });

  // The ordering trap: bypass wins over every override.
  it("skips signatures entirely when a bypass rule matches", () => {
    const cfg = config({
      mode: "Alert and deny",
      overrides: [{ signatureId: 2033078, mode: "Alert and deny" }],
      bypass: [
        {
          name: "allow-c2-oops",
          protocol: "Any",
          sourceAddresses: "10.20.0.0/16",
          destinationAddresses: "185.220.101.0/24",
          destinationPorts: "*",
        },
      ],
    });
    const v = inspect(cfg, packet());
    expect(v.denied).toBe(false);
    expect(v.bypassedBy?.name).toBe("allow-c2-oops");
    expect(v.hits).toEqual([]);
    expect(v.summary).toContain("before signatures");
  });

  it("reports cleanly when nothing matches", () => {
    const v = inspect(config({ mode: "Alert and deny" }), packet({
      destinationIp: "20.50.1.1",
      destinationPort: 8443,
    }));
    expect(v.hits).toEqual([]);
    expect(v.denied).toBe(false);
    expect(v.summary).toContain("No signature matched");
  });

  it("matches a phishing signature on hostname, including subdomains", () => {
    const apex = inspect(
      config({ mode: "Alert and deny" }),
      packet({ destinationIp: "104.18.1.1", destinationPort: 80, fqdn: "contoso-benefits.com" }),
    );
    const sub = inspect(
      config({ mode: "Alert and deny" }),
      packet({ destinationIp: "104.18.1.1", destinationPort: 80, fqdn: "login.contoso-benefits.com" }),
    );
    expect(apex.denied).toBe(true);
    expect(sub.denied).toBe(true);
  });

  it("does not match a lookalike hostname", () => {
    const v = inspect(
      config({ mode: "Alert and deny" }),
      packet({ destinationIp: "104.18.1.1", destinationPort: 8443, fqdn: "notcontoso-benefits.com" }),
    );
    expect(v.hits.some((h) => h.signature.id === 2019401)).toBe(false);
  });

  it("lets one denying signature outrank several alerting ones", () => {
    const cfg = config({
      mode: "Alert",
      overrides: [{ signatureId: 2027758, mode: "Alert and deny" }],
    });
    const v = inspect(cfg, packet());
    expect(v.hits.length).toBeGreaterThan(1);
    expect(v.denied).toBe(true);
  });
});

describe("matchingBypass", () => {
  it("respects protocol, addresses and ports together", () => {
    const cfg = config({
      bypass: [
        {
          name: "smb-only",
          protocol: "TCP",
          sourceAddresses: "10.20.0.0/16",
          destinationAddresses: "10.40.0.0/16",
          destinationPorts: "445",
        },
      ],
    });
    expect(matchingBypass(cfg, packet({ destinationIp: "10.40.2.5", destinationPort: 445 }))).not.toBeNull();
    expect(matchingBypass(cfg, packet({ destinationIp: "10.40.2.5", destinationPort: 443 }))).toBeNull();
    expect(
      matchingBypass(cfg, packet({ destinationIp: "10.40.2.5", destinationPort: 445, protocol: "UDP" })),
    ).toBeNull();
  });

  it("returns null when the bypass list is empty", () => {
    expect(matchingBypass(config(), packet())).toBeNull();
  });
});

describe("filterSignatures", () => {
  const cfg = { mode: "Alert" as const, overrides: [] };

  it("returns everything with no filters applied", () => {
    expect(filterSignatures(SIGNATURES, EMPTY_SIGNATURE_FILTERS, cfg)).toHaveLength(
      SIGNATURES.length,
    );
  });

  it("searches by signature id and by description text", () => {
    expect(
      filterSignatures(SIGNATURES, { ...EMPTY_SIGNATURE_FILTERS, search: "2033078" }, cfg),
    ).toHaveLength(1);
    const byText = filterSignatures(
      SIGNATURES,
      { ...EMPTY_SIGNATURE_FILTERS, search: "coinminer" },
      cfg,
    );
    expect(byText.length).toBeGreaterThan(0);
  });

  it("filters by group and severity", () => {
    const high = filterSignatures(SIGNATURES, { ...EMPTY_SIGNATURE_FILTERS, severity: "High" }, cfg);
    expect(high.every((s) => s.severity === "High")).toBe(true);

    const phishing = filterSignatures(
      SIGNATURES,
      { ...EMPTY_SIGNATURE_FILTERS, group: "Phishing" },
      cfg,
    );
    expect(phishing.every((s) => s.group === "Phishing")).toBe(true);
  });

  it("filters by the effective mode, not the policy mode", () => {
    const withOverride = {
      mode: "Alert" as const,
      overrides: [{ signatureId: 2033078, mode: "Off" as const }],
    };
    const off = filterSignatures(
      SIGNATURES,
      { ...EMPTY_SIGNATURE_FILTERS, mode: "Off" },
      withOverride,
    );
    expect(off).toHaveLength(1);
    expect(off[0].id).toBe(2033078);
  });
});

describe("the signature set", () => {
  it("uses unique ids", () => {
    expect(new Set(SIGNATURES.map((s) => s.id)).size).toBe(SIGNATURES.length);
  });

  it("gives every signature a usable match condition", () => {
    for (const s of SIGNATURES) {
      expect(Object.keys(s.match).length, `${s.id} matches nothing`).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(10);
    }
  });

  it("can detect the lab's own intrusion", () => {
    const v = inspect(config({ mode: "Alert and deny" }), packet());
    expect(v.hits.some((h) => h.signature.group === "Malware Command and Control")).toBe(true);
  });
});
