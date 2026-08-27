import { inCidr } from "./nsg";

/**
 * Virtual networks: subnets, peering, private endpoints and effective routes.
 *
 * Two behaviours are worth having in your hands rather than in your notes.
 *
 * Route selection is not "the route I wrote wins". Azure picks the *longest
 * prefix match* first, and only when two routes have the same prefix does the
 * source break the tie — user-defined, then BGP, then system. So a 0.0.0.0/0
 * user route does not pull back traffic that a /24 system route already claims.
 *
 * Peering is not transitive. A peered to B and B peered to C does not let A
 * reach C, no matter how the peerings are configured, unless B forwards through
 * a gateway or appliance.
 */

export type NextHopType =
  | "VirtualNetwork"
  | "VnetPeering"
  | "Internet"
  | "VirtualNetworkGateway"
  | "VirtualAppliance"
  | "InterfaceEndpoint"
  | "None";

/** Where a route came from, which is also its tie-break rank. */
export type RouteSource = "User" | "BGP" | "Default";

export type Route = {
  name: string;
  addressPrefix: string;
  nextHopType: NextHopType;
  nextHopIp?: string;
  source: RouteSource;
  description?: string;
};

export type Subnet = {
  name: string;
  addressPrefix: string;
  /** User-defined routes attached to this subnet. */
  routeTable: Route[];
  /** Private endpoints living in the subnet, each adding a /32 route. */
  privateEndpoints: { name: string; ip: string; resource: string }[];
  delegatedTo?: string;
};

export type Peering = {
  remoteVnet: string;
  remoteAddressSpace: string[];
  allowForwardedTraffic: boolean;
  useRemoteGateways: boolean;
  state: "Connected" | "Disconnected";
};

export type Vnet = {
  name: string;
  addressSpace: string[];
  subnets: Subnet[];
  peerings: Peering[];
  /** Present when a gateway exists, which adds routes for on-premises space. */
  gateway?: { name: string; onPremisesPrefixes: string[] };
};

/* --------------------------------------------------------- prefix helpers */

export function prefixLength(cidr: string): number {
  const bits = Number(cidr.split("/")[1]);
  return Number.isFinite(bits) ? bits : 32;
}

/* ------------------------------------------------------- effective routes */

/**
 * Builds the effective route table for a subnet, the way the portal's
 * "effective routes" view does: system routes first, then peering and gateway
 * routes, then whatever the user attached.
 */
export function effectiveRoutes(vnet: Vnet, subnet: Subnet): Route[] {
  const routes: Route[] = [];

  // The virtual network's own space stays inside the network.
  for (const prefix of vnet.addressSpace) {
    routes.push({
      name: "default-vnet",
      addressPrefix: prefix,
      nextHopType: "VirtualNetwork",
      source: "Default",
      description: "Traffic inside the virtual network never leaves it.",
    });
  }

  // Connected peerings add the remote space. Disconnected ones add nothing,
  // which is what a half-configured peering looks like from this side.
  for (const peering of vnet.peerings.filter((p) => p.state === "Connected")) {
    for (const prefix of peering.remoteAddressSpace) {
      routes.push({
        name: `peering-${peering.remoteVnet}`,
        addressPrefix: prefix,
        nextHopType: "VnetPeering",
        source: "Default",
        description: `Reaches ${peering.remoteVnet} directly. Peering is not transitive — this covers that network only, not anything peered to it.`,
      });
    }
  }

  if (vnet.gateway) {
    for (const prefix of vnet.gateway.onPremisesPrefixes) {
      routes.push({
        name: `bgp-${vnet.gateway.name}`,
        addressPrefix: prefix,
        nextHopType: "VirtualNetworkGateway",
        source: "BGP",
        description: "Learned over BGP from the on-premises network.",
      });
    }
  }

  // A private endpoint installs a /32 that beats everything, by prefix length.
  for (const pe of subnet.privateEndpoints) {
    routes.push({
      name: `pe-${pe.name}`,
      addressPrefix: `${pe.ip}/32`,
      nextHopType: "InterfaceEndpoint",
      source: "Default",
      description: `Private endpoint for ${pe.resource}. A /32 is the longest possible prefix, so this always wins.`,
    });
  }

  // Everything else goes out.
  routes.push({
    name: "default-internet",
    addressPrefix: "0.0.0.0/0",
    nextHopType: "Internet",
    source: "Default",
    description: "The system default route.",
  });

  routes.push(...subnet.routeTable);

  return routes;
}

export type RouteResolution = {
  /** The route that carries the traffic, or null when nothing does. */
  selected: Route | null;
  /** Every candidate that matched, best first, with why it won or lost. */
  candidates: { route: Route; reason: string }[];
  outcome: string;
};

