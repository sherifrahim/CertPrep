import { describe, expect, it } from "vitest";
import type { Domain } from "@/content/types";
import { computeReadiness } from "./readiness";

const domains: Domain[] = [
  { id: "a", name: "A", weight: "40%", weightValue: 40, summary: "", objectives: [] },
  { id: "b", name: "B", weight: "10%", weightValue: 10, summary: "", objectives: [] },
];

describe("computeReadiness", () => {
  it("reports no data before anything is answered", () => {
    const r = computeReadiness(domains, [], 70);
    expect(r.score).toBeNull();
    expect(r.verdict).toBe("no-data");
  });

  // The point of the feature: a heavy domain must move the number more.
  it("weights domains by their official exam percentage", () => {
    const strongHeavy = computeReadiness(
      domains,
      [
        { domainId: "a", correct: 10, total: 10 },
        { domainId: "b", correct: 0, total: 10 },
      ],
      70,
    );
    const strongLight = computeReadiness(
      domains,
      [
        { domainId: "a", correct: 0, total: 10 },
        { domainId: "b", correct: 10, total: 10 },
      ],
      70,
    );
    expect(strongHeavy.score).toBe(80); // 100*40 + 0*10 over 50
    expect(strongLight.score).toBe(20);
    expect(strongHeavy.score!).toBeGreaterThan(strongLight.score!);
  });

  it("requires a margin above the pass mark before calling someone ready", () => {
    const stats = (pct: number) => [
      { domainId: "a", correct: pct, total: 100 },
      { domainId: "b", correct: pct, total: 100 },
    ];
    expect(computeReadiness(domains, stats(65), 70).verdict).toBe("not-ready");
    expect(computeReadiness(domains, stats(72), 70).verdict).toBe("borderline");
    expect(computeReadiness(domains, stats(85), 70).verdict).toBe("ready");
  });

  it("identifies the weakest evidenced domain", () => {
    const r = computeReadiness(
      domains,
      [
        { domainId: "a", correct: 9, total: 10 },
        { domainId: "b", correct: 2, total: 10 },
      ],
      70,
    );
    expect(r.weakest?.domainId).toBe("b");
  });

  it("excludes unanswered domains from the score but flags them", () => {
    const r = computeReadiness(domains, [{ domainId: "a", correct: 8, total: 10 }], 70);
    expect(r.score).toBe(80); // domain b not averaged in as a zero
    expect(r.unevidenced.some((d) => d.domainId === "b")).toBe(true);
    expect(r.detail).toContain("too little data");
  });

  it("marks thin evidence as not confident", () => {
    const r = computeReadiness(domains, [{ domainId: "a", correct: 2, total: 2 }], 70);
    expect(r.domains.find((d) => d.domainId === "a")?.confident).toBe(false);
  });

  it("never reports a score above 100 or below 0", () => {
    const perfect = computeReadiness(
      domains,
      [
        { domainId: "a", correct: 10, total: 10 },
        { domainId: "b", correct: 10, total: 10 },
      ],
      70,
    );
    expect(perfect.score).toBe(100);
    const none = computeReadiness(
      domains,
      [
        { domainId: "a", correct: 0, total: 10 },
        { domainId: "b", correct: 0, total: 10 },
      ],
      70,
    );
    expect(none.score).toBe(0);
  });
});
