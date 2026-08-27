import { DefenderCloudConsole } from "@/components/lab/defender-cloud-console";
import { RESOURCES, secureScore } from "@/lab/defender-cloud";

export const metadata = {
  title: "Defender for Cloud",
  description:
    "Secure score, security recommendations and attack paths over a simulated Azure estate — including what each fix is actually worth.",
};

export default function DefenderCloudPage() {
  const score = secureScore();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Azure</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Defender for Cloud</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {RESOURCES.length} resources across the Contoso production subscription, sitting at{" "}
          {score.percentage}%. Work the recommendations and watch the score move — the point of the
          exercise is discovering that severity and score impact are different things.
        </p>
      </div>
      <DefenderCloudConsole />
    </div>
  );
}
