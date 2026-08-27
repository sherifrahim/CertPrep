/**
 * Microsoft Defender for Cloud: secure score, recommendations and attack paths.
 *
 * The scoring model is the part worth reproducing exactly, because reading
 * about it leaves two wrong impressions. The first is that severity drives the
 * score — it does not; a high-severity recommendation in a low-weighted control
 * moves the number less than a medium one in a heavy control. The second is
 * that fixing "a recommendation" earns its points — it does not; points are
 * earned per *resource*, and a control only pays in full once every resource
 * passes every recommendation inside it.
 *
 * Control weights below are the real ones.
 */

export type Severity = "High" | "Medium" | "Low";

export type ResourceType =
  | "Virtual machine"
  | "Storage account"
  | "SQL database"
  | "Key vault"
  | "App Service"
  | "Kubernetes cluster"
  | "Subscription";

export type Resource = {
  id: string;
  name: string;
  type: ResourceType;
  resourceGroup: string;
  /** Reachable from the internet — the multiplier on everything else. */
  internetExposed: boolean;
  /** Set where the resource holds data worth exfiltrating. */
  sensitiveData?: string;
};

export type Recommendation = {
  id: string;
  title: string;
  severity: Severity;
  controlId: string;
  /** Resource ids that fail this check. */
  unhealthy: string[];
  /** Resource ids assessed and passing. */
  healthy: string[];
  description: string;
  remediation: string;
};

export type Control = {
  id: string;
  title: string;
  /** The control's weight in the score. Real Defender for Cloud values. */
  maxScore: number;
  description: string;
};

/* ------------------------------------------------------------ the estate */

export const RESOURCES: Resource[] = [
  {
    id: "vm-web-01",
    name: "vm-web-01",
    type: "Virtual machine",
    resourceGroup: "rg-frontend",
    internetExposed: true,
  },
  {
    id: "vm-web-02",
    name: "vm-web-02",
    type: "Virtual machine",
    resourceGroup: "rg-frontend",
    internetExposed: true,
  },
  {
    id: "vm-app-01",
    name: "vm-app-01",
    type: "Virtual machine",
    resourceGroup: "rg-app",
    internetExposed: false,
  },
  {
    id: "vm-jump-01",
    name: "vm-jump-01",
    type: "Virtual machine",
    resourceGroup: "rg-mgmt",
    internetExposed: true,
  },
  {
    id: "st-finance",
    name: "stfinancedata",
    type: "Storage account",
    resourceGroup: "rg-data",
    internetExposed: true,
    sensitiveData: "Finance exports, payroll extracts",
  },
  {
    id: "st-logs",
    name: "stdiaglogs",
    type: "Storage account",
    resourceGroup: "rg-data",
    internetExposed: false,
  },
  {
    id: "sql-finance",
    name: "sql-finance-prod",
    type: "SQL database",
    resourceGroup: "rg-data",
    internetExposed: false,
    sensitiveData: "Customer and payment records",
  },
  {
    id: "kv-prod",
    name: "kv-contoso-prod",
    type: "Key vault",
    resourceGroup: "rg-shared",
    internetExposed: false,
    sensitiveData: "Service principal secrets",
  },
  {
    id: "app-portal",
    name: "app-customer-portal",
    type: "App Service",
    resourceGroup: "rg-frontend",
    internetExposed: true,
  },
  {
    id: "aks-prod",
    name: "aks-contoso-prod",
    type: "Kubernetes cluster",
    resourceGroup: "rg-app",
    internetExposed: false,
  },
  {
    id: "sub-contoso",
    name: "Contoso Production",
    type: "Subscription",
    resourceGroup: "—",
    internetExposed: false,
  },
];

export const RESOURCE_BY_ID = new Map(RESOURCES.map((r) => [r.id, r]));

/* ------------------------------------------------------------- controls */

export const CONTROLS: Control[] = [
  {
    id: "mfa",
    title: "Enable MFA",
    maxScore: 10,
    description:
      "The heaviest control in the score, and the one that maps most directly to how tenants are actually broken into.",
  },
  {
    id: "ports",
    title: "Secure management ports",
    maxScore: 8,
    description: "Management ports open to the internet are found by scanners within minutes.",
  },
  {
    id: "updates",
    title: "Apply system updates",
    maxScore: 6,
    description: "Missing operating system patches on assessed machines.",
  },
  {
    id: "vulns",
    title: "Remediate vulnerabilities",
    maxScore: 6,
    description: "Findings from the vulnerability assessment across machines, containers and SQL.",
  },
  {
    id: "network",
    title: "Restrict unauthorized network access",
    maxScore: 4,
    description: "Network exposure that no rule justifies — public endpoints, permissive NSGs.",
  },
  {
    id: "encryption",
    title: "Encrypt data in transit",
    maxScore: 4,
    description: "Plaintext transport to storage, databases and web front ends.",
  },
  {
    id: "access",
    title: "Manage access and permissions",
    maxScore: 4,
    description: "Standing privilege, unused identities and over-scoped role assignments.",
  },
  {
    id: "logging",
    title: "Enable auditing and logging",
    maxScore: 1,
    description:
      "Worth one point, and worth more than one point to you when you are investigating.",
  },
];

