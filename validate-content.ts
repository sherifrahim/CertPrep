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

    const optionIds = new Set(q.options.map((o) => o.id));
    if (q.options.length < 2) fail(`${q.id}: fewer than 2 options`);
    if (optionIds.size !== q.options.length) fail(`${q.id}: duplicate option ids`);
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
    if (q.correct.length === q.options.length) fail(`${q.id}: every option is marked correct`);
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
