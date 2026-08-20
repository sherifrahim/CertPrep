/**
 * Rate limit policy — pure decision logic, kept separate from storage so it can
 * be unit tested without a database.
 */
export type Window = { count: number; expiresAt: Date };

export type Decision = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfterSec: number;
};

/** Sensible defaults per protected action. */
export const LIMITS = {
  /** Sign-in is the credential-stuffing target, so it is the tightest. */
  signIn: { max: 10, windowMs: 15 * 60 * 1000 },
  signUp: { max: 5, windowMs: 60 * 60 * 1000 },
  passwordReset: { max: 5, windowMs: 15 * 60 * 1000 },
} as const;

/**
 * Decides whether the request that has just been counted is allowed.
 *
 * @param window the stored counter *after* incrementing for this request
 */
export function decide(window: Window, max: number, now: number = Date.now()): Decision {
  const msLeft = Math.max(0, window.expiresAt.getTime() - now);
  return {
    allowed: window.count <= max,
    remaining: Math.max(0, max - window.count),
    retryAfterSec: Math.ceil(msLeft / 1000),
  };
}

/** Whether a stored window has lapsed and should be restarted rather than incremented. */
export function isExpired(window: Window, now: number = Date.now()): boolean {
  return window.expiresAt.getTime() <= now;
}

/**
 * Builds the counter key. The email is included so one noisy address cannot
 * lock out everyone behind a shared NAT, and the IP is included so one attacker
 * cannot spray many addresses freely.
 */
export function limitKey(action: keyof typeof LIMITS, ip: string, identifier: string): string {
  return `${action}:${ip}:${identifier.toLowerCase()}`;
}
