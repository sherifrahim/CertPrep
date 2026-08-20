/**
 * Minimal outbound mail.
 *
 * With `RESEND_API_KEY` set, mail is sent through Resend. Without it — local
 * development, or a deployment where email is not wired up yet — the message is
 * logged to the server console so the flow remains testable end to end rather
 * than silently failing.
 */
export type Mail = { to: string; subject: string; text: string };

export async function sendMail(mail: Mail): Promise<{ delivered: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM ?? "CertPrep <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(
      `[mailer] No RESEND_API_KEY set — logging instead of sending.\n` +
        `To: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n`,
    );
    return { delivered: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, text: mail.text }),
    });
    if (!res.ok) {
      console.error("[mailer] send failed", res.status, await res.text().catch(() => ""));
      return { delivered: false };
    }
    return { delivered: true };
  } catch (error) {
    console.error("[mailer] send threw", error);
    return { delivered: false };
  }
}
