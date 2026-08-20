import { createHash, randomBytes } from "node:crypto";

/** How long a reset link stays valid. Short, because it is emailed. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * Reset tokens are random 32-byte values. Only their SHA-256 hash is stored,
 * so the database never holds anything that could be used as a reset link.
 * SHA-256 is appropriate here rather than bcrypt: the token has full entropy,
 * so there is nothing to brute force and lookups must stay constant-time cheap.
 */
export function createResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function resetTokenExpiry(now: number = Date.now()): Date {
  return new Date(now + RESET_TOKEN_TTL_MS);
}

export function isTokenUsable(
  token: { expiresAt: Date; usedAt: Date | null },
  now: number = Date.now(),
): boolean {
  return token.usedAt === null && token.expiresAt.getTime() > now;
}
