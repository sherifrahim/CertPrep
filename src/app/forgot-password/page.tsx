import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RequestResetForm } from "@/components/reset-forms";
import { requestPasswordReset } from "@/lib/actions/reset-actions";

export const metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage() {
  if ((await auth())?.user) redirect("/dashboard");
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <RequestResetForm action={requestPasswordReset} />
    </div>
  );
}
