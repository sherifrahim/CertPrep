import { describe, expect, it } from "vitest";
import {
  SAMPLE_REQUESTS,
  SEVERITY_SCORE,
  conditionMatches,
  customRuleMatches,
  defaultPolicy,
  evaluateRequest,
  isExcluded,
  readVariable,
  type WafPolicy,
  type WafRequest,
} from "./waf";

const request = (over: Partial<WafRequest> = {}): WafRequest => ({
  method: "GET",
  uri: "/dashboard",
  queryString: "",
  body: "",
  headers: { Host: "portal.contoso.com", Accept: "text/html", "User-Agent": "Mozilla/5.0" },
  cookies: {},
  remoteAddr: "192.0.2.10",
  country: "AE",
  ...over,
});

const policy = (over: Partial<WafPolicy> = {}): WafPolicy => ({ ...defaultPolicy(), ...over });

const sample = (label: string) => SAMPLE_REQUESTS.find((s) => s.label === label)!.request;

describe("readVariable", () => {
  it("reads each part of the request the portal names", () => {
    const r = request({ queryString: "a=1", body: "hello", country: "GB" });
    expect(readVariable(r, "RequestMethod")).toBe("GET");
    expect(readVariable(r, "QueryString")).toBe("a=1");
    expect(readVariable(r, "RequestBody")).toBe("hello");
    expect(readVariable(r, "GeoLocation")).toBe("GB");
    expect(readVariable(r, "RequestHeaders")).toContain("User-Agent: Mozilla/5.0");
  });
});

describe("conditionMatches", () => {
  it("matches an address against a CIDR", () => {
    const c = {
      variable: "RemoteAddr" as const,
      operator: "IPMatch" as const,
      negate: false,
      values: ["203.0.113.0/24"],
      transforms: [],
    };
    expect(conditionMatches(request({ remoteAddr: "203.0.113.9" }), c)).toBe(true);
    expect(conditionMatches(request({ remoteAddr: "198.51.100.9" }), c)).toBe(false);
  });

  it("applies transforms before comparing", () => {
    const c = {
      variable: "QueryString" as const,
      operator: "Contains" as const,
      negate: false,
      values: ["../"],
      transforms: ["UrlDecode" as const],
    };
    expect(conditionMatches(request({ queryString: "path=%2e%2e%2f" }), c)).toBe(true);
    // Without the transform the encoded form does not match.
    expect(
      conditionMatches(request({ queryString: "path=%2e%2e%2f" }), { ...c, transforms: [] }),
    ).toBe(false);
  });

  it("inverts the result when negate is set", () => {
    const c = {
      variable: "GeoLocation" as const,
      operator: "GeoMatch" as const,
      negate: true,
      values: ["AE"],
      transforms: [],
    };
    expect(conditionMatches(request({ country: "AE" }), c)).toBe(false);
    expect(conditionMatches(request({ country: "RU" }), c)).toBe(true);
  });

  it("ANDs every condition on a rule", () => {
    const rule = {
      name: "two-conditions",
      priority: 1,
      ruleType: "MatchRule" as const,
      action: "Block" as const,
      enabled: true,
      conditions: [
        {
          variable: "RequestMethod" as const,
          operator: "Equal" as const,
          negate: false,
          values: ["POST"],
          transforms: [],
        },
        {
          variable: "RequestUri" as const,
          operator: "BeginsWith" as const,
          negate: false,
          values: ["/admin"],
          transforms: [],
        },
      ],
    };
    expect(customRuleMatches(request({ method: "POST", uri: "/admin/x" }), rule)).toBe(true);
    expect(customRuleMatches(request({ method: "GET", uri: "/admin/x" }), rule)).toBe(false);
    expect(customRuleMatches(request({ method: "POST", uri: "/public" }), rule)).toBe(false);
  });
});

