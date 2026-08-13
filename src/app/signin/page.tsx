import { redirect } from "next/navigation";
import { auth, isGoogleEnabled } from "@/auth";
import { AuthForm } from "@/components/auth-form";
import { signInWithCredentials, signInWithGoogle } from "@/lib/actions/auth-actions";

export const metadata = { title: "Sign in" };

/** Auth.js redirects here with ?error=<code> when a provider flow fails. */
const providerErrors: Record<string, string> = {
  OAuthAccountNotLinked:
    "That email address already has an account with a password. Sign in with your password below — for security we don't link a Google account to an existing password account automatically.",
  OAuthSignin: "Could not start the Google sign-in flow. Please try again.",
  OAuthCallback: "Google sign-in did not complete. Please try again.",
  AccessDenied: "Access was denied during sign-in.",
  Configuration:
    "Google sign-in is not configured correctly on the server. Check the AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET settings.",
  Verification: "That sign-in link has expired or has already been used.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if ((await auth())?.user) redirect("/dashboard");

  const { error } = await searchParams;
  const code = typeof error === "string" ? error : undefined;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <AuthForm
        mode="signin"
        action={signInWithCredentials}
        googleAction={isGoogleEnabled ? signInWithGoogle : undefined}
        providerError={
          code ? (providerErrors[code] ?? "Sign-in failed. Please try again.") : undefined
        }
      />
    </div>
  );
}
