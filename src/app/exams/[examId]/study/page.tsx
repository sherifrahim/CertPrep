import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/content";

export const metadata = { title: "Study path" };

export default async function StudyPathPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const exam = getExam(examId);
  if (!exam) notFound();

  const totalHours = exam.studyPath.reduce((sum, m) => sum + m.estimatedHours, 0);
  const resourceById = new Map(exam.resources.map((r) => [r.id, r]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Study path</h1>
      <p className="mt-2 max-w-2xl text-muted">
        {exam.studyPath.length} modules, roughly {totalHours} hours of focused study. Work through
        them in order — each one ends with practice on the skill areas it covers.
      </p>

      <ol className="mt-8 space-y-4">
        {exam.studyPath.map((module, i) => (
          <li key={module.id} className="card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">
                <span className="text-muted">{i + 1}.</span> {module.title}
              </h2>
              <span className="chip">~{module.estimatedHours} hours</span>
            </div>

            <p className="mt-3 text-sm text-muted">{module.summary}</p>

            <h3 className="mt-5 text-sm font-medium">By the end you can</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
              {module.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>

            {module.resourceIds.length > 0 && (
              <>
                <h3 className="mt-5 text-sm font-medium">Read alongside</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {module.resourceIds.map((id) => {
                    const resource = resourceById.get(id);
                    if (!resource) return null;
                    return (
                      <li key={id}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent-text underline"
                        >
                          {resource.title} ↗
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {module.domainIds.map((domainId) => (
                <Link
                  key={domainId}
                  href={`/exams/${exam.id}/practice?domain=${domainId}&count=10&start=1`}
                  className="btn-secondary text-xs"
                >
                  Practice: {exam.domains.find((d) => d.id === domainId)?.name ?? domainId}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
