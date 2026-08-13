import { notFound } from "next/navigation";
import { getExam } from "@/content";
import type { ResourceKind } from "@/content/types";

export const metadata = { title: "Resources" };

const kindLabels: Record<ResourceKind, string> = {
  official: "Official docs",
  pdf: "Reference / download",
  video: "Video",
  lab: "Hands-on lab",
  practice: "Practice questions",
  community: "Community",
  tool: "Tool / cheat sheet",
};

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const exam = getExam(examId);
  if (!exam) notFound();

  const grouped = new Map<ResourceKind, typeof exam.resources>();
  for (const resource of exam.resources) {
    grouped.set(resource.kind, [...(grouped.get(resource.kind) ?? []), resource]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Study resources</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Every link points to the original source. Nothing is re-hosted here, so material stays
        current and you always get it from the publisher.
      </p>

      <div className="mt-8 space-y-8">
        {[...grouped.entries()].map(([kind, resources]) => (
          <section key={kind}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {kindLabels[kind]}
            </h2>
            <ul className="mt-3 space-y-3">
              {resources.map((resource) => (
                <li key={resource.id}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="card block p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{resource.title} ↗</h3>
                      {resource.free && (
                        <span className="rounded-md bg-ok-soft px-2 py-0.5 text-xs font-medium text-ok">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted">{resource.description}</p>
                    <p className="mt-2 text-xs text-muted">{resource.provider}</p>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