export const CONTROL_BY_ID = new Map(CONTROLS.map((c) => [c.id, c]));

/* ------------------------------------------------------- recommendations */

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-mfa-owners",
    title: "MFA should be enabled on accounts with owner permissions",
    severity: "High",
    controlId: "mfa",
    unhealthy: ["sub-contoso"],
    healthy: [],
    description:
      "Two owner accounts on the subscription sign in with a password alone. An owner can do anything, including turning off the monitoring that would catch them.",
    remediation:
      "Require multifactor authentication for those accounts with a Conditional Access policy, then move standing owner rights into Privileged Identity Management.",
  },
  {
    id: "rec-mfa-write",
    title: "MFA should be enabled on accounts with write permissions",
    severity: "High",
    controlId: "mfa",
    unhealthy: ["sub-contoso"],
    healthy: [],
    description: "Contributor-level accounts on the subscription are not covered by an MFA policy.",
    remediation: "Extend the Conditional Access policy to every directory role that can write.",
  },
  {
    id: "rec-jit",
    title: "Management ports of virtual machines should be protected with just-in-time access",
    severity: "High",
    controlId: "ports",
    unhealthy: ["vm-web-01", "vm-web-02", "vm-jump-01"],
    healthy: ["vm-app-01"],
    description:
      "RDP and SSH are reachable from the internet on three machines. Just-in-time opens the port only for a named user, from a named address, for a fixed window.",
    remediation: "Enable just-in-time VM access on each machine, then close the standing NSG rule.",
  },
  {
    id: "rec-mgmt-ports-closed",
    title: "Management ports should be closed on your virtual machines",
    severity: "Medium",
    controlId: "ports",
    unhealthy: ["vm-jump-01"],
    healthy: ["vm-web-01", "vm-web-02", "vm-app-01"],
    description: "The jump box accepts RDP from any source address.",
    remediation: "Restrict the NSG rule to the management subnet, or front it with Bastion.",
  },
  {
    id: "rec-updates",
    title: "System updates should be installed on your machines",
    severity: "High",
    controlId: "updates",
    unhealthy: ["vm-web-01", "vm-web-02"],
    healthy: ["vm-app-01", "vm-jump-01"],
    description: "Both web servers are missing patches rated critical.",
    remediation: "Deploy the pending updates through Azure Update Manager and set a schedule.",
  },
  {
    id: "rec-vuln-vm",
    title: "Machines should have vulnerability findings resolved",
    severity: "High",
    controlId: "vulns",
    unhealthy: ["vm-web-01", "vm-web-02", "vm-jump-01"],
    healthy: ["vm-app-01"],
    description:
      "The vulnerability assessment reports a remotely exploitable finding on vm-web-01 that is already public.",
    remediation: "Patch or reconfigure the affected components, starting with internet-facing ones.",
  },
  {
    id: "rec-vuln-sql",
    title: "SQL databases should have vulnerability findings resolved",
    severity: "Medium",
    controlId: "vulns",
    unhealthy: ["sql-finance"],
    healthy: [],
    description: "Baseline checks flag excessive permissions on the finance database.",
    remediation: "Apply the recommended baseline and remove the standing permissions.",
  },
  {
    id: "rec-storage-public",
    title: "Storage accounts should restrict network access",
    severity: "High",
    controlId: "network",
    unhealthy: ["st-finance"],
    healthy: ["st-logs"],
    description:
      "The finance storage account accepts connections from any network. It holds payroll extracts.",
    remediation:
      "Set the default network rule to deny, then reach it through a private endpoint from the application subnet.",
  },
  {
    id: "rec-aks-network",
    title: "Kubernetes API server should have restricted access",
    severity: "Medium",
    controlId: "network",
    unhealthy: ["aks-prod"],
    healthy: [],
    description: "The cluster API server accepts traffic from any address.",
    remediation: "Set authorised IP ranges, or make the cluster private.",
  },
  {
    id: "rec-https",
    title: "Secure transfer to storage accounts should be enabled",
    severity: "High",
    controlId: "encryption",
    unhealthy: ["st-finance"],
    healthy: ["st-logs"],
    description: "The account still accepts plain HTTP.",
    remediation: "Turn on secure transfer required. It is one setting and breaks almost nothing.",
  },
  {
    id: "rec-tls",
    title: "App Service apps should use the latest TLS version",
    severity: "Medium",
    controlId: "encryption",
    unhealthy: ["app-portal"],
    healthy: [],
    description: "The customer portal still negotiates TLS 1.0.",
    remediation: "Set the minimum TLS version to 1.2.",
  },
  {
    id: "rec-managed-identity",
    title: "Managed identity should be used in App Service apps",
    severity: "Medium",
    controlId: "access",
    unhealthy: ["app-portal"],
    healthy: [],
    description:
      "The portal authenticates to Key Vault with a secret in its configuration rather than a managed identity.",
    remediation: "Assign a managed identity and grant it a scoped role on the vault.",
  },
  {
    id: "rec-overprivileged",
    title: "Azure resources should have least-privilege role assignments",
    severity: "Medium",
    controlId: "access",
    unhealthy: ["vm-app-01", "app-portal"],
    healthy: ["aks-prod"],
    description:
      "The application VM's managed identity holds Storage Blob Data Contributor at subscription scope. It needs one container.",
    remediation: "Replace the subscription assignment with one scoped to the container it reads.",
  },
  {
    id: "rec-kv-logging",
    title: "Resource logs in Key Vault should be enabled",
    severity: "Low",
    controlId: "logging",
    unhealthy: ["kv-prod"],
    healthy: [],
    description:
      "Nothing records who read which secret. Cheap to turn on, and the difference between an investigation and a shrug.",
    remediation: "Send AuditEvent logs to the Log Analytics workspace.",
  },
  {
    id: "rec-sql-audit",
    title: "Auditing should be enabled on SQL servers",
    severity: "Low",
    controlId: "logging",
    unhealthy: [],
    healthy: ["sql-finance"],
    description: "Already enabled and shipping to the workspace.",
    remediation: "No action needed.",
  },
];

