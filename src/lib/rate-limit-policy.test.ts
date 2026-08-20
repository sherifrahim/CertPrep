import { describe, expect, it } from "vitest";
import { LIMITS, decide, isExpired, limitKey } from "./rate-limit-policy";

const NOW = new Date("2026-01-01T12:00:00Z").getTime();
const win = (count: number, msFromNow: number) => ({
  count,
  expiresAt: new Date(NOW + msFromNow),
});

describe("decide", () => {
  it("allows requests up to and including the limit", () => {
    expect(decide(win(1, 60_000), 5, NOW).allowed).toBe(true);
    expect(decide(win(5, 60_000), 5, NOW).allowed).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    expect(decide(win(6, 60_000), 5, NOW).allowed).toBe(false);
  });

  it("reports how many attempts remain", () => {
    expect(decide(win(2, 60_000), 5, NOW).remaining).toBe(3);
    expect(decide(win(9, 60_000), 5, NOW).remaining).toBe(0);
  });

  it("reports seconds until the window resets", () => {
    expect(decide(win(6, 90_000), 5, NOW).retryAfterSec).toBe(90);
  });

  it("never reports negative remaining or retry values", () => {
    const d = decide(win(50, -10_000), 5, NOW);
    expect(d.remaining).toBeGreaterThanOrEqual(0);
    expect(d.retryAfterSec).toBeGreaterThanOrEqual(0);
  });
});

describe("isExpired", () => {
  it("treats a lapsed window as expired", () => {
    expect(isExpired(win(3, -1), NOW)).toBe(true);
  });
  it("treats a live window as current", () => {
    expect(isExpired(win(3, 1), NOW)).toBe(false);
  });
  it("expires exactly on the boundary", () => {
    expect(isExpired(win(3, 0), NOW)).toBe(true);
  });
});

describe("limitKey", () => {
  it("separates actions, IPs and identifiers", () => {
    expect(limitKey("signIn", "1.1.1.1", "a@b.com")).not.toBe(
      limitKey("signUp", "1.1.1.1", "a@b.com"),
    );
    expect(limitKey("signIn", "1.1.1.1", "a@b.com")).not.toBe(
      limitKey("signIn", "2.2.2.2", "a@b.com"),
    );
    expect(limitKey("signIn", "1.1.1.1", "a@b.com")).not.toBe(
      limitKey("signIn", "1.1.1.1", "c@d.com"),
    );
  });

  it("is case-insensitive on the identifier so casing cannot bypass it", () => {
    expect(limitKey("signIn", "1.1.1.1", "A@B.com")).toBe(
      limitKey("signIn", "1.1.1.1", "a@b.com"),
    );
  });
});

describe("limits", () => {
  it("keeps sign-in the tightest, since it is the stuffing target", () => {
    expect(LIMITS.signIn.max).toBeLessThanOrEqual(10);
    expect(LIMITS.signUp.max).toBeLessThanOrEqual(LIMITS.signIn.max);
    for (const l of Object.values(LIMITS)) {
      expect(l.windowMs).toBeGreaterThanOrEqual(10 * 60 * 1000);
    }
  });
});
