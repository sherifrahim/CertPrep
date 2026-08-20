import Link from "next/link";
import { exams } from "@/content";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-sm font-semibold text-accent-text">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">We could not find that page</h1>
      <p className="mt-3 text-muted">
        The link may be out of date, or the exam may have been renamed. Everything below still works.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
        {exams.map((exam) => (
          <Link key={exam.id} href={`/exams/${exam.id}`} className="btn-secondary">
            {exam.code}
          </Link>
        ))}
      </div>
    </div>
  );
}
