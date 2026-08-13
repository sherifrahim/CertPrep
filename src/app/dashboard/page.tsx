import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { exams, getExam } from "@/content";
import { prisma } from "@/lib/prisma";
import type { GradedAnswer } from "@/lib/actions/progress-actions";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/signin");

  const [attempts, cardStats] = await Promise.all([
    prisma.attempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.cardProgress.groupBy({
      by: ["examId"],
      where: { userId },
      _count: { _all: true },
      _avg: { box: true },
    }),
  ]);

  const domainTotals = new Map<string, { correct: number; total: number; examId: string }>();
  for (const attempt of attempts) {
    for (const answer of attempt.answers as unknown as GradedAnswer[]) {
      const key = `${attempt.examId}:${answer.domainId}`;
      const entry = domainTotals.get(key) ?? { correct: 0, total: 0, examId: attempt.examId };
      entry.total += 1;
      if (answer.wasCorrect) entry.correct += 1;
      domainTotals.set(key, entry);
    }
  }

  const weakest = [...domainTotals.entries()]
    .filter(([, stats]) => stats.total >= 3)
    .map(([key, stats]) => {
      const [examId, domainId] = key.split(":");
      return {
        examId,
        domainId,
        pct: Math.round((stats.correct / stats.total) * 100),
        total: stats.total,
      };
    })
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        {session.user?.name ? `Welcome back, ${session.user.name}` : "Your progress"}
      </h1>
      <p className="mt-2 text-muted">
        {attempts.length === 0
          ? "You have not completed any quizzes yet."
          : `${attempts.length} recorded ${attempts.length === 1 ? "attempt" : "attempts"}.`}
      </p>

      {attempts.length === 0 ? (
        <div className="card mt-6 p-6">
          <h2 className="font-medium">Pick an exam to start</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {exams.map((exam) => (
              <Link key={exam.id} href={`/exams/${exam.id}`} className="btn-secondary">
                {exam.code}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            {exams.map((exam) => {
              const examAttempts = attempts.filter((a) => a.examId === exam.id);
              const best = examAttempts.reduce(
                (max, a) => Math.max(max, a.scorePercent),
                0,
              );
              const cards = cardStats.find((c) => c.examId === exam.id);
              return (
                <Link
                  key={exam.id}
                  href={`/exams/${exam.id}`}
                  data-accent={exam.accent}
                  className="card p-5 transition-shadow hover:shadow-md"
                >
                  <p className="text-xs font-semibold text-accent-text">{exam.code}</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {examAttempts.length ? `${best}%` : "—"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    best of {examAttempts.length} {examAttempts.length === 1 ? "attempt" : "attempts"}
                  </p>
                  {cards && (
                    <p className="mt-2 text-xs text-muted">
                      {cards._count._all} cards reviewed · avg box{" "}
                      {cards._avg.box?.toFixed(1) ?? "1.0"}
                    </p>
                  )}
                </Link>
              );
            })}
          </section>

          {weakest.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Weakest skill areas</h2>
              <p className="mt-1 text-sm text-muted">
                Based on every question you have answered, where you have at least three data points.
              </p>
              <ul className="card mt-4 divide-y divide-[var(--border)]">
                {weakest.map((item) => {
                  const exam = getExam(item.examId);
                  const domain = exam?.domains.find((d) => d.id === item.domainId);
                  return (
                    <li
                      key={`${item.examId}-${item.domainId}`}
                      className="flex flex-wrap items-center gap-3 p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{domain?.name ?? item.domainId}</p>
                        <p className="text-xs text-muted">
                          {exam?.code} · {item.total} questions answered
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          item.pct >= 70 ? "text-ok" : "text-bad"
                        }`}
                      >
                        {item.pct}%
                      </span>
                      <Link
                        href={`/exams/${item.examId}/practice?domain=${item.domainId}&count=10&start=1`}
                        className="btn-secondary text-xs"
                      >
                        Drill this
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-lg font-semibold">Recent attempts</h2>
            <div className="card mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Exam</th>
                    <th className="px-4 py-3 font-medium">Mode</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.slice(0, 15).map((attempt) => (
                    <tr key={attempt.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 text-muted">
                        {attempt.createdAt.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {getExam(attempt.examId)?.code ?? attempt.examId}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {attempt.mode === "MOCK" ? "Mock" : "Practice"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            attempt.mode === "MOCK"
                              ? attempt.passed
                                ? "font-semibold text-ok"
                                : "font-semibold text-bad"
                              : "font-medium"
                          }
                        >
                          {attempt.scorePercent}%
                        </span>
                        <span className="ml-1.5 text-xs text-muted">
                          ({attempt.correctCount}/{attempt.totalCount})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {Math.floor(attempt.durationSec / 60)}m {attempt.durationSec % 60}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
