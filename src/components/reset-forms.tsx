"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ResetFormState } from "@/lib/actions/reset-actions";

type Action = (state: ResetFormState, formData: FormData) => Promise<ResetFormState>;

export function RequestResetForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  if (state?.sent) {
    return (
      <div className="card p-6">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          If that address has an account with a password, a reset link is on its way. It expires in
          one hour and can be used once.
        </p>
        <p className="mt-3 text-sm text-muted">
          Signed up with Google? There is no password to reset — use{" "}
          <Link href="/signin" className="text-accent-text underline">
            Continue with Google
          </Link>{" "}
          instead.
        </p>
        <Link href="/signin" className="btn-secondary mt-5">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted">
        Enter your email address and we will send you a link to choose a new password.
      </p>
      <form action={formAction} className="mt-5 space-y-3">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" />
        </div>
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        <Link href="/signin" className="text-accent-text underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export function CompleteResetForm({ action, token }: { action: Action; token: string }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  if (state?.done) {
    return (
      <div className="card p-6">
        <h1 className="text-xl font-semibold">Password updated</h1>
        <p className="mt-2 text-sm text-muted">
          You can now sign in with your new password. Any other sessions have been signed out.
        </p>
        <Link href="/signin" className="btn-primary mt-5">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold">Choose a new password</h1>
      <form action={formAction} className="mt-5 space-y-3">
        <input type="hidden" name="token" value={token} />
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="field"
          />
          <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1 block text-sm font-medium">
            Confirm new password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="field"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg border border-line bg-bad-soft px-3 py-2 text-sm text-bad">
            {state.error}{" "}
            <Link href="/forgot-password" className="underline">
              Request a new link
            </Link>
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
