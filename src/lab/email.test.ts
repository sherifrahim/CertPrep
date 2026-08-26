import { describe, expect, it } from "vitest";
import { IOC } from "./data";
import {
  EMPTY_FILTERS,
  allMail,
  describeRemediation,
  filterMail,
  summarise,
  type RemediationAction,
} from "./email";

const mail = allMail();

describe("allMail", () => {
  it("returns every message with its URLs and click state joined", () => {
    expect(mail.length).toBeGreaterThan(50);
    const phish = mail.filter((m) => m.sender === IOC.phishSender);
    expect(phish).toHaveLength(6);
    expect(phish.every((m) => m.urls.includes(IOC.phishUrl))).toBe(true);
  });

  // The distinction remediation hangs on: received is not the same as clicked.
  it("marks only the recipient who actually clicked", () => {
    const clicked = mail.filter((m) => m.clicked);
    expect(clicked).toHaveLength(1);
    expect(clicked[0].recipient).toBe(IOC.victimUpn);
    expect(clicked[0].clickAction).toBe("ClickAllowed");
  });

  it("keeps benign mail unflagged and link-free", () => {
    const benign = mail.filter((m) => m.threatTypes === "");
    expect(benign.length).toBeGreaterThan(40);
    expect(benign.every((m) => !m.clicked)).toBe(true);
  });

  it("carries the failed authentication on the phishing messages", () => {
    const phish = mail.find((m) => m.sender === IOC.phishSender)!;
    expect(phish.authentication).toContain("SPF: fail");
    expect(phish.authentication).toContain("DMARC: fail");
  });

  it("is sorted newest first", () => {
    for (let i = 1; i < mail.length; i++) {
      expect(mail[i - 1].timestamp >= mail[i].timestamp).toBe(true);
    }
  });
});

describe("filterMail", () => {
  it("returns everything with empty filters", () => {
    expect(filterMail(mail, EMPTY_FILTERS)).toHaveLength(mail.length);
  });

  it("filters to threats only", () => {
    const r = filterMail(mail, { ...EMPTY_FILTERS, threatOnly: true });
    expect(r).toHaveLength(6);
    expect(r.every((m) => m.threatTypes === "Phish")).toBe(true);
  });

  it("filters to clicked only", () => {
    expect(filterMail(mail, { ...EMPTY_FILTERS, clickedOnly: true })).toHaveLength(1);
  });

  it("matches sender, recipient and subject case-insensitively on substrings", () => {
    expect(filterMail(mail, { ...EMPTY_FILTERS, sender: "CONTOSO-BENEFITS" })).toHaveLength(6);
    expect(
      filterMail(mail, { ...EMPTY_FILTERS, recipient: "alice.chen" }).length,
    ).toBeGreaterThan(0);
    expect(filterMail(mail, { ...EMPTY_FILTERS, subject: "benefits enrolment" })).toHaveLength(6);
  });

  it("combines filters as an AND", () => {
    const r = filterMail(mail, {
      ...EMPTY_FILTERS,
      threatOnly: true,
      recipient: "alice.chen",
    });
    expect(r).toHaveLength(1);
    expect(r[0].clicked).toBe(true);
  });

  it("returns nothing when filters match nothing", () => {
    expect(filterMail(mail, { ...EMPTY_FILTERS, sender: "nobody@nowhere.test" })).toHaveLength(0);
  });
});

describe("summarise", () => {
  it("counts the campaign accurately", () => {
    const s = summarise(filterMail(mail, { ...EMPTY_FILTERS, threatOnly: true }));
    expect(s.total).toBe(6);
    expect(s.threats).toBe(6);
    expect(s.delivered).toBe(6);
    expect(s.clicked).toBe(1);
    expect(s.distinctSenders).toBe(1);
    expect(s.distinctRecipients).toBe(6);
  });

  it("handles an empty selection", () => {
    const s = summarise([]);
    expect(s.total).toBe(0);
    expect(s.distinctSenders).toBe(0);
  });
});

describe("describeRemediation", () => {
  const phish = filterMail(mail, { ...EMPTY_FILTERS, threatOnly: true });

  it("reports how many mailboxes an action would touch", () => {
    const r = describeRemediation("SoftDelete", phish);
    expect(r.affected).toBe(6);
    expect(r.mailboxes).toHaveLength(6);
  });

  // Soft versus hard delete is a distinction the exam tests directly.
  it("marks soft delete recoverable and hard delete not", () => {
    expect(describeRemediation("SoftDelete", phish).reversible).toBe(true);
    expect(describeRemediation("HardDelete", phish).reversible).toBe(false);
    expect(describeRemediation("HardDelete", phish).explanation).toMatch(/cannot be recovered/);
  });

  it("explains every supported action", () => {
    const actions: RemediationAction[] = ["SoftDelete", "HardDelete", "MoveToJunk", "MoveToInbox"];
    for (const a of actions) {
      const r = describeRemediation(a, phish);
      expect(r.explanation.length, a).toBeGreaterThan(40);
    }
  });

  it("suggests submitting to Microsoft when restoring a false positive", () => {
    expect(describeRemediation("MoveToInbox", phish).explanation).toMatch(/submit/i);
  });
});
