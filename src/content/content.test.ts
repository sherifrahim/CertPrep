import { describe, expect, it } from "vitest";
import { exams } from "./index";
import { isCorrect, randomiseAll, seedFrom } from "@/lib/quiz";
import type { Question } from "./types";

const allQuestions = exams.flatMap((e) => e.questions);
const allCards = exams.flatMap((e) => e.flashcards);

describe("content integrity", () => {
  it("has globally unique question and flashcard ids", () => {
    expect(new Set(allQuestions.map((q) => q.id)).size).toBe(allQuestions.length);
    expect(new Set(allCards.map((c) => c.id)).size).toBe(allCards.length);
  });

  it("references only domains that exist on the same exam", () => {
    for (const exam of exams) {
      const ids = new Set(exam.domains.map((d) => d.id));
      for (const q of exam.questions) expect(ids.has(q.domainId)).toBe(true);
      for (const c of exam.flashcards) expect(ids.has(c.domainId)).toBe(true);
    }
  });

  it("marks every correct answer as a real option, statement or step", () => {
    for (const q of allQuestions) {
      if (q.type === "single" || q.type === "multi") {
        const ids = new Set((q.options ?? []).map((o) => o.id));
        for (const c of q.correct) expect(ids.has(c)).toBe(true);
      } else if (q.type === "meets-goal") {
        expect(["yes", "no"]).toContain(q.correct[0]);
      } else if (q.type === "ordering") {
        const ids = new Set((q.steps ?? []).map((s) => s.id));
        for (const c of q.correct) expect(ids.has(c)).toBe(true);
        expect(q.correct).toHaveLength((q.steps ?? []).length);
      }
    }
  });

  it("keeps statement grids consistent and never all-one-answer", () => {
    for (const q of allQuestions.filter((x) => x.type === "statements")) {
      const flagged = (q.statements ?? []).filter((s) => s.correct).map((s) => s.id);
      expect([...flagged].sort()).toEqual([...q.correct].sort());
      // A grid answered entirely Yes or entirely No would be guessable.
      expect(flagged.length).toBeGreaterThan(0);
      expect(flagged.length).toBeLessThan((q.statements ?? []).length);
    }
  });

  it("gives every question a substantive explanation and https reference", () => {
    for (const q of allQuestions) {
      expect(q.explanation.length).toBeGreaterThan(40);
      if (q.reference) expect(q.reference.url.startsWith("https://")).toBe(true);
      expect([1, 2, 3]).toContain(q.difficulty);
    }
  });

  it("links every case study question to a case study that exists", () => {
    for (const exam of exams) {
      const ids = new Set(exam.caseStudies.map((c) => c.id));
      for (const q of exam.questions) {
        if (q.caseStudyId) expect(ids.has(q.caseStudyId)).toBe(true);
      }
      for (const study of exam.caseStudies) {
        const linked = exam.questions.filter((q) => q.caseStudyId === study.id);
        expect(linked.length).toBeGreaterThanOrEqual(2);
        expect(study.sections.length).toBeGreaterThan(0);
      }
    }
  });

  it("holds enough standalone questions per domain for a weighted mock", () => {
    for (const exam of exams) {
      const pool = exam.questions.filter((q) => !q.caseStudyId);
      expect(pool.length).toBeGreaterThanOrEqual(exam.mock.questionCount);
      const total = exam.domains.reduce((s, d) => s + d.weightValue, 0);
      for (const domain of exam.domains) {
        const quota = Math.round((domain.weightValue / total) * exam.mock.questionCount);
        const available = pool.filter((q) => q.domainId === domain.id).length;
        expect(available).toBeGreaterThanOrEqual(quota);
      }
    }
  });
});

describe("answer key is not guessable", () => {
  // Regression: 93% of single-answer questions were authored with the key at
  // position A, so always picking the first option scored ~93%.
  it("spreads the key across positions once randomised", () => {
    const positions: Record<number, number> = {};
    let total = 0;
    for (let session = 0; session < 60; session++) {
      for (const exam of exams) {
        for (const q of randomiseAll(exam.questions, seedFrom(`sess-${session}`))) {
          if (q.type !== "single" || !q.options) continue;
          total++;
          const idx = q.options.findIndex((o) => o.id === q.correct[0]);
          positions[idx] = (positions[idx] ?? 0) + 1;
        }
      }
    }
    // No position may carry more than 35% of the keys.
    for (const count of Object.values(positions)) {
      expect(count / total).toBeLessThan(0.35);
    }
  });

  it("means always picking the first option scores near chance", () => {
    let asked = 0;
    let right = 0;
    for (let session = 0; session < 40; session++) {
      for (const exam of exams) {
        for (const q of randomiseAll(exam.questions, seedFrom(`guess-${session}`))) {
          if (q.type !== "single" || !q.options) continue;
          asked++;
          if (isCorrect(q, [q.options[0].id])) right++;
        }
      }
    }
    expect(right / asked).toBeLessThan(0.35);
  });

  it("never ships an ordering question in its solved order", () => {
    for (let session = 0; session < 40; session++) {
      for (const exam of exams) {
        for (const q of randomiseAll(exam.questions, seedFrom(`ord-${session}`))) {
          if (q.type !== "ordering" || !q.steps) continue;
          expect(q.steps.map((s) => s.id).join()).not.toBe(q.correct.join());
        }
      }
    }
  });
});

describe("exam metadata", () => {
  it("uses ISO dates and https links", () => {
    for (const exam of exams) {
      expect(exam.skillsMeasuredAsOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (exam.retiresOn) expect(exam.retiresOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(exam.officialUrl.startsWith("https://")).toBe(true);
      for (const r of exam.resources) expect(r.url.startsWith("https://")).toBe(true);
    }
  });

  it("keeps domain weights in a plausible band", () => {
    // weightValue is the midpoint of an official range like "15\u201320%".
    // Midpoints of asymmetric ranges do not sum to exactly 100 (AZ-500 is 95,
    // SC-200 is 102.5), so this guards against a fat-fingered weight, not drift.
    for (const exam of exams) {
      const total = exam.domains.reduce((s, d) => s + d.weightValue, 0);
      expect(total).toBeGreaterThanOrEqual(93);
      expect(total).toBeLessThanOrEqual(107);
    }
  });

  it("points study path modules at real domains and resources", () => {
    for (const exam of exams) {
      const domains = new Set(exam.domains.map((d) => d.id));
      const resources = new Set(exam.resources.map((r) => r.id));
      for (const m of exam.studyPath) {
        for (const d of m.domainIds) expect(domains.has(d)).toBe(true);
        for (const r of m.resourceIds) expect(resources.has(r)).toBe(true);
      }
    }
  });
});