describe("anomaly scoring", () => {
  // The heart of the topic: one match is usually not enough.
  it("does not block on a single Warning-level match", () => {
    const v = evaluateRequest(policy({ mode: "Prevention" }), sample("Scanner user agent only"));
    expect(v.totalScore).toBe(SEVERITY_SCORE.Warning);
    expect(v.totalScore).toBeLessThan(5);
    expect(v.wouldBlock).toBe(false);
    expect(v.action).toBe("Allowed");
  });

  it("blocks once two Warning matches cross the threshold", () => {
    const v = evaluateRequest(
      policy({ mode: "Prevention" }),
      sample("Scanner plus a restricted extension"),
    );
    expect(v.totalScore).toBe(6);
    expect(v.wouldBlock).toBe(true);
    expect(v.action).toBe("Blocked");
  });

  it("blocks on a single Critical match, which scores the threshold alone", () => {
    const v = evaluateRequest(
      policy({ mode: "Prevention" }),
      sample("SQL injection in the query string"),
    );
    expect(v.managedHits.some((h) => h.rule.ruleId === "942100")).toBe(true);
    expect(v.totalScore).toBeGreaterThanOrEqual(5);
    expect(v.action).toBe("Blocked");
  });

  it("respects a raised threshold", () => {
    const v = evaluateRequest(
      policy({ mode: "Prevention", anomalyThreshold: 10 }),
      sample("SQL injection in the query string"),
    );
    expect(v.wouldBlock).toBe(false);
    expect(v.action).toBe("Allowed");
  });
});

describe("mode", () => {
  // The single biggest trap in the topic.
  it("never blocks in Detection mode, however high the score", () => {
    const detection = evaluateRequest(
      policy({ mode: "Detection" }),
      sample("SQL injection in the query string"),
    );
    expect(detection.wouldBlock).toBe(true);
    expect(detection.action).toBe("Allowed");
    expect(detection.trace.some((s) => s.detail.includes("Detection never blocks"))).toBe(true);
  });

  it("blocks the same request in Prevention mode", () => {
    const prevention = evaluateRequest(
      policy({ mode: "Prevention" }),
      sample("SQL injection in the query string"),
    );
    expect(prevention.action).toBe("Blocked");
  });

  it("does not even evaluate when the policy is disabled", () => {
    const v = evaluateRequest(
      policy({ state: "Disabled", mode: "Prevention" }),
      sample("SQL injection in the query string"),
    );
    expect(v.action).toBe("Allowed");
    expect(v.managedHits).toEqual([]);
    expect(v.decidedBy).toContain("disabled");
  });
});

describe("custom rules", () => {
  it("run before managed rules and terminate on Block", () => {
    const v = evaluateRequest(policy({ mode: "Prevention" }), sample("Path traversal"));
    expect(v.customRuleHit?.name).toBe("block-known-scanner-range");
    expect(v.action).toBe("Blocked");
    // The traversal was never scored, because evaluation stopped first.
    expect(v.managedHits).toEqual([]);
  });

  // A custom Allow is a hole straight through the managed rule set.
  it("let a custom Allow bypass the entire managed rule set", () => {
    const v = evaluateRequest(policy({ mode: "Prevention" }), sample("XSS from a partner integration"));
    expect(v.customRuleHit?.name).toBe("allow-partner-integration");
    expect(v.action).toBe("Allowed");
    expect(v.wouldBlock).toBe(false);
    expect(v.managedHits).toEqual([]);
  });

  it("evaluates by priority, lowest number first", () => {
    const p = policy({
      mode: "Prevention",
      customRules: [
        {
          name: "late-block",
          priority: 50,
          ruleType: "MatchRule",
          action: "Block",
          enabled: true,
          conditions: [
            { variable: "RequestUri", operator: "BeginsWith", negate: false, values: ["/"], transforms: [] },
          ],
        },
        {
          name: "early-allow",
          priority: 5,
          ruleType: "MatchRule",
          action: "Allow",
          enabled: true,
          conditions: [
            { variable: "RequestUri", operator: "BeginsWith", negate: false, values: ["/"], transforms: [] },
          ],
        },
      ],
    });
    expect(evaluateRequest(p, request()).customRuleHit?.name).toBe("early-allow");
  });

  it("skips disabled custom rules", () => {
    const p = policy({ mode: "Prevention" });
    p.customRules = p.customRules.map((r) =>
      r.name === "block-known-scanner-range" ? { ...r, enabled: false } : r,
    );
    const v = evaluateRequest(p, sample("Path traversal"));
    expect(v.customRuleHit).toBeNull();
    // Now the managed rules get their turn and score the traversal.
    expect(v.managedHits.some((h) => h.rule.ruleId === "930100")).toBe(true);
  });

  it("does not let a single request trip a rate limit rule", () => {
    const v = evaluateRequest(policy({ mode: "Prevention" }), request({ uri: "/login" }));
    expect(v.customRuleHit).toBeNull();
    expect(v.trace.some((s) => s.detail.includes("rate limit rule"))).toBe(true);
  });
});

