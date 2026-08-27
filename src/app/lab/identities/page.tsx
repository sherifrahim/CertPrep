import Link from "next/link";
import { IDENTITY_RISK_TONE, alertsFor, buildIdentities } from "@/lab/identity";

export const metadata = {
  title: "Identities",
  description: "Directory accounts with risk, investigation priority and privilege.",
};

export default function IdentitiesPage() {
  const identities = buildIdentities().sort(
    (a, b) => b.investigationPriority - a.investigationPriority,
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Defender XDR · Assets
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Identities</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          {identities.length} accounts. <strong>Risk level</strong> comes from Entra ID Protection;{" "}
          <strong>investigation priority</strong> is accumulated unusual-activity weight from
          Defender for Identity. They are different measures and an account can score high on one
          and nothing on the other.
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Account</th>
              <th className="px-3 py-2 font-medium">Risk</th>
              <th className="px-3 py-2 font-medium">Investigation priority</th>
              <th className="px-3 py-2 font-medium">Department</th>
              <th className="px-3 py-2 font-medium">MFA</th>
              <th className="px-3 py-2 font-medium">Alerts</th>
              <th className="px-3 py-2 font-medium">Tags</th>
            </tr>
          </thead>
          <tbody>
            {identities.map((i) => (
              <tr key={i.upn} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="px-3 py-2">
                  <Link
                    href={`/lab/identities/${encodeURIComponent(i.samAccountName)}`}
                    className="text-accent-text"
                  >
                    {i.displayName}
                  </Link>
                  <span className="block font-mono text-[11px] text-muted">{i.upn}</span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${IDENTITY_RISK_TONE[i.riskLevel]}`}
                  >
                    {i.riskLevel}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs tabular-nums">{i.investigationPriority}</td>
                <td className="px-3 py-2 text-xs text-muted">{i.department}</td>
                <td className={`px-3 py-2 text-xs ${i.mfaRegistered ? "text-ok" : "text-bad"}`}>
                  {i.mfaRegistered ? "Registered" : "Not registered"}
                </td>
                <td className="px-3 py-2 text-xs">{alertsFor(i).length}</td>
                <td className="px-3 py-2">
                  <span className="flex flex-wrap gap-1">
                    {i.privileged && (
                      <span className="rounded bg-warn-soft px-1.5 py-0.5 text-[10px] text-warn">
                        Privileged
                      </span>
                    )}
                    {i.isServiceAccount && (
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted">
                        Service account
                      </span>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