/* --------------------------------------------------------- secure score */

export type ControlScore = {
  control: Control;
  /** Resources assessed by at least one recommendation in this control. */
  totalResources: number;
  /** Resources passing every recommendation in this control. */
  healthyResources: number;
  current: number;
  max: number;
  /** Recommendations in this control that still have unhealthy resources. */
  failing: Recommendation[];
};

export type SecureScore = {
  controls: ControlScore[];
  current: number;
  max: number;
  percentage: number;
};

/**
 * Scores one control.
 *
 * A resource counts as healthy for the control only when it passes *every*
 * recommendation in that control — passing three of four earns nothing for that
 * resource. The control then pays out proportionally:
 *
 *     current = maxScore × healthyResources / totalResources
 */
export function scoreControl(
  control: Control,
  recommendations: Recommendation[],
  remediated: ReadonlySet<string> = new Set(),
): ControlScore {
  const inControl = recommendations.filter((r) => r.controlId === control.id);

  const assessed = new Set<string>();
  const failed = new Set<string>();

  for (const rec of inControl) {
    for (const id of rec.healthy) assessed.add(id);
    for (const id of rec.unhealthy) {
      assessed.add(id);
      // A remediated recommendation is treated as passing on every resource.
      if (!remediated.has(rec.id)) failed.add(id);
    }
  }

  const totalResources = assessed.size;
  const healthyResources = totalResources - failed.size;
  const current =
    totalResources === 0 ? control.maxScore : (control.maxScore * healthyResources) / totalResources;

  return {
    control,
    totalResources,
    healthyResources,
    current,
    max: control.maxScore,
    failing: inControl.filter((r) => !remediated.has(r.id) && r.unhealthy.length > 0),
  };
}

/**
 * The overall secure score.
 *
 * It is the sum of the earned control scores over the sum of the maximums —
 * not an average of the control percentages, which would let a one-point
 * control weigh as much as the ten-point one.
 */
export function secureScore(
  recommendations: Recommendation[] = RECOMMENDATIONS,
  remediated: ReadonlySet<string> = new Set(),
): SecureScore {
  const controls = CONTROLS.map((c) => scoreControl(c, recommendations, remediated));
  const current = controls.reduce((sum, c) => sum + c.current, 0);
  const max = controls.reduce((sum, c) => sum + c.max, 0);

  return {
    controls,
    current,
    max,
    percentage: max === 0 ? 0 : Math.round((current / max) * 100),
  };
}

