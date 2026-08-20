import type { Domain } from "@/content/types";

export type DomainStat = { domainId: string; correct: number; total: number };

export type DomainReadiness = {
  domainId: string;
  name: string;
  weight: number;
  accuracy: number | null;
  answered: number;
  /** Enough data to trust the accuracy figure. */
  confident: boolean;
};

export type Readiness = {
  /** Weighted accuracy across domains, 0–100, or null when there is no data. */
  score: number | null;
  verdict: "no-data" | "not-ready" | "borderline" | "ready";
  headline: string;
  detail: string;
  domains: DomainReadiness[];
  weakest: DomainReadiness | null;
  /** Domains with too little data to judge. */
  unevidenced: DomainReadiness[];
  answered: number;
};

/** Below this many answers in a domain, accuracy is too noisy to weight fully. */
export const MIN_PER_DOMAIN = 5;

/**
 * Estimates readiness by weighting per-domain accuracy by the exam's official
 * domain percentages, rather than averaging raw score history. A mock made
 * mostly of one domain should not dominate the estimate.
 *
 * Domains with no evidence are excluded from the score but reported separately,
 * because "80% across two of four domains" is not the same as being ready.
 */
export function computeReadiness(
  domains: Domain[],
  stats: DomainStat[],
  passPercent: number,
): Readiness {
  const byDomain = new Map(stats.map((s) => [s.domainId, s]));

  const rows: DomainReadiness[] = domains.map((d) => {
    const stat = byDomain.get(d.id);
    const answered = stat?.total ?? 0;
    return {
      domainId: d.id,
      name: d.name,
      weight: d.weightValue,
      accuracy: answered > 0 ? Math.round(((stat?.correct ?? 0) / answered) * 100) : null,
      answered,
      confident: answered >= MIN_PER_DOMAIN,
    };
  });

  const evidenced = rows.filter((r) => r.accuracy !== null);
  const unevidenced = rows.filter((r) => r.accuracy === null || !r.confident);
  const answered = rows.reduce((sum, r) => sum + r.answered, 0);

  if (evidenced.length === 0) {
    return {
      score: null,
      verdict: "no-data",
      headline: "Not enough data yet",
      detail: "Answer some questions and a readiness estimate will appear here.",
      domains: rows,
      weakest: null,
      unevidenced,
      answered,
    };
  }

  const totalWeight = evidenced.reduce((sum, r) => sum + r.weight, 0);
  const score = Math.round(
    evidenced.reduce((sum, r) => sum + (r.accuracy ?? 0) * r.weight, 0) / totalWeight,
  );

  const weakest = [...evidenced].sort(
    (a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0),
  )[0];

  // A margin above the pass mark, since a real exam is harder than practice.
  const verdict: Readiness["verdict"] =
    score >= passPercent + 10 ? "ready" : score >= passPercent ? "borderline" : "not-ready";

  const gaps = unevidenced.length;
  const headline =
    verdict === "ready"
      ? "On track"
      : verdict === "borderline"
        ? "Close, but thin margin"
        : "More work needed";

  const detail =
    verdict === "ready"
      ? `Weighted accuracy is ${score}%, comfortably above the ${passPercent}% pass mark.`
      : verdict === "borderline"
        ? `Weighted accuracy is ${score}%, only just above the ${passPercent}% pass mark. The real exam is harder than practice.`
        : `Weighted accuracy is ${score}%, below the ${passPercent}% pass mark.`;

  return {
    score,
    verdict,
    headline,
    detail:
      gaps > 0
        ? `${detail} ${gaps} skill area${gaps === 1 ? " has" : "s have"} too little data to judge.`
        : detail,
    domains: rows,
    weakest,
    unevidenced,
    answered,
  };
}
