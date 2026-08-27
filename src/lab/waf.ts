/**
 * Web Application Firewall policy, as attached to an Application Gateway.
 *
 * WAF is not part of Azure Firewall — it is its own resource type, and putting
 * it in the firewall blade would teach the wrong mental model.
 *
 * Three behaviours are modelled because they are the ones that decide real
 * outcomes and are reliably misremembered:
 *
 *  1. **Detection mode never blocks.** Not managed rules, not a custom rule
 *     whose action is Block. Everything is logged and delivered. A policy can
 *     be full of Block rules and stop nothing.
 *  2. **Managed rules use anomaly scoring**, not one-match-one-block. Each
 *     matched rule contributes its severity's score, and the request is only
 *     blocked once the total reaches the threshold. One Warning-level match
 *     usually does nothing on its own.
 *  3. **Custom rules run before managed rules**, in priority order, and the
 *     first match is terminating — so a custom Allow at priority 10 lets a
 *     request straight past the entire managed rule set.
 */

export type WafMode = "Detection" | "Prevention";
export type WafState = "Enabled" | "Disabled";

/** CRS severities and the anomaly score each contributes. */
export type RuleSeverity = "Critical" | "Error" | "Warning" | "Notice";

export const SEVERITY_SCORE: Record<RuleSeverity, number> = {
  Critical: 5,
  Error: 4,
  Warning: 3,
  Notice: 2,
};

/** The request as the gateway sees it. */
export type WafRequest = {
  method: string;
  uri: string;
  queryString: string;
  body: string;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  remoteAddr: string;
  country: string;
};

/* ------------------------------------------------------- managed rules */

/** The match variables the portal offers, named as it names them. */
export type MatchVariable =
  | "RemoteAddr"
  | "RequestMethod"
  | "QueryString"
  | "PostArgs"
  | "RequestUri"
  | "RequestHeaders"
  | "RequestBody"
  | "RequestCookies"
  | "GeoLocation";

export type ManagedRule = {
  ruleId: string;
  description: string;
  severity: RuleSeverity;
  enabled: boolean;
  /** Which part of the request this rule reads. */
  variable: MatchVariable;
  /** Case-insensitive pattern applied to that part. */
  pattern: RegExp;
};

export type ManagedRuleGroup = {
  name: string;
  description: string;
  rules: ManagedRule[];
};

export type RuleSetName =
  | "OWASP 3.2"
  | "OWASP 3.1"
  | "Microsoft_DefaultRuleSet 2.1"
  | "Microsoft_BotManagerRuleSet 1.0";

export const RULE_SETS: RuleSetName[] = [
  "OWASP 3.2",
  "OWASP 3.1",
  "Microsoft_DefaultRuleSet 2.1",
  "Microsoft_BotManagerRuleSet 1.0",
];

