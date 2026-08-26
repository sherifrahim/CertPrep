import { EmailExplorer } from "@/components/lab/email-explorer";
import { allMail } from "@/lab/email";

export const metadata = {
  title: "Email Explorer",
  description: "Hunt delivered mail, see who clicked, and remediate across mailboxes.",
};

export default function EmailPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Defender XDR · Email &amp; collaboration
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Explorer</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Delivered mail with its URLs and click-throughs joined. The row highlighted in red is the
          one that matters: receiving a phishing message and clicking it call for different
          responses, and soft delete versus hard delete is a decision you cannot undo in one
          direction.
        </p>
      </div>
      <EmailExplorer mail={allMail()} />
    </div>
  );
}