const SOURCE_RANK: Record<RouteSource, number> = { User: 0, BGP: 1, Default: 2 };

/**
 * Resolves which route carries a destination address.
 *
 * Longest prefix first; ties broken by source, user-defined winning over BGP
 * and BGP over system. A next hop of None means the traffic is dropped, which
 * is a route matching successfully and still going nowhere.
 */
export function resolveRoute(routes: Route[], destinationIp: string): RouteResolution {
  const matching = routes.filter((r) => inCidr(destinationIp, r.addressPrefix));

  if (matching.length === 0) {
    return {
      selected: null,
      candidates: [],
      outcome: `No route covers ${destinationIp}. In a real virtual network the 0.0.0.0/0 system route always exists, so seeing this means it was overridden.`,
    };
  }

  const ranked = [...matching].sort(
    (a, b) =>
      prefixLength(b.addressPrefix) - prefixLength(a.addressPrefix) ||
      SOURCE_RANK[a.source] - SOURCE_RANK[b.source],
  );

  const winner = ranked[0];
  const candidates = ranked.map((route, i) => {
    if (i === 0) {
      return {
        route,
        reason: `Selected: /${prefixLength(route.addressPrefix)} is the longest matching prefix${
          ranked[1] && prefixLength(ranked[1].addressPrefix) === prefixLength(route.addressPrefix)
            ? `, and a ${route.source.toLowerCase()} route outranks ${ranked[1].source.toLowerCase()} on the tie`
            : ""
        }.`,
      };
    }
    const samePrefix = prefixLength(route.addressPrefix) === prefixLength(winner.addressPrefix);
    return {
      route,
      reason: samePrefix
        ? `Same prefix, but ${route.source.toLowerCase()} ranks below ${winner.source.toLowerCase()}.`
        : `Shorter prefix (/${prefixLength(route.addressPrefix)}), so it loses to /${prefixLength(
            winner.addressPrefix,
          )}.`,
    };
  });

  const outcome =
    winner.nextHopType === "None"
      ? `Traffic to ${destinationIp} is dropped. The route matches, but a next hop of None is a black hole — this is how a route table silently breaks connectivity.`
      : `Traffic to ${destinationIp} leaves via ${winner.nextHopType}${
          winner.nextHopIp ? ` at ${winner.nextHopIp}` : ""
        }.`;

  return { selected: winner, candidates, outcome };
}

/* ------------------------------------------------------------- reachability */

export type Reachability = {
  reachable: boolean;
  explanation: string;
};

/**
 * Whether one network can reach another, given the peering graph.
 *
 * Deliberately only follows one hop: that restriction *is* the lesson. Two
 * networks peered to a common hub cannot talk to each other through it unless
 * the hub forwards, which needs allowForwardedTraffic plus an appliance and a
 * route pointing at it.
 */
export function canReach(networks: Vnet[], fromName: string, toName: string): Reachability {
  if (fromName === toName) {
    return { reachable: true, explanation: "Same virtual network." };
  }

  const from = networks.find((v) => v.name === fromName);
  if (!from) return { reachable: false, explanation: `${fromName} does not exist.` };

  const direct = from.peerings.find((p) => p.remoteVnet === toName);
  if (direct) {
    return direct.state === "Connected"
      ? { reachable: true, explanation: `${fromName} is peered directly with ${toName}.` }
      : {
          reachable: false,
          explanation: `The peering from ${fromName} to ${toName} exists but is ${direct.state.toLowerCase()}. Peerings are configured on both sides and only work when both are in place.`,
        };
  }

  // Is there a network peered to both? That is the transitive trap.
  const hub = networks.find(
    (v) =>
      v.name !== fromName &&
      v.name !== toName &&
      from.peerings.some((p) => p.remoteVnet === v.name && p.state === "Connected") &&
      v.peerings.some((p) => p.remoteVnet === toName && p.state === "Connected"),
  );

  if (hub) {
    return {
      reachable: false,
      explanation: `${fromName} and ${toName} are both peered to ${hub.name}, but peering is not transitive — that does not connect them. Route through an appliance in ${hub.name} with forwarded traffic allowed, or peer them directly.`,
    };
  }

  return {
    reachable: false,
    explanation: `${fromName} has no peering to ${toName}.`,
  };
}

/* ------------------------------------------------------------- the estate */

