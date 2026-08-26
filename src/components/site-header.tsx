import Link from "next/link";
import { auth } from "@/auth";
import { exams } from "@/content";
import { signOutAction } from "@/lib/actions/auth-actions";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Cert<span className="text-accent-text">Prep</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm text-muted sm:flex">
          {exams.map((exam) => (
            <Link
              key={exam.id}
              href={`/exams/${exam.id}`}
              className="rounded-md px-2.5 py-1.5 hover:bg-surface-2 hover:text-ink"
            >
              {exam.code}
            </Link>
          ))}
        </nav>

        <Link
          href="/lab"
          className="hidden rounded-md px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-ink sm:block"
        >
          Lab
        </Link>

        <div className="ml-auto flex items-center gap-2 text-sm">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="btn-ghost">
                Dashboard
              </Link>
              <form action={signOutAction}>
                <button type="submit" className="btn-secondary">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/signin" className="btn-ghost">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
