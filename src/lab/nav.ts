/**
 * The blade map for the simulated portals.
 *
 * Everything the lab intends to cover is listed here, including what is not
 * built yet, so the navigation doubles as an honest roadmap rather than hiding
 * the gaps.
 */
export type Blade = {
  href: string;
  label: string;
  /** Short description shown on section landing pages. */
  hint: string;
  status: "ready" | "planned";
};

export type BladeSection = {
  product: string;
  /** Matches the real portal's grouping so the layout feels familiar. */
  groups: { label: string; blades: Blade[] }[];
};

export const LAB_NAV: BladeSection[] = [
  {
    product: "Microsoft Defender XDR",
    groups: [
      {
        label: "Investigation & response",
        blades: [
          {
            href: "/lab/incidents",
            label: "Incidents & alerts",
            hint: "Triage the queue, assign owners, classify and walk the attack story.",
            status: "ready",
          },
          {
            href: "/lab/hunting",
            label: "Advanced hunting",
            hint: "Write KQL against 14 tables of live-shaped telemetry.",
            status: "ready",
          },
          {
            href: "/lab/actions",
            label: "Action center",
            hint: "Approve or reject pending remediation from automated investigation.",
            status: "ready",
          },
        ],
      },
      {
        label: "Assets",
        blades: [
          {
            href: "/lab/devices",
            label: "Device inventory",
            hint: "Onboarded endpoints with risk, exposure and onboarding state.",
            status: "ready",
          },
          {
            href: "/lab/identities",
            label: "Identities",
            hint: "Directory accounts with risk, investigation priority and containment actions.",
            status: "ready",
          },
        ],
      },
      {
        label: "Endpoints",
        blades: [
          {
            href: "/lab/vulnerabilities",
            label: "Vulnerability management",
            hint: "Exposure score, secure score for devices, weaknesses ranked by threat.",
            status: "ready",
          },
          {
            href: "/lab/asr",
            label: "Attack surface reduction",
            hint: "ASR rules in audit, block and warn, and what each would have stopped.",
            status: "ready",
          },
        ],
      },
      {
        label: "Email & collaboration",
        blades: [
          {
            href: "/lab/email",
            label: "Explorer",
            hint: "Hunt delivered mail, see clicks, and purge from mailboxes.",
            status: "ready",
          },
          {
            href: "/lab/quarantine",
            label: "Quarantine",
            hint: "Review, release and submit messages to Microsoft.",
            status: "ready",
          },
        ],
      },
    ],
  },
  {
    product: "Microsoft Sentinel",
    groups: [
      {
        label: "Configuration",
        blades: [
          {
            href: "/lab/analytics",
            label: "Analytics rules",
            hint: "Author scheduled rules and see what they would have caught.",
            status: "ready",
          },
          {
            href: "/lab/connectors",
            label: "Data connectors",
            hint: "Connect sources, and see which detections stop working when one is off.",
            status: "ready",
          },
        ],
      },
    ],
  },
  {
    product: "Azure",
    groups: [
      {
        label: "Networking",
        blades: [
          {
            href: "/lab/nsg",
            label: "Network security groups",
            hint: "Build rules, then test a flow and see which rule decided it.",
            status: "ready",
          },
          {
            href: "/lab/vnet",
            label: "Virtual networks",
            hint: "Subnets, peering, private endpoints and effective routes.",
            status: "ready",
          },
          {
            href: "/lab/firewall",
            label: "Azure Firewall",
            hint: "Rule collections, DNAT, threat intelligence and IDPS signature rules.",
            status: "ready",
          },
          {
            href: "/lab/waf",
            label: "Web application firewall",
            hint: "Policy settings, managed rules with anomaly scoring, custom rules and exclusions.",
            status: "ready",
          },
        ],
      },
      {
        label: "Security posture",
        blades: [
          {
            href: "/lab/defender-cloud",
            label: "Defender for Cloud",
            hint: "Secure score, recommendations and attack paths.",
            status: "ready",
          },
        ],
      },
    ],
  },
];

export const READY_BLADES = LAB_NAV.flatMap((s) =>
  s.groups.flatMap((g) => g.blades.filter((b) => b.status === "ready")),
);

export const PLANNED_BLADES = LAB_NAV.flatMap((s) =>
  s.groups.flatMap((g) => g.blades.filter((b) => b.status === "planned")),
);
