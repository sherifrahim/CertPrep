import { TvmConsole } from "@/components/lab/xdr/tvm-console";

export const metadata = {
  title: "Vulnerability management",
  description:
    "Exposure score, secure score for devices, weaknesses ordered by threat, software inventory and remediation requests.",
};

export default function VulnerabilitiesPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Defender XDR · Endpoints
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Vulnerability management</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          The dashboard shows two scores that sound alike and measure opposite things. Exposure
          score counts the vulnerability the estate is carrying and lower is better; secure score
          for devices measures configuration and higher is better. Move one and watch the other stay
          where it was.
        </p>
      </div>
      <TvmConsole />
    </div>
  );
}
