"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consume } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mailer";
import {
  createResetToken,
  hashResetToken,
  isTokenUsable,
  resetTokenExpiry,
} from "@/lib/password-reset";

export type ResetFormState = { error?: string; sent?: boolean; done?: boolean } | undefined;

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

const resetSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Those passwords do not match",
    path: ["confirm"],
  });

export async function requestPasswordReset(
  _prev: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  const parsed = requestSchema.safeParse({ email: formData.get("email") });
  // Always report success: a differing response would reveal which addresses
  // have accounts.
  if (!parsed.success) return { sent: true };

  const { email } = parsed.data;
  // Silently drop over-limit requests: the response must not differ.
  if (!(await consume("passwordReset", email)).allowed) return { sent: true };

  const user = await prisma.user.findUnique({ where: { email } });

  // No account, or a Google-only account with no password to reset.
  if (user?.passwordHash) {
    // Invalidate any outstanding links before issuing a new one.
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const { token, tokenHash } = createResetToken();
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: resetTokenExpiry() },
    });

    const base = process.env.AUTH_URL ?? "http://localhost:3000";
    await sendMail({
      to: email,
      subject: "Reset your CertPrep password",
      text:
        `Use the link below to choose a new password. It expires in one hour and works once.\n\n` +
        `${base}/reset-password?token=${token}\n\n` +
        `If you did not ask for this, you can ignore this email — your password has not changed.`,
    });
  }

  return { sent: true };
}

export async function completePasswordReset(
  _prev: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { token, password } = parsed.data;
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });

  if (!record || !isTokenUsable(record)) {
    return { error: "That reset link has expired or has already been used. Request a new one." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(password, 12) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Existing sessions must not survive a password reset.
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { done: true };
}