/**
 * How many points remediating one recommendation would actually add.
 *
 * This is the number the portal shows as "potential score increase", and the
 * reason a Low-severity finding sometimes beats a High one: the weight of the
 * control and how many resources are left failing matter more than the label.
 */
export function potentialGain(
  recommendationId: string,
  recommendations: Recommendation[] = RECOMMENDATIONS,
  remediated: ReadonlySet<string> = new Set(),
): number {
  if (remediated.has(recommendationId)) return 0;
  const before = secureScore(recommendations, remediated);
  const after = secureScore(recommendations, new Set([...remediated, recommendationId]));
  return Number((after.current - before.current).toFixed(2));
}

/** Recommendations ordered by what they are worth, not by how loud they are. */
export function byPotentialGain(
  recommendations: Recommendation[] = RECOMMENDATIONS,
  remediated: ReadonlySet<string> = new Set(),
): { recommendation: Recommendation; gain: number }[] {
  return recommendations
    .filter((r) => !remediated.has(r.id) && r.unhealthy.length > 0)
    .map((r) => ({ recommendation: r, gain: potentialGain(r.id, recommendations, remediated) }))
    .sort((a, b) => b.gain - a.gain);
}

/* ---------------------------------------------------------- attack paths */

export type AttackPathNode = {
  resourceId: string;
  /** What this hop contributes to the chain. */
  role: string;
};

export type AttackPath = {
  id: string;
  title: string;
  risk: "Critical" | "High" | "Medium";
  nodes: AttackPathNode[];
  /** Why the chain is worse than its parts, which is the point of attack paths. */
  narrative: string;
  /** Remediating any one of these breaks the chain. */
  breaksIfRemediated: string[];
};

export const ATTACK_PATHS: AttackPath[] = [
  {
    id: "ap-1",
    title:
      "Internet-exposed VM with a known exploitable vulnerability has read access to a storage account with sensitive data",
    risk: "Critical",
    nodes: [
      { resourceId: "vm-web-01", role: "Reachable from the internet on 443 and unpatched" },
      { resourceId: "vm-app-01", role: "Reached over the internal network from the web tier" },
      {
        resourceId: "st-finance",
        role: "Read by the app VM's managed identity, which is scoped to the whole subscription",
      },
    ],
    narrative:
      "None of these three findings is remarkable alone — an unpatched VM, a flat internal network, an over-scoped role assignment. Chained, they take an anonymous internet attacker to payroll data in three hops. This is what attack paths are for: the individual recommendations were all sitting in the list, and none of them looked urgent.",
    breaksIfRemediated: ["rec-vuln-vm", "rec-overprivileged", "rec-storage-public"],
  },
  {
    id: "ap-2",
    title: "Internet-exposed VM with management ports open allows lateral movement to a Key Vault",
    risk: "High",
    nodes: [
      { resourceId: "vm-jump-01", role: "RDP open to any address, no just-in-time" },
      { resourceId: "app-portal", role: "Shares a secret with the jump host's environment" },
      { resourceId: "kv-prod", role: "Holds service principal secrets, with no audit logging" },
    ],
    narrative:
      "The jump box is the whole path. Because the portal authenticates to the vault with a stored secret rather than a managed identity, anyone who lands on a machine holding that configuration reads it — and with vault logging off, nothing records that they did.",
    breaksIfRemediated: ["rec-jit", "rec-managed-identity", "rec-kv-logging"],
  },
  {
    id: "ap-3",
    title: "Storage account with sensitive data is publicly reachable over an unencrypted channel",
    risk: "High",
    nodes: [
      { resourceId: "st-finance", role: "Default network rule allows every network" },
      { resourceId: "st-finance", role: "Accepts plain HTTP, so credentials cross in the clear" },
    ],
    narrative:
      "Two settings on one resource. Neither is a vulnerability in the CVE sense, which is exactly why they sat unfixed — and together they mean finance exports are one leaked key away from public, with the key itself observable in transit.",
    breaksIfRemediated: ["rec-storage-public", "rec-https"],
  },
];

/** Attack paths still live given what has been remediated. */
export function livePaths(remediated: ReadonlySet<string>): AttackPath[] {
  return ATTACK_PATHS.filter((p) => !p.breaksIfRemediated.some((id) => remediated.has(id)));
}

export const SEVERITY_ORDER: Severity[] = ["High", "Medium", "Low"];