/** A representative slice of CRS, with the real rule ids and group names. */
export function defaultRuleGroups(): ManagedRuleGroup[] {
  return [
    {
      name: "REQUEST-911-METHOD-ENFORCEMENT",
      description: "Restricts the HTTP methods the application accepts.",
      rules: [
        {
          ruleId: "911100",
          description: "Method is not allowed by policy",
          severity: "Critical",
          enabled: true,
          variable: "RequestMethod",
          pattern: /^(TRACE|TRACK|CONNECT)$/i,
        },
      ],
    },
    {
      name: "REQUEST-913-SCANNER-DETECTION",
      description: "Identifies traffic from vulnerability scanners and crawlers.",
      rules: [
        {
          ruleId: "913100",
          description: "Found User-Agent associated with security scanner",
          severity: "Warning",
          enabled: true,
          variable: "RequestHeaders",
          pattern: /(nikto|sqlmap|nmap|masscan|nessus|acunetix)/i,
        },
        {
          ruleId: "913110",
          description: "Found request header associated with security scanner",
          severity: "Warning",
          enabled: true,
          variable: "RequestHeaders",
          pattern: /x-scanner/i,
        },
      ],
    },
    {
      name: "REQUEST-920-PROTOCOL-ENFORCEMENT",
      description: "Enforces HTTP protocol correctness.",
      rules: [
        {
          ruleId: "920300",
          description: "Request missing an Accept header",
          severity: "Notice",
          enabled: true,
          variable: "RequestHeaders",
          // [\s\S] rather than . because the header blob is multi-line, and a
          // dot-based lookahead would stop at the first newline and never fire.
          pattern: /^(?![\s\S]*accept:)[\s\S]*$/i,
        },
        {
          ruleId: "920440",
          description: "URL file extension is restricted by policy",
          severity: "Warning",
          enabled: true,
          variable: "RequestUri",
          pattern: /\.(bak|config|ini|log|sql)(\?|$)/i,
        },
      ],
    },
    {
      name: "REQUEST-930-APPLICATION-ATTACK-LFI",
      description: "Local file inclusion and path traversal.",
      rules: [
        {
          ruleId: "930100",
          description: "Path traversal attack (/../)",
          severity: "Critical",
          enabled: true,
          variable: "RequestUri",
          pattern: /(\.\.\/|\.\.\\|%2e%2e%2f)/i,
        },
        {
          ruleId: "930120",
          description: "OS file access attempt",
          severity: "Critical",
          enabled: true,
          variable: "RequestUri",
          pattern: /(\/etc\/passwd|\/etc\/shadow|win\.ini)/i,
        },
      ],
    },
    {
      name: "REQUEST-932-APPLICATION-ATTACK-RCE",
      description: "Remote command execution.",
      rules: [
        {
          ruleId: "932100",
          description: "Remote command execution: Unix command injection",
          severity: "Critical",
          enabled: true,
          variable: "QueryString",
          pattern: /(;|\||`|\$\()\s*(cat|wget|curl|nc|bash|sh)\b/i,
        },
        {
          ruleId: "932150",
          description: "Remote command execution: direct Unix command execution",
          severity: "Critical",
          enabled: true,
          variable: "RequestBody",
          pattern: /\b(whoami|uname\s+-a|id\s*;)\b/i,
        },
      ],
    },
    {
      name: "REQUEST-941-APPLICATION-ATTACK-XSS",
      description: "Cross-site scripting.",
      rules: [
        {
          ruleId: "941100",
          description: "XSS attack detected via libinjection",
          severity: "Critical",
          enabled: true,
          variable: "QueryString",
          pattern: /(<script|javascript:|onerror\s*=|onload\s*=)/i,
        },
        {
          ruleId: "941110",
          description: "XSS filter — category 1: script tag vector",
          severity: "Critical",
          enabled: true,
          variable: "RequestBody",
          pattern: /<script[^>]*>/i,
        },
      ],
    },
    {
      name: "REQUEST-942-APPLICATION-ATTACK-SQLI",
      description: "SQL injection.",
      rules: [
        {
          ruleId: "942100",
          description: "SQL injection attack detected via libinjection",
          severity: "Critical",
          enabled: true,
          variable: "QueryString",
          pattern: /('|%27)\s*(or|and)\s*('|%27)?\d|union\s+select|;\s*drop\s+table/i,
        },
        {
          ruleId: "942190",
          description: "Detects MSSQL code execution and information gathering attempts",
          severity: "Error",
          enabled: true,
          variable: "QueryString",
          pattern: /(xp_cmdshell|sp_executesql|waitfor\s+delay)/i,
        },
      ],
    },
  ];
}

/* -------------------------------------------------------- custom rules */

export type CustomRuleAction = "Allow" | "Block" | "Log";
export type CustomRuleType = "MatchRule" | "RateLimitRule";

export type MatchOperator =
  | "IPMatch"
  | "Equal"
  | "Contains"
  | "BeginsWith"
  | "EndsWith"
  | "Regex"
  | "GeoMatch"
  | "Any";

export type MatchCondition = {
  variable: MatchVariable;
  operator: MatchOperator;
  negate: boolean;
  values: string[];
  /** Applied to the request value before comparison, as the portal offers. */
  transforms: ("Lowercase" | "Trim" | "UrlDecode" | "RemoveNulls")[];
};

export type CustomRule = {
  name: string;
  /** 1–100. Lower numbers are evaluated first. */
  priority: number;
  ruleType: CustomRuleType;
  action: CustomRuleAction;
  conditions: MatchCondition[];
  /** Rate limit rules only. */
  rateLimitThreshold?: number;
  rateLimitDurationMinutes?: 1 | 5;
  enabled: boolean;
};

/* ------------------------------------------------------------ exclusions */

export type Exclusion = {
  variable:
    | "RequestHeaderNames"
    | "RequestCookieNames"
    | "RequestArgNames"
    | "RequestArgValues";
  operator: "Equals" | "StartsWith" | "EndsWith" | "Contains";
  selector: string;
  /** Empty means the exclusion applies to every managed rule. */
  ruleIds: string[];
};

/* --------------------------------------------------------------- policy */

export type WafPolicy = {
  name: string;
  state: WafState;
  mode: WafMode;
  ruleSet: RuleSetName;
  /** CRS anomaly threshold. 5 is the product default. */
  anomalyThreshold: number;
  requestBodyInspection: boolean;
  /** 8–128 KB. */
  maxRequestBodySizeKb: number;
  fileUploadLimitMb: number;
  blockResponseStatusCode: number;
  ruleGroups: ManagedRuleGroup[];
  customRules: CustomRule[];
  exclusions: Exclusion[];
};

export function defaultPolicy(): WafPolicy {
  return {
    name: "wafpol-contoso-portal",
    state: "Enabled",
    mode: "Detection",
    ruleSet: "OWASP 3.2",
    anomalyThreshold: 5,
    requestBodyInspection: true,
    maxRequestBodySizeKb: 128,
    fileUploadLimitMb: 100,
    blockResponseStatusCode: 403,
    ruleGroups: defaultRuleGroups(),
    customRules: [
      {
        name: "block-known-scanner-range",
        priority: 10,
        ruleType: "MatchRule",
        action: "Block",
        enabled: true,
        conditions: [
          {
            variable: "RemoteAddr",
            operator: "IPMatch",
            negate: false,
            values: ["203.0.113.0/24"],
            transforms: [],
          },
        ],
      },
      {
        name: "allow-partner-integration",
        priority: 20,
        ruleType: "MatchRule",
        action: "Allow",
        enabled: true,
        conditions: [
          {
            variable: "RequestHeaders",
            operator: "Contains",
            negate: false,
            values: ["x-partner-key"],
            transforms: ["Lowercase"],
          },
        ],
      },
      {
        name: "rate-limit-login",
        priority: 30,
        ruleType: "RateLimitRule",
        action: "Block",
        enabled: true,
        rateLimitThreshold: 100,
        rateLimitDurationMinutes: 1,
        conditions: [
          {
            variable: "RequestUri",
            operator: "BeginsWith",
            negate: false,
            values: ["/login"],
            transforms: ["Lowercase"],
          },
        ],
      },
    ],
    exclusions: [],
  };
}

/* ------------------------------------------------------------ evaluation */

function headerBlob(request: WafRequest): string {
  return Object.entries(request.headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function cookieBlob(request: WafRequest): string {
  return Object.entries(request.cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

export function readVariable(request: WafRequest, variable: MatchVariable): string {
  switch (variable) {
    case "RemoteAddr":
      return request.remoteAddr;
    case "RequestMethod":
      return request.method;
    case "QueryString":
      return request.queryString;
    case "RequestUri":
      return request.uri;
    case "RequestBody":
    case "PostArgs":
      return request.body;
    case "RequestHeaders":
      return headerBlob(request);
    case "RequestCookies":
      return cookieBlob(request);
    case "GeoLocation":
      return request.country;
  }
}

function applyTransforms(value: string, transforms: MatchCondition["transforms"]): string {
  return transforms.reduce((v, t) => {
    switch (t) {
      case "Lowercase":
        return v.toLowerCase();
      case "Trim":
        return v.trim();
      case "UrlDecode":
        try {
          return decodeURIComponent(v);
        } catch {
          return v;
        }
      case "RemoveNulls":
        return v.replace(/\0/g, "");
    }
  }, value);
}

function ipInCidr(ip: string, cidr: string): boolean {
  const toLong = (a: string): number | null => {
    const p = a.trim().split(".");
    if (p.length !== 4) return null;
    let out = 0;
    for (const part of p) {
      const n = Number(part);
      if (!Number.isInteger(n) || n < 0 || n > 255) return null;
      out = out * 256 + n;
    }
    return out;
  };
  const [base, bitsRaw] = cidr.split("/");
  const bits = bitsRaw === undefined ? 32 : Number(bitsRaw);
  const a = toLong(ip);
  const b = toLong(base);
  if (a === null || b === null || bits < 0 || bits > 32) return false;
  if (bits === 0) return true;
  const mask = bits === 32 ? -1 : ~((1 << (32 - bits)) - 1);
  return (a & mask) === (b & mask);
}

export function conditionMatches(request: WafRequest, condition: MatchCondition): boolean {
  const raw = readVariable(request, condition.variable);
  const value = applyTransforms(raw, condition.transforms);

  let hit: boolean;
  switch (condition.operator) {
    case "Any":
      hit = true;
      break;
    case "IPMatch":
      hit = condition.values.some((v) => (v.includes("/") ? ipInCidr(value, v) : value === v));
      break;
    case "Equal":
      hit = condition.values.some((v) => value === v);
      break;
    case "Contains":
      hit = condition.values.some((v) => value.toLowerCase().includes(v.toLowerCase()));
      break;
    case "BeginsWith":
      hit = condition.values.some((v) => value.toLowerCase().startsWith(v.toLowerCase()));
      break;
    case "EndsWith":
      hit = condition.values.some((v) => value.toLowerCase().endsWith(v.toLowerCase()));
      break;
    case "Regex":
      hit = condition.values.some((v) => {
        try {
          return new RegExp(v, "i").test(value);
        } catch {
          return false;
        }
      });
      break;
    case "GeoMatch":
      hit = condition.values.some((v) => value.toUpperCase() === v.toUpperCase());
      break;
  }

  // Negate flips the result, which is how "not from these countries" is written.
  return condition.negate ? !hit : hit;
}

/** All conditions on a custom rule must match — they are ANDed. */
export function customRuleMatches(request: WafRequest, rule: CustomRule): boolean {
  return rule.conditions.every((c) => conditionMatches(request, c));
}

/** Whether an exclusion removes a managed rule from consideration. */
export function isExcluded(exclusions: Exclusion[], rule: ManagedRule, request: WafRequest): boolean {
  return exclusions.some((e) => {
    if (e.ruleIds.length > 0 && !e.ruleIds.includes(rule.ruleId)) return false;
    const names =
      e.variable === "RequestHeaderNames"
        ? Object.keys(request.headers)
        : e.variable === "RequestCookieNames"
          ? Object.keys(request.cookies)
          : [];
    return names.some((n) => {
      const name = n.toLowerCase();
      const sel = e.selector.toLowerCase();
      switch (e.operator) {
        case "Equals":
          return name === sel;
        case "StartsWith":
          return name.startsWith(sel);
        case "EndsWith":
          return name.endsWith(sel);
        case "Contains":
          return name.includes(sel);
      }
    });
  });
}

export type ManagedHit = {
  rule: ManagedRule;
  group: string;
  score: number;
};

export type WafStep = {
  stage: "Policy state" | "Custom rules" | "Managed rules" | "Anomaly score";
  detail: string;
  matched: boolean;
};

export type WafVerdict = {
  /** What actually happened to the request. */
  action: "Allowed" | "Blocked";
  /** What Prevention mode would have done, which differs in Detection. */
  wouldBlock: boolean;
  decidedBy: string;
  customRuleHit: CustomRule | null;
  managedHits: ManagedHit[];
  totalScore: number;
  trace: WafStep[];
};

/**
 * Evaluates a request against the policy.
 *
 * Order: policy state, then custom rules by priority (first match terminates),
 * then managed rules accumulating an anomaly score. Mode is applied last —
 * Detection downgrades every block to a log entry.
 */
export function evaluateRequest(policy: WafPolicy, request: WafRequest): WafVerdict {
  const trace: WafStep[] = [];

  if (policy.state === "Disabled") {
    return {
      action: "Allowed",
      wouldBlock: false,
      decidedBy: "WAF is disabled",
      customRuleHit: null,
      managedHits: [],
      totalScore: 0,
      trace: [
        {
          stage: "Policy state",
          detail: "The policy is disabled, so no rule is evaluated at all.",
          matched: true,
        },
      ],
    };
  }

  trace.push({
    stage: "Policy state",
    detail: `Enabled in ${policy.mode} mode.`,
    matched: false,
  });

  // Custom rules first, by priority, first match wins.
  const ordered = [...policy.customRules]
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of ordered) {
    if (!customRuleMatches(request, rule)) {
      trace.push({
        stage: "Custom rules",
        detail: `${rule.name} (priority ${rule.priority}) did not match.`,
        matched: false,
      });
      continue;
    }

    if (rule.ruleType === "RateLimitRule") {
      // A single request never trips a rate limit; the threshold is per window.
      trace.push({
        stage: "Custom rules",
        detail: `${rule.name} matched, but it is a rate limit rule — one request cannot exceed ${rule.rateLimitThreshold} in ${rule.rateLimitDurationMinutes} minute(s), so evaluation continues.`,
        matched: false,
      });
      continue;
    }

    const terminal = rule.action === "Block" || rule.action === "Allow";
    trace.push({
      stage: "Custom rules",
      detail:
        rule.action === "Allow"
          ? `${rule.name} matched with action Allow. The request skips the managed rule set entirely.`
          : rule.action === "Block"
            ? `${rule.name} matched with action Block.`
            : `${rule.name} matched with action Log. Logged only; evaluation continues.`,
      matched: true,
    });

    if (terminal) {
      const wouldBlock = rule.action === "Block";
      return {
        action: wouldBlock && policy.mode === "Prevention" ? "Blocked" : "Allowed",
        wouldBlock,
        decidedBy: `Custom rule ${rule.name}`,
        customRuleHit: rule,
        managedHits: [],
        totalScore: 0,
        trace: applyMode(trace, wouldBlock, policy.mode),
      };
    }
  }

  // Managed rules accumulate an anomaly score rather than blocking outright.
  const managedHits: ManagedHit[] = [];
  for (const group of policy.ruleGroups) {
    for (const rule of group.rules) {
      if (!rule.enabled) continue;
      if (isExcluded(policy.exclusions, rule, request)) continue;
      if (rule.variable === "RequestBody" && !policy.requestBodyInspection) continue;

      const value = readVariable(request, rule.variable);
      if (rule.pattern.test(value)) {
        managedHits.push({ rule, group: group.name, score: SEVERITY_SCORE[rule.severity] });
      }
    }
  }

  const totalScore = managedHits.reduce((n, h) => n + h.score, 0);

  for (const hit of managedHits) {
    trace.push({
      stage: "Managed rules",
      detail: `${hit.rule.ruleId} (${hit.rule.severity}, +${hit.score}) — ${hit.rule.description}`,
      matched: true,
    });
  }
  if (managedHits.length === 0) {
    trace.push({
      stage: "Managed rules",
      detail: "No managed rule matched.",
      matched: false,
    });
  }

  const wouldBlock = totalScore >= policy.anomalyThreshold;
  trace.push({
    stage: "Anomaly score",
    detail: `Total ${totalScore} against a threshold of ${policy.anomalyThreshold}. ${
      wouldBlock
        ? "At or above the threshold, so the request qualifies to be blocked."
        : "Below the threshold, so the request is not blocked however many rules matched."
    }`,
    matched: wouldBlock,
  });

  return {
    action: wouldBlock && policy.mode === "Prevention" ? "Blocked" : "Allowed",
    wouldBlock,
    decidedBy: wouldBlock
      ? `Anomaly score ${totalScore} ≥ ${policy.anomalyThreshold}`
      : "No rule blocked the request",
    customRuleHit: null,
    managedHits,
    totalScore,
    trace: applyMode(trace, wouldBlock, policy.mode),
  };
}

/** Detection mode downgrades a block to a log entry — the single biggest trap. */
function applyMode(trace: WafStep[], wouldBlock: boolean, mode: WafMode): WafStep[] {
  if (wouldBlock && mode === "Detection") {
    return [
      ...trace,
      {
        stage: "Policy state",
        detail:
          "The policy is in Detection mode, so this is logged and the request is still delivered. Detection never blocks, whatever the rules say.",
        matched: true,
      },
    ];
  }
  return trace;
}

/* --------------------------------------------------------- sample traffic */

export const SAMPLE_REQUESTS: { label: string; request: WafRequest; teaches: string }[] = [
  {
    label: "SQL injection in the query string",
    request: {
      method: "GET",
      uri: "/products?id=1' or '1'='1",
      queryString: "id=1' or '1'='1",
      body: "",
      headers: { Host: "portal.contoso.com", Accept: "text/html", "User-Agent": "Mozilla/5.0" },
      cookies: {},
      remoteAddr: "198.51.100.23",
      country: "GB",
    },
    teaches:
      "One Critical rule scores 5, which reaches the threshold on its own. In Detection mode it is still delivered — switch the policy to Prevention and the same request is blocked.",
  },
  {
    label: "Scanner user agent only",
    request: {
      method: "GET",
      uri: "/",
      queryString: "",
      body: "",
      headers: { Host: "portal.contoso.com", Accept: "*/*", "User-Agent": "sqlmap/1.7" },
      cookies: {},
      remoteAddr: "198.51.100.77",
      country: "NL",
    },
    teaches:
      "A single Warning-level match scores 3, below the threshold of 5. Nothing is blocked — this is why people think the rule is broken.",
  },
  {
    label: "Scanner plus a restricted extension",
    request: {
      method: "GET",
      uri: "/backup/web.config",
      queryString: "",
      body: "",
      headers: { Host: "portal.contoso.com", Accept: "*/*", "User-Agent": "nikto/2.5" },
      cookies: {},
      remoteAddr: "198.51.100.77",
      country: "NL",
    },
    teaches:
      "Two Warning matches score 3 + 3 = 6, which crosses the threshold. Neither rule blocks alone; together they do. That is anomaly scoring.",
  },
  {
    label: "Path traversal",
    request: {
      method: "GET",
      uri: "/files?path=../../etc/passwd",
      queryString: "path=../../etc/passwd",
      body: "",
      headers: { Host: "portal.contoso.com", Accept: "text/html", "User-Agent": "curl/8.0" },
      cookies: {},
      remoteAddr: "203.0.113.9",
      country: "RO",
    },
    teaches:
      "The custom rule at priority 10 blocks this whole source range before any managed rule is consulted — the traversal never gets scored.",
  },
  {
    label: "XSS from a partner integration",
    request: {
      method: "POST",
      uri: "/feedback",
      queryString: "",
      body: "<script>alert(1)</script>",
      headers: {
        Host: "portal.contoso.com",
        Accept: "application/json",
        "x-partner-key": "abc123",
      },
      cookies: {},
      remoteAddr: "192.0.2.44",
      country: "AE",
    },
    teaches:
      "The custom Allow at priority 20 matches first and terminates evaluation, so a clear XSS payload sails past the entire managed rule set. Custom rules are powerful in both directions.",
  },
  {
    label: "Ordinary traffic",
    request: {
      method: "GET",
      uri: "/dashboard",
      queryString: "",
      body: "",
      headers: { Host: "portal.contoso.com", Accept: "text/html", "User-Agent": "Mozilla/5.0" },
      cookies: { session: "a1b2c3" },
      remoteAddr: "192.0.2.10",
      country: "AE",
    },
    teaches: "Nothing matches and the score stays at zero.",
  },
];
