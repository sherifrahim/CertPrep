import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CompleteResetForm } from "@/components/reset-forms";
import { completePasswordReset } from "@/lib/actions/reset-actions";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if ((await auth())?.user) redirect("/dashboard");

  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";

  if (!value) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="card p-6 text-sm text-muted">
          <p className="font-medium text-ink">That link is not valid</p>
          <p className="mt-2">Reset links include a token. Request a fresh one to continue.</p>
          <Link href="/forgot-password" className="btn-primary mt-4">
            Request a reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <CompleteResetForm action={completePasswordReset} token={value} />
    </div>
  );
}
