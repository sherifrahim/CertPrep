import { QuarantineConsole } from "@/components/lab/quarantine-console";
import { buildQuarantine } from "@/lab/quarantine";

export const metadata = {
  title: "Quarantine",
  description:
    "Review, release and report quarantined mail, and see how the quarantine policy decides what a recipient may do.",
};

export default function QuarantinePage() {
  const messages = buildQuarantine();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Defender for Office 365
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Quarantine</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {messages.length} messages are held. Switch between the admin and end-user view to see the
          same queue as each of them does — the difference is the whole topic, and one of these
          messages is a false positive worth releasing.
        </p>
      </div>
      <QuarantineConsole messages={messages} />
    </div>
  );
}
