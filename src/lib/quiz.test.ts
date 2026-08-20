import { describe, expect, it } from "vitest";
import type { Question } from "@/content/types";
import {
  buildMockPaper,
  isCorrect,
  pickPracticeQuestions,
  randomiseAll,
  randomiseQuestion,
  seedFrom,
  shuffle,
  standaloneQuestions,
} from "./quiz";
import { exams, getExam } from "@/content";

const q = (over: Partial<Question>): Question => ({
  id: "t1",
  domainId: "d",
  type: "single",
  prompt: "p",
  options: [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
    { id: "c", text: "C" },
    { id: "d", text: "D" },
  ],
  correct: ["a"],
  explanation: "e".repeat(50),
  difficulty: 1,
  ...over,
});

describe("shuffle", () => {
  // Regression: the original LCG read `state % (i + 1)`, whose low bits cycle
  // 0,3,2,1 forever, so nothing was actually shuffled.
  it("distributes every element across every position", () => {
    const counts = [0, 0, 0, 0];
    const runs = 40_000;
    for (let i = 0; i < runs; i++) {
      counts[shuffle([0, 1, 2, 3], seedFrom(`s${i}`))[0]]++;
    }
    for (const c of counts) {
      expect(c / runs).toBeGreaterThan(0.22);
      expect(c / runs).toBeLessThan(0.28);
    }
  });

  it("is deterministic for a given seed", () => {
    expect(shuffle([1, 2, 3, 4, 5], 42)).toEqual(shuffle([1, 2, 3, 4, 5], 42));
  });

  it("does not mutate its input", () => {
    const input = [1, 2, 3, 4];
    shuffle(input, 7);
    expect(input).toEqual([1, 2, 3, 4]);
  });

  it("preserves every element", () => {
    const out = shuffle([1, 2, 3, 4, 5, 6], 99);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("isCorrect", () => {
  it("grades single answers", () => {
    expect(isCorrect(q({}), ["a"])).toBe(true);
    expect(isCorrect(q({}), ["b"])).toBe(false);
    expect(isCorrect(q({}), [])).toBe(false);
  });

  it("requires the exact set for multi answers", () => {
    const m = q({ type: "multi", correct: ["a", "b"] });
    expect(isCorrect(m, ["a", "b"])).toBe(true);
    expect(isCorrect(m, ["b", "a"])).toBe(true); // order irrelevant
    expect(isCorrect(m, ["a"])).toBe(false); // partial is not correct
    expect(isCorrect(m, ["a", "b", "c"])).toBe(false); // extra is not correct
  });

  it("grades meets-goal as yes/no", () => {
    const g = q({ type: "meets-goal", options: undefined, correct: ["no"] });
    expect(isCorrect(g, ["no"])).toBe(true);
    expect(isCorrect(g, ["yes"])).toBe(false);
  });

  it("treats an empty statement selection as all-No", () => {
    const s = q({
      type: "statements",
      options: undefined,
      statements: [
        { id: "s1", text: "x", correct: false },
        { id: "s2", text: "y", correct: false },
      ],
      correct: [],
    });
    expect(isCorrect(s, [])).toBe(true);
    expect(isCorrect(s, ["s1"])).toBe(false);
  });

  it("requires exact sequence for ordering", () => {
    const o = q({
      type: "ordering",
      options: undefined,
      steps: [
        { id: "1", text: "one" },
        { id: "2", text: "two" },
        { id: "3", text: "three" },
      ],
      correct: ["1", "2", "3"],
    });
    expect(isCorrect(o, ["1", "2", "3"])).toBe(true);
    expect(isCorrect(o, ["1", "3", "2"])).toBe(false); // same set, wrong order
    expect(isCorrect(o, ["1", "2"])).toBe(false);
  });
});

describe("randomiseQuestion", () => {
  it("keeps the key correct after reordering", () => {
    for (let i = 0; i < 500; i++) {
      const r = randomiseQuestion(q({}), seedFrom(`r${i}`));
      expect(isCorrect(r, r.correct)).toBe(true);
      expect(r.options?.map((o) => o.id).sort()).toEqual(["a", "b", "c", "d"]);
    }
  });

  it("spreads the key across all positions", () => {
    const at: Record<number, number> = {};
    const runs = 4000;
    for (let i = 0; i < runs; i++) {
      const r = randomiseQuestion(q({}), seedFrom(`p${i}`));
      at[r.options!.findIndex((o) => o.id === "a")] =
        (at[r.options!.findIndex((o) => o.id === "a")] ?? 0) + 1;
    }
    for (const pos of [0, 1, 2, 3]) {
      expect(at[pos] / runs).toBeGreaterThan(0.2);
    }
  });

  it("never leaves Yes/No options reordered", () => {
    const g = q({ type: "meets-goal", options: undefined, correct: ["yes"] });
    expect(randomiseQuestion(g, 123).options).toBeUndefined();
  });

  it("never presents an ordering question already solved", () => {
    const o = q({
      type: "ordering",
      options: undefined,
      steps: [
        { id: "1", text: "one" },
        { id: "2", text: "two" },
        { id: "3", text: "three" },
      ],
      correct: ["1", "2", "3"],
    });
    for (let i = 0; i < 1000; i++) {
      const r = randomiseQuestion(o, seedFrom(`o${i}`));
      expect(r.steps!.map((s) => s.id).join()).not.toBe(r.correct.join());
    }
  });
});

describe("question pools", () => {
  it("excludes case study questions from the standalone pool", () => {
    for (const exam of exams) {
      const pool = standaloneQuestions(exam);
      expect(pool.every((x) => !x.caseStudyId)).toBe(true);
      expect(pool.length).toBeLessThan(exam.questions.length);
    }
  });

  it("builds a full-length mock with no case study questions and no duplicates", () => {
    for (const exam of exams) {
      const paper = buildMockPaper(exam, seedFrom(exam.id));
      expect(paper).toHaveLength(exam.mock.questionCount);
      expect(paper.every((x) => !x.caseStudyId)).toBe(true);
      expect(new Set(paper.map((x) => x.id)).size).toBe(paper.length);
    }
  });

  it("weights the mock roughly to the official domain percentages", () => {
    const exam = getExam("sc-200")!;
    const paper = buildMockPaper(exam, seedFrom("weights"));
    const total = exam.domains.reduce((s, d) => s + d.weightValue, 0);
    for (const domain of exam.domains) {
      const expected = (domain.weightValue / total) * exam.mock.questionCount;
      const actual = paper.filter((x) => x.domainId === domain.id).length;
      expect(Math.abs(actual - expected)).toBeLessThanOrEqual(3);
    }
  });

  it("honours the domain filter and count in practice", () => {
    const exam = getExam("az-500")!;
    const picked = pickPracticeQuestions(exam, ["identity"], 5, seedFrom("f"));
    expect(picked).toHaveLength(5);
    expect(picked.every((x) => x.domainId === "identity")).toBe(true);
  });

  it("randomiseAll does not drop or duplicate questions", () => {
    const exam = getExam("sc-401")!;
    const out = randomiseAll(exam.questions, 7);
    expect(out.map((x) => x.id)).toEqual(exam.questions.map((x) => x.id));
  });
});
