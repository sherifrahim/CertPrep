/**
 * Canonical site origin, used for sitemap entries, robots, and social cards.
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every deployment, so production
 * links stay correct without hardcoding the domain.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.AUTH_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