describe("managed rule toggles and exclusions", () => {
  it("skips a rule that has been disabled", () => {
    const p = policy({ mode: "Prevention" });
    for (const g of p.ruleGroups) {
      for (const r of g.rules) if (r.ruleId === "942100") r.enabled = false;
    }
    const v = evaluateRequest(p, sample("SQL injection in the query string"));
    expect(v.managedHits.some((h) => h.rule.ruleId === "942100")).toBe(false);
  });

  it("skips body rules when request body inspection is off", () => {
    const body = request({ body: "<script>alert(1)</script>" });
    const on = evaluateRequest(policy({ mode: "Prevention" }), body);
    const off = evaluateRequest(
      policy({ mode: "Prevention", requestBodyInspection: false }),
      body,
    );
    expect(on.managedHits.some((h) => h.rule.ruleId === "941110")).toBe(true);
    expect(off.managedHits.some((h) => h.rule.ruleId === "941110")).toBe(false);
  });

  it("removes only the excluded rule when rule ids are named", () => {
    const r = request({ headers: { Accept: "*/*", "x-debug-token": "sqlmap" } });
    const scoped = isExcluded(
      [
        {
          variable: "RequestHeaderNames",
          operator: "Equals",
          selector: "x-debug-token",
          ruleIds: ["913100"],
        },
      ],
      { ruleId: "913100" } as never,
      r,
    );
    const other = isExcluded(
      [
        {
          variable: "RequestHeaderNames",
          operator: "Equals",
          selector: "x-debug-token",
          ruleIds: ["913100"],
        },
      ],
      { ruleId: "942100" } as never,
      r,
    );
    expect(scoped).toBe(true);
    expect(other).toBe(false);
  });

  it("applies an exclusion to every rule when no ids are named", () => {
    const r = request({ headers: { Accept: "*/*", "x-debug-token": "x" } });
    expect(
      isExcluded(
        [
          {
            variable: "RequestHeaderNames",
            operator: "StartsWith",
            selector: "x-debug",
            ruleIds: [],
          },
        ],
        { ruleId: "999999" } as never,
        r,
      ),
    ).toBe(true);
  });
});

// The sample requests carry teaching copy, so the engine has to agree with it.
describe("sample requests behave as their explanations claim", () => {
  const detect = (label: string) => evaluateRequest(defaultPolicy(), sample(label));
  const prevent = (label: string) =>
    evaluateRequest(policy({ mode: "Prevention" }), sample(label));

  it("delivers the SQL injection in Detection and blocks it in Prevention", () => {
    expect(detect("SQL injection in the query string").action).toBe("Allowed");
    expect(prevent("SQL injection in the query string").action).toBe("Blocked");
  });

  it("leaves a lone scanner match below the threshold", () => {
    expect(prevent("Scanner user agent only").wouldBlock).toBe(false);
  });

  it("blocks the pair of Warning matches", () => {
    expect(prevent("Scanner plus a restricted extension").wouldBlock).toBe(true);
  });

  it("stops the traversal at the custom rule", () => {
    expect(prevent("Path traversal").customRuleHit?.action).toBe("Block");
  });

  it("waves the partner XSS straight through", () => {
    expect(prevent("XSS from a partner integration").action).toBe("Allowed");
  });

  it("scores ordinary traffic at zero", () => {
    const v = prevent("Ordinary traffic");
    expect(v.totalScore).toBe(0);
    expect(v.action).toBe("Allowed");
  });

  it("gives every sample an explanation", () => {
    for (const s of SAMPLE_REQUESTS) expect(s.teaches.length).toBeGreaterThan(20);
  });
});

describe("the default policy", () => {
  it("ships in Detection mode, as a new policy does", () => {
    expect(defaultPolicy().mode).toBe("Detection");
  });

  it("uses the product default threshold and body limits", () => {
    const p = defaultPolicy();
    expect(p.anomalyThreshold).toBe(5);
    expect(p.maxRequestBodySizeKb).toBe(128);
    expect(p.blockResponseStatusCode).toBe(403);
  });

  it("uses unique custom rule priorities", () => {
    const p = defaultPolicy();
    expect(new Set(p.customRules.map((r) => r.priority)).size).toBe(p.customRules.length);
  });

  it("gives every managed rule a unique id", () => {
    const ids = defaultPolicy().ruleGroups.flatMap((g) => g.rules.map((r) => r.ruleId));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
