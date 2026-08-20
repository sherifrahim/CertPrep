import { describe, expect, it } from "vitest";
import {
  RESET_TOKEN_TTL_MS,
  createResetToken,
  hashResetToken,
  isTokenUsable,
  resetTokenExpiry,
} from "./password-reset";

const NOW = new Date("2026-01-01T12:00:00Z").getTime();

describe("createResetToken", () => {
  it("returns a high-entropy token", () => {
    const { token } = createResetToken();
    expect(token.length).toBeGreaterThanOrEqual(40);
  });

  it("never repeats", () => {
    const seen = new Set(Array.from({ length: 2000 }, () => createResetToken().token));
    expect(seen.size).toBe(2000);
  });

  it("returns a hash that is not the token itself", () => {
    const { token, tokenHash } = createResetToken();
    expect(tokenHash).not.toBe(token);
    expect(tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("hashes deterministically so lookup works", () => {
    const { token, tokenHash } = createResetToken();
    expect(hashResetToken(token)).toBe(tokenHash);
  });

  it("gives different tokens different hashes", () => {
    expect(hashResetToken("aaa")).not.toBe(hashResetToken("aab"));
  });
});

describe("isTokenUsable", () => {
  it("accepts an unused, unexpired token", () => {
    expect(isTokenUsable({ expiresAt: new Date(NOW + 60_000), usedAt: null }, NOW)).toBe(true);
  });

  it("rejects an expired token", () => {
    expect(isTokenUsable({ expiresAt: new Date(NOW - 1), usedAt: null }, NOW)).toBe(false);
  });

  it("rejects a token that has already been used", () => {
    expect(
      isTokenUsable({ expiresAt: new Date(NOW + 60_000), usedAt: new Date(NOW - 10) }, NOW),
    ).toBe(false);
  });

  it("rejects a token that is both used and expired", () => {
    expect(isTokenUsable({ expiresAt: new Date(NOW - 1), usedAt: new Date(NOW - 1) }, NOW)).toBe(
      false,
    );
  });

  it("rejects exactly at the expiry boundary", () => {
    expect(isTokenUsable({ expiresAt: new Date(NOW), usedAt: null }, NOW)).toBe(false);
  });
});

describe("resetTokenExpiry", () => {
  it("expires an hour out, short enough to limit exposure", () => {
    expect(resetTokenExpiry(NOW).getTime()).toBe(NOW + RESET_TOKEN_TTL_MS);
    expect(RESET_TOKEN_TTL_MS).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });
});
