"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/lib/actions/auth-actions";

type Props = {
  mode: "signin" | "signup";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  googleAction?: () => Promise<void>;
};

export function AuthForm({ mode, action, googleAction }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isSignUp = mode === "signup";

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold">
        {isSignUp ? "Create your account" : "Sign in"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {isSignUp
          ? "Save your quiz scores, mock exam history, and flashcard progress across devices."
          : "Pick up where you left off."}
      </p>

      {googleAction ? (
        <>
          <form action={googleAction} className="mt-5">
            <button type="submit" className="btn-secondary w-full">
              Continue with Google
            </button>
          </form>
          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            or use email
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      ) : (
        <div className="mt-5" />
      )}

      <form action={formAction} className="space-y-3">
        {isSignUp && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <input id="name" name="name" required maxLength={80} className="field" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="field"
          />
          {isSignUp && <p className="mt-1 text-xs text-muted">At least 8 characters.</p>}
        </div>

        {state?.error && (
          <p className="rounded-lg border border-line bg-bad-soft px-3 py-2 text-sm text-bad">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Working…" : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        {isSignUp ? "Already have an account? " : "No account yet? "}
        <Link href={isSignUp ? "/signin" : "/signup"} className="text-accent-text underline">
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
