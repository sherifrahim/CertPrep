import { redirect } from "next/navigation";
import { auth, isGoogleEnabled } from "@/auth";
import { AuthForm } from "@/components/auth-form";
import { signInWithGoogle, signUpWithCredentials } from "@/lib/actions/auth-actions";

export const metadata = { title: "Create account" };

export default async function SignUpPage() {
  if ((await auth())?.user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <AuthForm
        mode="signup"
        action={signUpWithCredentials}
        googleAction={isGoogleEnabled ? signInWithGoogle : undefined}
      />
    </div>
  );
}
