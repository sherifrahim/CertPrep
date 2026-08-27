import { AsrConsole } from "@/components/lab/xdr/asr-console";

export const metadata = {
  title: "Attack surface reduction",
  description:
    "ASR rules in audit, block and warn, with the real rule identifiers — and what each state would have done to this tenant's intrusion.",
};

export default function AsrPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Defender XDR · Endpoints
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Attack surface reduction</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Twelve rules, most of them in audit. Audit writes exactly the same events as block and
          stops nothing, so a tenant can look thoroughly covered and be wide open — and the rule
          that would have stopped the credential dump in this lab&rsquo;s own telemetry is one of
          the ones sitting in audit right now.
        </p>
      </div>
      <AsrConsole />
    </div>
  );
}
