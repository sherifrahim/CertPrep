import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  LIMITS,
  decide,
  isExpired,
  limitKey,
  type Decision,
} from "@/lib/rate-limit-policy";

export { LIMITS } from "@/lib/rate-limit-policy";

/** Best-effort client IP. Vercel sets x-forwarded-for. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown";
  return forwarded.split(",")[0].trim() || "unknown";
}

/**
 * Counts this request against a fixed window and says whether to allow it.
 *
 * Fails open: if the counter cannot be read or written, the request proceeds
 * rather than locking everyone out of sign-in because of a database blip.
 */
export async function consume(
  action: keyof typeof LIMITS,
  identifier: string,
): Promise<Decision> {
  return consumeKey(action, limitKey(action, await clientIp(), identifier));
}

/**
 * Storage-level counter step, split out from `consume` so it can be exercised
 * against a real database without a request context.
 */
export async function consumeKey(
  action: keyof typeof LIMITS,
  key: string,
): Promise<Decision> {
  const { max, windowMs } = LIMITS[action];
  const now = new Date();

  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });

    if (!existing || isExpired(existing, now.getTime())) {
      const fresh = { count: 1, expiresAt: new Date(now.getTime() + windowMs) };
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, ...fresh },
        update: fresh,
      });
      return decide(fresh, max, now.getTime());
    }

    const updated = await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return decide(updated, max, now.getTime());
  } catch (error) {
    console.error("[rate-limit] falling open", error);
    return { allowed: true, remaining: max, retryAfterSec: 0 };
  }
}

/** Clears the counter after a successful attempt, so honest users are not punished. */
export async function reset(
  action: keyof typeof LIMITS,
  identifier: string,
): Promise<void> {
  try {
    await prisma.rateLimit.delete({
      where: { key: limitKey(action, await clientIp(), identifier) },
    });
  } catch {
    // Nothing to clear.
  }
}
