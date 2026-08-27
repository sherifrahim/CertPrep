import { describe, expect, it } from "vitest";
import { IOC } from "./data";
import {
  CHART_BREAKDOWNS,
  EXPLORER_ACTIONS,
  EXPLORER_HINTS,
  EXPLORER_VIEWS,
  FILTER_PROPERTIES,
  applyFilters,
  applyView,
  chartData,
  describeAction,
  distinctValues,
  explorerRows,
  matchesFilter,
  readProperty,
  type ExplorerFilter,
} from "./explorer";

const rows = explorerRows();
const phish = rows.filter((r) => r.threatTypes === "Phish");

describe("explorerRows", () => {
  it("enriches every row with the Explorer-only columns", () => {
    for (const r of rows) {
      expect(r.senderDomain.length).toBeGreaterThan(0);
      expect(r.directionality).toBeTruthy();
      expect(r.originalDeliveryLocation).toBeTruthy();
      expect(r.latestDeliveryLocation).toBeTruthy();
    }
  });

  it("finds the phishing campaign and gives it a campaign id", () => {
    expect(phish.length).toBeGreaterThan(0);
    for (const r of phish) expect(r.campaignId).toBe("camp-4417");
  });

  // The column pair people conflate.
  it("separates original from latest delivery location after auto purge", () => {
    const purged = phish.filter((r) => !r.clicked);
    const clicked = phish.filter((r) => r.clicked);

    expect(purged.length).toBeGreaterThan(0);
    for (const r of purged) {
      expect(r.originalDeliveryLocation).toBe("Inbox");
      expect(r.latestDeliveryLocation).toBe("Quarantine");
    }
    // The one already clicked was not pulled back.
    for (const r of clicked) {
      expect(r.latestDeliveryLocation).toBe("Inbox");
    }
  });

  it("marks external senders inbound and contoso senders intra-org", () => {
    const external = rows.find((r) => !r.senderDomain.endsWith("contoso.com"))!;
    expect(external.directionality).toBe("Inbound");
    const internal = rows.find((r) => r.senderDomain.endsWith("contoso.com"));
    if (internal) expect(internal.directionality).toBe("Intra-org");
  });

  it("records a click verdict only where there was a click", () => {
    for (const r of rows) {
      expect(r.clicked ? r.clickVerdict !== "None" : r.clickVerdict === "None").toBe(true);
    }
  });
});

describe("views", () => {
  it("returns everything for All email", () => {
    expect(applyView(rows, "All email")).toHaveLength(rows.length);
  });

  it("narrows to the phishing wave", () => {
    expect(applyView(rows, "Phish").every((r) => r.threatTypes === "Phish")).toBe(true);
  });

  it("shows only clicked messages in URL clicks", () => {
    const clicks = applyView(rows, "URL clicks");
    expect(clicks.length).toBeGreaterThan(0);
    expect(clicks.every((r) => r.clicked)).toBe(true);
    // Receiving is not clicking — the whole point of the view.
    expect(clicks.length).toBeLessThan(applyView(rows, "Phish").length);
  });

  it("covers every declared view without throwing", () => {
    for (const v of EXPLORER_VIEWS) expect(Array.isArray(applyView(rows, v))).toBe(true);
  });
});

