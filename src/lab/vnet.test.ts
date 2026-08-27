import { describe, expect, it } from "vitest";
import {
  HUB,
  NETWORKS,
  SAMPLE_DESTINATIONS,
  SPOKE_APP,
  SPOKE_DATA,
  canReach,
  effectiveRoutes,
  prefixLength,
  resolveRoute,
  type Route,
} from "./vnet";

const appRoutes = () => effectiveRoutes(SPOKE_APP, SPOKE_APP.subnets[0]);
const dataRoutes = () => effectiveRoutes(SPOKE_DATA, SPOKE_DATA.subnets[0]);
const hubMgmtRoutes = () => effectiveRoutes(HUB, HUB.subnets[1]);

describe("prefixLength", () => {
  it("reads the mask", () => {
    expect(prefixLength("10.0.0.0/8")).toBe(8);
    expect(prefixLength("0.0.0.0/0")).toBe(0);
    expect(prefixLength("10.30.1.20/32")).toBe(32);
  });

  it("treats a bare address as a host route", () => {
    expect(prefixLength("10.0.0.1")).toBe(32);
  });
});

describe("effectiveRoutes", () => {
  it("includes the virtual network's own space and the default internet route", () => {
    const routes = appRoutes();
    expect(routes.some((r) => r.addressPrefix === "10.30.0.0/16" && r.nextHopType === "VirtualNetwork")).toBe(
      true,
    );
    expect(routes.some((r) => r.addressPrefix === "0.0.0.0/0" && r.source === "Default")).toBe(true);
  });

  it("adds a route per connected peering", () => {
    const routes = appRoutes();
    expect(
      routes.some((r) => r.nextHopType === "VnetPeering" && r.addressPrefix === "10.20.0.0/16"),
    ).toBe(true);
  });

  it("omits peerings that are not connected", () => {
    const halfConfigured = {
      ...SPOKE_APP,
      peerings: SPOKE_APP.peerings.map((p) => ({ ...p, state: "Disconnected" as const })),
    };
    const routes = effectiveRoutes(halfConfigured, halfConfigured.subnets[0]);
    expect(routes.some((r) => r.nextHopType === "VnetPeering")).toBe(false);
  });

  it("adds a host route for each private endpoint", () => {
    const routes = appRoutes();
    const pe = routes.find((r) => r.nextHopType === "InterfaceEndpoint");
    expect(pe?.addressPrefix).toBe("10.30.1.20/32");
  });

  it("adds BGP routes only where a gateway exists", () => {
    expect(hubMgmtRoutes().some((r) => r.source === "BGP")).toBe(true);
    expect(appRoutes().some((r) => r.source === "BGP")).toBe(false);
  });

  it("carries the subnet's user-defined routes through", () => {
    const user = appRoutes().filter((r) => r.source === "User");
    expect(user.map((r) => r.name).sort()).toEqual(["udr-data-direct", "udr-force-tunnel"]);
  });
});

describe("resolveRoute", () => {
  // Longest prefix first — the rule that decides most real cases.
  it("prefers the longest matching prefix regardless of source", () => {
    const r = resolveRoute(appRoutes(), "10.30.1.20");
    expect(r.selected?.nextHopType).toBe("InterfaceEndpoint");
    expect(prefixLength(r.selected!.addressPrefix)).toBe(32);
  });

  it("breaks a tie on equal prefixes in favour of the user-defined route", () => {
    const r = resolveRoute(appRoutes(), "20.50.1.1");
    expect(r.selected?.name).toBe("udr-force-tunnel");
    expect(r.selected?.nextHopType).toBe("VirtualAppliance");
    expect(r.outcome).toContain("10.20.0.4");
  });

  it("ranks user above BGP above system on the same prefix", () => {
    const routes: Route[] = [
      { name: "sys", addressPrefix: "10.0.0.0/8", nextHopType: "Internet", source: "Default" },
      { name: "bgp", addressPrefix: "10.0.0.0/8", nextHopType: "VirtualNetworkGateway", source: "BGP" },
      { name: "udr", addressPrefix: "10.0.0.0/8", nextHopType: "VirtualAppliance", source: "User" },
    ];
    expect(resolveRoute(routes, "10.1.2.3").selected?.name).toBe("udr");
    expect(resolveRoute(routes.slice(0, 2), "10.1.2.3").selected?.name).toBe("bgp");
  });

  // A shorter user route does not beat a longer system route.
  it("does not let a user route win on a shorter prefix", () => {
    const r = resolveRoute(appRoutes(), "10.30.4.9");
    expect(r.selected?.name).toBe("default-vnet");
    expect(r.selected?.source).toBe("Default");
  });

  it("sends a destination covered by a longer user route through the appliance", () => {
    const r = resolveRoute(appRoutes(), "10.40.2.15");
    expect(r.selected?.name).toBe("udr-data-direct");
  });

  it("reports a next hop of None as a drop, not a miss", () => {
    const r = resolveRoute(dataRoutes(), "8.8.8.8");
    expect(r.selected?.nextHopType).toBe("None");
    expect(r.outcome).toContain("dropped");
  });

  it("uses the BGP route for on-premises space", () => {
    const r = resolveRoute(hubMgmtRoutes(), "192.168.4.10");
    expect(r.selected?.nextHopType).toBe("VirtualNetworkGateway");
    expect(r.selected?.source).toBe("BGP");
  });

  it("explains every candidate, not just the winner", () => {
    const r = resolveRoute(appRoutes(), "20.50.1.1");
    expect(r.candidates.length).toBeGreaterThan(1);
    for (const c of r.candidates) expect(c.reason.length).toBeGreaterThan(0);
    expect(r.candidates[0].reason).toContain("Selected");
  });

  it("reports honestly when nothing matches", () => {
    const r = resolveRoute([{ name: "only", addressPrefix: "10.0.0.0/8", nextHopType: "VirtualNetwork", source: "Default" }], "8.8.8.8");
    expect(r.selected).toBeNull();
    expect(r.candidates).toEqual([]);
  });
});

