/**
 * Referential-integrity check for the exam content banks.
 *
 *   npx tsx validate-content.ts
 *
 * Catches the mistakes that are easy to make when adding questions in bulk:
 * unknown domain ids, correct answers that aren't real options, single-answer
 * questions with more than one key, duplicate ids across exams, and domains
 * that no longer hold enough questions for their weighted mock-exam quota.
 */
import { exams } from "./src/content";

let errors = 0;
const fail = (message: string) => {
  console.log(`  ✗ ${message}`);
  errors++;
};

const seenQuestionIds = new Set<string>();
const seenCardIds = new Set<string>();

for (const exam of exams) {
  const domainIds = new Set(exam.domains.map((d) => d.id));
  const resourceIds = new Set(exam.resources.map((r) => r.id));
  console.log(
    `\n${exam.code}: ${exam.questions.length} questions, ${exam.flashcards.length} cards, ${exam.domains.length} domains`,
  );

  const perDomain: Record<string, number> = {};

  for (const q of exam.questions) {
    if (seenQuestionIds.has(q.id)) fail(`duplicate question id ${q.id}`);
    seenQuestionIds.add(q.id);

    if (!domainIds.has(q.domainId)) fail(`${q.id}: unknown domainId "${q.domainId}"`);
    perDomain[q.domainId] = (perDomain[q.domainId] ?? 0) + 1;

    if (q.type === "single" || q.type === "multi") {
      const options = q.options ?? [];
      const optionIds = new Set(options.map((o) => o.id));
      if (options.length < 2) fail(`${q.id}: fewer than 2 options`);
      if (optionIds.size !== options.length) fail(`${q.id}: duplicate option ids`);
      if (q.correct.length === 0) fail(`${q.id}: no correct answer`);
      for (const c of q.correct) {
        if (!optionIds.has(c)) fail(`${q.id}: correct answer "${c}" is not one of the options`);
      }
      if (q.type === "single" && q.correct.length !== 1) {
        fail(`${q.id}: single-answer question has ${q.correct.length} correct answers`);
      }
      if (q.type === "multi" && q.correct.length < 2) {
        fail(`${q.id}: multi-answer question has only ${q.correct.length} correct answer`);
      }
      if (q.correct.length === options.length) fail(`${q.id}: every option is marked correct`);
      if (q.statements || q.steps) fail(`${q.id}: ${q.type} must not define statements or steps`);
    }

    if (q.type === "meets-goal") {
      if (!q.scenario) fail(`${q.id}: meets-goal question needs a scenario`);
      if (q.correct.length !== 1 || !["yes", "no"].includes(q.correct[0])) {
        fail(`${q.id}: meets-goal correct must be exactly ["yes"] or ["no"]`);
      }
      if (q.options) fail(`${q.id}: meets-goal supplies its own Yes/No options`);
    }

    if (q.type === "statements") {
      const statements = q.statements ?? [];
      if (statements.length < 2) fail(`${q.id}: statements question needs at least 2 statements`);
      const ids = new Set(statements.map((s) => s.id));
      if (ids.size !== statements.length) fail(`${q.id}: duplicate statement ids`);
      const expected = statements.filter((s) => s.correct).map((s) => s.id);
      const sameSet =
        expected.length === q.correct.length && expected.every((id) => q.correct.includes(id));
      if (!sameSet) {
        fail(`${q.id}: correct [${q.correct}] does not match statements flagged true [${expected}]`);
      }
      if (statements.every((s) => s.correct) || statements.every((s) => !s.correct)) {
        fail(`${q.id}: every statement has the same answer, which gives the game away`);
      }
    }

    if (q.type === "ordering") {
      const steps = q.steps ?? [];
      if (steps.length < 3) fail(`${q.id}: ordering question needs at least 3 steps`);
      const ids = new Set(steps.map((s) => s.id));
      if (ids.size !== steps.length) fail(`${q.id}: duplicate step ids`);
      if (q.correct.length !== steps.length) {
        fail(`${q.id}: correct order lists ${q.correct.length} of ${steps.length} steps`);
      }
      for (const c of q.correct) {
        if (!ids.has(c)) fail(`${q.id}: correct order references unknown step "${c}"`);
      }
    }
    if (!q.explanation || q.explanation.length < 40) fail(`${q.id}: explanation missing or too short`);
    if (![1, 2, 3].includes(q.difficulty)) fail(`${q.id}: difficulty must be 1, 2, or 3`);
    if (q.reference && !q.reference.url.startsWith("https://")) fail(`${q.id}: reference is not https`);
  }

  for (const card of exam.flashcards) {
    if (seenCardIds.has(card.id)) fail(`duplicate flashcard id ${card.id}`);
    seenCardIds.add(card.id);
    if (!domainIds.has(card.domainId)) fail(`${card.id}: unknown domainId "${card.domainId}"`);
    if (!card.front || !card.back) fail(`${card.id}: empty front or back`);
  }

  for (const step of exam.studyPath) {
    for (const d of step.domainIds) {
      if (!domainIds.has(d)) fail(`${step.id}: unknown domainId "${d}"`);
    }
    for (const r of step.resourceIds) {
      if (!resourceIds.has(r)) fail(`${step.id}: unknown resourceId "${r}"`);
    }
  }

  // A mock paper draws from each domain in proportion to its official weight.
  const totalWeight = exam.domains.reduce((sum, d) => sum + d.weightValue, 0);
  for (const domain of exam.domains) {
    const quota = Math.round((domain.weightValue / totalWeight) * exam.mock.questionCount);
    const available = perDomain[domain.id] ?? 0;
    const ok = available >= quota;
    if (!ok) fail(`${domain.id}: mock needs ~${quota} questions, only ${available} available`);
    console.log(
      `   ${domain.id.padEnd(12)} ${String(available).padStart(3)} questions (mock quota ~${quota}) ${ok ? "ok" : "SHORT"}`,
    );
  }

  if (exam.questions.length < exam.mock.questionCount) {
    fail(`bank smaller than mock size (${exam.questions.length} < ${exam.mock.questionCount})`);
  }
}

console.log(errors === 0 ? "\nALL CHECKS PASSED" : `\n${errors} PROBLEM(S) FOUND`);
process.exit(errors ? 1 : 0);