export const HUB: Vnet = {
  name: "vnet-hub",
  addressSpace: ["10.20.0.0/16"],
  gateway: { name: "vpn-gw-hub", onPremisesPrefixes: ["192.168.0.0/16"] },
  peerings: [
    {
      remoteVnet: "vnet-spoke-app",
      remoteAddressSpace: ["10.30.0.0/16"],
      allowForwardedTraffic: true,
      useRemoteGateways: false,
      state: "Connected",
    },
    {
      remoteVnet: "vnet-spoke-data",
      remoteAddressSpace: ["10.40.0.0/16"],
      allowForwardedTraffic: true,
      useRemoteGateways: false,
      state: "Connected",
    },
  ],
  subnets: [
    {
      name: "AzureFirewallSubnet",
      addressPrefix: "10.20.0.0/26",
      routeTable: [],
      privateEndpoints: [],
    },
    {
      name: "snet-mgmt",
      addressPrefix: "10.20.9.0/24",
      routeTable: [],
      privateEndpoints: [],
    },
  ],
};

export const SPOKE_APP: Vnet = {
  name: "vnet-spoke-app",
  addressSpace: ["10.30.0.0/16"],
  peerings: [
    {
      remoteVnet: "vnet-hub",
      remoteAddressSpace: ["10.20.0.0/16"],
      allowForwardedTraffic: false,
      useRemoteGateways: true,
      state: "Connected",
    },
  ],
  subnets: [
    {
      name: "snet-app",
      addressPrefix: "10.30.1.0/24",
      privateEndpoints: [
        { name: "pe-sql-finance", ip: "10.30.1.20", resource: "sql-finance-prod" },
      ],
      routeTable: [
        {
          name: "udr-force-tunnel",
          addressPrefix: "0.0.0.0/0",
          nextHopType: "VirtualAppliance",
          nextHopIp: "10.20.0.4",
          source: "User",
          description:
            "Forces all outbound traffic through the firewall in the hub. This is the route that makes the firewall blade's policy apply at all.",
        },
        {
          name: "udr-data-direct",
          addressPrefix: "10.40.2.0/24",
          nextHopType: "VirtualAppliance",
          nextHopIp: "10.20.0.4",
          source: "User",
          description: "Sends one data subnet through the firewall rather than straight over peering.",
        },
      ],
    },
  ],
};

export const SPOKE_DATA: Vnet = {
  name: "vnet-spoke-data",
  addressSpace: ["10.40.0.0/16"],
  peerings: [
    {
      remoteVnet: "vnet-hub",
      remoteAddressSpace: ["10.20.0.0/16"],
      allowForwardedTraffic: false,
      useRemoteGateways: true,
      state: "Connected",
    },
  ],
  subnets: [
    {
      name: "snet-data",
      addressPrefix: "10.40.2.0/24",
      routeTable: [
        {
          name: "udr-blackhole-internet",
          addressPrefix: "0.0.0.0/0",
          nextHopType: "None",
          source: "User",
          description:
            "Drops all outbound internet traffic from the data subnet. Matching and dropping is still matching.",
        },
      ],
      privateEndpoints: [],
    },
  ],
};

export const NETWORKS: Vnet[] = [HUB, SPOKE_APP, SPOKE_DATA];

export const SAMPLE_DESTINATIONS: {
  label: string;
  vnet: string;
  subnet: string;
  destination: string;
  teaches: string;
}[] = [
  {
    label: "App subnet to the internet",
    vnet: "vnet-spoke-app",
    subnet: "snet-app",
    destination: "20.50.1.1",
    teaches:
      "The user-defined 0.0.0.0/0 beats the system 0.0.0.0/0 on the same prefix, so traffic goes to the firewall rather than straight out.",
  },
  {
    label: "App subnet to its own private endpoint",
    vnet: "vnet-spoke-app",
    subnet: "snet-app",
    destination: "10.30.1.20",
    teaches:
      "The /32 private endpoint route is the longest prefix, so it wins over the /16 virtual network route without anyone configuring precedence.",
  },
  {
    label: "App subnet to another address in its own network",
    vnet: "vnet-spoke-app",
    subnet: "snet-app",
    destination: "10.30.4.9",
    teaches: "The system virtual network route carries it — a /16, but nothing longer matches.",
  },
  {
    label: "App subnet to the data spoke",
    vnet: "vnet-spoke-app",
    subnet: "snet-app",
    destination: "10.40.2.15",
    teaches:
      "The /24 user route beats the peering route to the whole /16, so this hairpins through the firewall. There is no peering to the data spoke from here anyway.",
  },
  {
    label: "Data subnet to the internet",
    vnet: "vnet-spoke-data",
    subnet: "snet-data",
    destination: "8.8.8.8",
    teaches:
      "A next hop of None. The route matches and the packet is dropped — the most confusing way to lose connectivity.",
  },
  {
    label: "Hub management subnet to on-premises",
    vnet: "vnet-hub",
    subnet: "snet-mgmt",
    destination: "192.168.4.10",
    teaches: "The BGP route learned from the gateway carries it.",
  },
];