describe("canReach", () => {
  it("connects directly peered networks", () => {
    expect(canReach(NETWORKS, "vnet-hub", "vnet-spoke-app").reachable).toBe(true);
    expect(canReach(NETWORKS, "vnet-spoke-app", "vnet-hub").reachable).toBe(true);
  });

  // Peering is not transitive, and the two spokes are the classic case.
  it("does not connect two spokes through their shared hub", () => {
    const r = canReach(NETWORKS, "vnet-spoke-app", "vnet-spoke-data");
    expect(r.reachable).toBe(false);
    expect(r.explanation).toContain("not transitive");
    expect(r.explanation).toContain("vnet-hub");
  });

  it("treats a network as reaching itself", () => {
    expect(canReach(NETWORKS, "vnet-hub", "vnet-hub").reachable).toBe(true);
  });

  it("refuses a peering that is configured on one side only", () => {
    const broken = NETWORKS.map((v) =>
      v.name === "vnet-hub"
        ? {
            ...v,
            peerings: v.peerings.map((p) =>
              p.remoteVnet === "vnet-spoke-app" ? { ...p, state: "Disconnected" as const } : p,
            ),
          }
        : v,
    );
    const r = canReach(broken, "vnet-hub", "vnet-spoke-app");
    expect(r.reachable).toBe(false);
    expect(r.explanation).toContain("both sides");
  });

  it("reports an unknown network rather than guessing", () => {
    expect(canReach(NETWORKS, "vnet-nowhere", "vnet-hub").reachable).toBe(false);
  });
});

// The sample destinations carry teaching copy, so the engine has to agree.
describe("sample destinations resolve as their explanations claim", () => {
  const resolve = (label: string) => {
    const s = SAMPLE_DESTINATIONS.find((d) => d.label === label)!;
    const vnet = NETWORKS.find((v) => v.name === s.vnet)!;
    const subnet = vnet.subnets.find((sn) => sn.name === s.subnet)!;
    return resolveRoute(effectiveRoutes(vnet, subnet), s.destination);
  };

  it("forces app subnet internet traffic through the appliance", () => {
    expect(resolve("App subnet to the internet").selected?.nextHopType).toBe("VirtualAppliance");
  });

  it("wins the private endpoint on prefix length", () => {
    expect(resolve("App subnet to its own private endpoint").selected?.nextHopType).toBe(
      "InterfaceEndpoint",
    );
  });

  it("keeps intra-vnet traffic on the virtual network route", () => {
    expect(resolve("App subnet to another address in its own network").selected?.nextHopType).toBe(
      "VirtualNetwork",
    );
  });

  it("hairpins the data spoke through the firewall", () => {
    expect(resolve("App subnet to the data spoke").selected?.name).toBe("udr-data-direct");
  });

  it("black-holes the data subnet's internet traffic", () => {
    expect(resolve("Data subnet to the internet").selected?.nextHopType).toBe("None");
  });

  it("routes on-premises traffic over the gateway", () => {
    expect(resolve("Hub management subnet to on-premises").selected?.nextHopType).toBe(
      "VirtualNetworkGateway",
    );
  });

  it("names a real vnet and subnet in every sample", () => {
    for (const s of SAMPLE_DESTINATIONS) {
      const vnet = NETWORKS.find((v) => v.name === s.vnet);
      expect(vnet, `${s.label} names an unknown vnet`).toBeTruthy();
      expect(vnet!.subnets.some((sn) => sn.name === s.subnet)).toBe(true);
    }
  });
});
