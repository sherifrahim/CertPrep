import { redirect } from "next/navigation";
import { auth, isGoogleEnabled } from "@/auth";
import { AuthForm } from "@/components/auth-form";
import { signInWithCredentials, signInWithGoogle } from "@/lib/actions/auth-actions";

export const metadata = { title: "Sign in" };

export default async function SignInPage() {
  if ((await auth())?.user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <AuthForm
        mode="signin"
        action={signInWithCredentials}
        googleAction={isGoogleEnabled ? signInWithGoogle : undefined}
      />
    </div>
  );
}
