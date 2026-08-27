import { describe, expect, it } from "vitest";
import { LAB_NOW } from "./data";
import {
  QUARANTINE_REASONS,
  availableActions,
  buildQuarantine,
  daysRemaining,
  defaultPolicyFor,
  describeRelease,
  explainPermissions,
  filterQuarantine,
  isExpired,
  permissionsFor,
  type QuarantineReason,
  type QuarantinedMessage,
} from "./quarantine";

const DAY = 86_400_000;
const messages = buildQuarantine();
const byId = (id: string): QuarantinedMessage => messages.find((m) => m.id === id)!;

describe("defaultPolicyFor", () => {
  // The single most-missed point in the quarantine topic.
  it("gives malware and high confidence phish admin-only access", () => {
    expect(defaultPolicyFor("Malware")).toBe("AdminOnlyAccessPolicy");
    expect(defaultPolicyFor("High confidence phish")).toBe("AdminOnlyAccessPolicy");
  });

  it("lets users act on the lower-severity verdicts", () => {
    for (const reason of ["Phish", "High confidence spam", "Spam", "Bulk"] as QuarantineReason[]) {
      expect(defaultPolicyFor(reason)).toBe("DefaultFullAccessWithNotificationPolicy");
    }
  });

  it("uses the no-notification policy for transport rule quarantine", () => {
    expect(defaultPolicyFor("Mail flow rule")).toBe("DefaultFullAccessPolicy");
  });

  it("covers every reason", () => {
    for (const reason of QUARANTINE_REASONS) {
      expect(defaultPolicyFor(reason)).toBeTruthy();
    }
  });
});

describe("permissionsFor", () => {
  it("gives admins everything, including on admin-only verdicts", () => {
    for (const reason of QUARANTINE_REASONS) {
      const p = permissionsFor(reason, "Security admin");
      expect(p.release).toBe(true);
      expect(p.preview).toBe(true);
      expect(p.delete).toBe(true);
    }
  });

  // Admin-only means invisible, not merely read-only: the user cannot even ask.
  it("hides admin-only messages from the recipient entirely", () => {
    const p = permissionsFor("Malware", "End user");
    expect(p.release).toBe(false);
    expect(p.requestRelease).toBe(false);
    expect(p.preview).toBe(false);
    expect(p.notified).toBe(false);
  });

  it("lets a user release normal-confidence phish themselves", () => {
    const p = permissionsFor("Phish", "End user");
    expect(p.release).toBe(true);
    expect(p.notified).toBe(true);
  });

  it("separates permission from notification for transport rule quarantine", () => {
    const p = permissionsFor("Mail flow rule", "End user");
    expect(p.release).toBe(true);
    expect(p.notified).toBe(false);
  });

  it("explains itself for every reason and role", () => {
    for (const reason of QUARANTINE_REASONS) {
      for (const role of ["End user", "Security admin"] as const) {
        expect(explainPermissions(reason, role).length).toBeGreaterThan(20);
      }
    }
  });
});

describe("retention", () => {
  const fresh = byId("q-8801");
  const nearlyGone = byId("q-8807");

  it("counts down from the retention period", () => {
    expect(daysRemaining(fresh)).toBe(29);
    expect(daysRemaining(nearlyGone)).toBe(1);
  });

  it("never goes negative", () => {
    const later = new Date(LAB_NOW.getTime() + 90 * DAY);
    expect(daysRemaining(fresh, later)).toBe(0);
    expect(isExpired(fresh, later)).toBe(true);
  });

  it("treats a message inside its window as live", () => {
    expect(isExpired(fresh)).toBe(false);
    expect(isExpired(nearlyGone)).toBe(false);
  });
});

describe("availableActions", () => {
  const malware = byId("q-8802");
  const spam = byId("q-8804");

  it("offers a user nothing on an admin-only message", () => {
    const offers = availableActions(malware, "End user");
    const release = offers.find((o) => o.action === "Release")!;
    const request = offers.find((o) => o.action === "Request release")!;
    expect(release.available).toBe(false);
    expect(request.available).toBe(false);
    expect(release.reason).toContain("admin-only");
  });

  it("offers an admin release on the same message", () => {
    const offers = availableActions(malware, "Security admin");
    expect(offers.find((o) => o.action === "Release")!.available).toBe(true);
    expect(offers.find((o) => o.action === "Submit to Microsoft")!.available).toBe(true);
  });

  it("lets a user release a spam verdict", () => {
    const offers = availableActions(spam, "End user");
    expect(offers.find((o) => o.action === "Release")!.available).toBe(true);
    expect(offers.find((o) => o.action === "Preview")!.available).toBe(true);
  });

  it("withdraws every action once retention lapses", () => {
    const expired: QuarantinedMessage = {
      ...spam,
      receivedAt: new Date(LAB_NOW.getTime() - 40 * DAY).toISOString(),
    };
    const offers = availableActions(expired, "Security admin");
    for (const offer of offers.filter((o) => o.action !== "Submit to Microsoft")) {
      expect(offer.available, `${offer.action} should be unavailable`).toBe(false);
    }
    expect(offers.find((o) => o.action === "Release")!.reason).toContain("purged");
  });

  it("gives every offer a reason whether it is available or not", () => {
    for (const role of ["End user", "Security admin"] as const) {
      for (const m of messages) {
        for (const offer of availableActions(m, role)) {
          expect(offer.reason.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("describeRelease", () => {
  const m = byId("q-8805");

  it("releases to all recipients when the scope says so", () => {
    const out = describeRelease(m, "All recipients", [], false);
    expect(out.delivered).toEqual(m.recipients);
    expect(out.reportedToMicrosoft).toBe(false);
  });

  it("releases only the selected recipients otherwise", () => {
    const out = describeRelease(m, "Selected recipients", [m.recipients[0]], false);
    expect(out.delivered).toEqual([m.recipients[0]]);
  });

  it("records the submission when reporting a false positive", () => {
    const out = describeRelease(m, "All recipients", [], true);
    expect(out.reportedToMicrosoft).toBe(true);
    expect(out.note).toContain("false positive");
  });

  // Release is one-way, and the copy has to say so.
  it("says a release cannot be undone", () => {
    expect(describeRelease(m, "All recipients", [], false).note).toContain("cannot be undone");
  });
});

describe("the queue", () => {
  it("uses unique ids and non-empty recipients", () => {
    expect(new Set(messages.map((m) => m.id)).size).toBe(messages.length);
    for (const m of messages) expect(m.recipients.length).toBeGreaterThan(0);
  });

  it("assigns each message the policy its verdict implies", () => {
    for (const m of messages) {
      expect(m.policy, `${m.id} carries the wrong policy`).toBe(defaultPolicyFor(m.reason));
    }
  });

  it("filters by reason, sender and recipient", () => {
    expect(filterQuarantine(messages, { reason: "Malware", recipient: "", sender: "" })).toHaveLength(
      1,
    );
    expect(
      filterQuarantine(messages, { reason: "All", recipient: "grace.lin", sender: "" }).length,
    ).toBeGreaterThan(0);
    expect(
      filterQuarantine(messages, { reason: "All", recipient: "", sender: "nobody@example.com" }),
    ).toHaveLength(0);
  });
});