describe("filters", () => {
  const senderFilter = (values: string[], operator: ExplorerFilter["operator"]): ExplorerFilter => ({
    property: "Sender address",
    operator,
    values,
  });

  it("matches any of a list", () => {
    const out = applyFilters(rows, [senderFilter([IOC.phishSender], "Equal any of")]);
    expect(out.length).toBe(phish.length);
    expect(out.every((r) => r.sender === IOC.phishSender)).toBe(true);
  });

  it("excludes with equal none of", () => {
    const out = applyFilters(rows, [senderFilter([IOC.phishSender], "Equal none of")]);
    expect(out.every((r) => r.sender !== IOC.phishSender)).toBe(true);
    expect(out.length).toBe(rows.length - phish.length);
  });

  it("matches substrings with contains", () => {
    const out = applyFilters(rows, [senderFilter(["contoso-benefits"], "Contains")]);
    expect(out.length).toBe(phish.length);
  });

  it("treats an empty value list as no constraint", () => {
    expect(applyFilters(rows, [senderFilter([], "Equal any of")])).toHaveLength(rows.length);
  });

  it("ANDs multiple filters", () => {
    const out = applyFilters(rows, [
      senderFilter([IOC.phishSender], "Equal any of"),
      { property: "Latest delivery location", operator: "Equal any of", values: ["Inbox"] },
    ]);
    // Only the clicked message escaped auto purge.
    expect(out).toHaveLength(1);
    expect(out[0].recipient).toBe(IOC.victimUpn);
  });

  // Filtering the wrong location column silently misses the cleaned-up mail.
  it("gives different answers for original and latest location", () => {
    const byOriginal = applyFilters(rows, [
      { property: "Original delivery location", operator: "Equal any of", values: ["Inbox"] },
      { property: "Sender address", operator: "Equal any of", values: [IOC.phishSender] },
    ]);
    const byLatest = applyFilters(rows, [
      { property: "Latest delivery location", operator: "Equal any of", values: ["Inbox"] },
      { property: "Sender address", operator: "Equal any of", values: [IOC.phishSender] },
    ]);
    expect(byOriginal.length).toBeGreaterThan(byLatest.length);
  });

  it("reads every declared property without throwing", () => {
    for (const p of FILTER_PROPERTIES) {
      expect(typeof readProperty(rows[0], p)).toBe("string");
    }
  });

  it("is case insensitive", () => {
    expect(
      matchesFilter(phish[0], senderFilter([IOC.phishSender.toUpperCase()], "Equal any of")),
    ).toBe(true);
  });
});

describe("chart", () => {
  it("counts every row exactly once", () => {
    for (const b of CHART_BREAKDOWNS) {
      const total = chartData(rows, b).reduce((n, s) => n + s.count, 0);
      expect(total, b).toBe(rows.length);
    }
  });

  it("sorts by count descending", () => {
    const data = chartData(rows, "Delivery action");
    for (let i = 1; i < data.length; i++) {
      expect(data[i - 1].count).toBeGreaterThanOrEqual(data[i].count);
    }
  });

  it("returns nothing for an empty set", () => {
    expect(chartData([], "Delivery action")).toEqual([]);
  });
});

describe("take action", () => {
  it("marks hard delete as the only irreversible removal", () => {
    const irreversible = EXPLORER_ACTIONS.filter(
      (a) => !describeAction(a, phish).reversible,
    );
    expect(irreversible).toContain("Hard delete");
    expect(irreversible).not.toContain("Soft delete");
  });

  it("explains that soft delete leaves the message recoverable", () => {
    const out = describeAction("Soft delete", phish);
    expect(out.explanation).toContain("Recoverable Items");
    expect(out.reversible).toBe(true);
  });

  // Remediation goes through the Action center rather than happening instantly.
  it("requires approval for anything that moves mail, but not for a submission", () => {
    expect(describeAction("Hard delete", phish).requiresApproval).toBe(true);
    expect(describeAction("Move to junk folder", phish).requiresApproval).toBe(true);
    expect(describeAction("Submit to Microsoft for analysis", phish).requiresApproval).toBe(false);
  });

  it("reports the distinct mailboxes affected", () => {
    const out = describeAction("Soft delete", phish);
    expect(out.affected).toBe(phish.length);
    expect(out.mailboxes.length).toBe(new Set(phish.map((r) => r.recipient)).size);
  });

  it("gives every action an explanation", () => {
    for (const a of EXPLORER_ACTIONS) {
      expect(describeAction(a, phish).explanation.length).toBeGreaterThan(20);
    }
  });
});

describe("hints", () => {
  it("uses real properties and returns rows", () => {
    for (const hint of EXPLORER_HINTS) {
      const base = hint.view ? applyView(rows, hint.view) : rows;
      const out = applyFilters(base, hint.filters);
      expect(out.length, hint.label).toBeGreaterThan(0);
      expect(hint.teaches.length).toBeGreaterThan(20);
    }
  });
});

describe("distinctValues", () => {
  it("returns sorted unique values for the picker", () => {
    const v = distinctValues(rows, "Delivery action");
    expect(v.length).toBeGreaterThan(0);
    expect([...v].sort()).toEqual(v);
    expect(new Set(v).size).toBe(v.length);
  });
});
