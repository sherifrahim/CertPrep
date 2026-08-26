import Link from "next/link";
import { IOC, DEVICES, USERS, tableRowCounts } from "@/lab/data";
import { PLANNED_BLADES, READY_BLADES } from "@/lab/nav";
import { TABLES } from "@/lab/schema";

export const metadata = {
  title: "Practice lab",
  description:
    "A simulated Microsoft Defender XDR and Sentinel environment: run real KQL against realistic telemetry with an intrusion hidden in it.",
};

export default function LabPage() {
  const counts = tableRowCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-5xl">
      <p className="chip">Hands-on</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Practice lab</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Reading about advanced hunting is not the same as using it. This is a simulated tenant with
        real telemetry, a real KQL engine, and a real intrusion buried in the noise — so you can
        practise the portal work the exams assume you have done.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Tables", value: TABLES.length },
          { label: "Records", value: total.toLocaleString() },
          { label: "Devices and users", value: DEVICES.length + USERS.length },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold tracking-tight">Blades</h2>
        <p className="mt-1 text-sm text-muted">
          {READY_BLADES.length} built, {PLANNED_BLADES.length} planned. Everything is listed so the
          navigation shows the whole surface rather than hiding the gaps.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {READY_BLADES.map((blade) => (
            <Link key={blade.href} href={blade.href} className="card p-5 transition-shadow hover:shadow-md">
              <h3 className="font-medium">{blade.label}</h3>
              <p className="mt-1 text-sm text-muted">{blade.hint}</p>
              <span className="mt-3 inline-block text-sm text-accent-text">Open →</span>
            </Link>
          ))}
        </div>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-accent-text">
            {PLANNED_BLADES.length} blades still to build
          </summary>
          <ul className="mt-2 grid gap-1 text-sm text-muted sm:grid-cols-2">
            {PLANNED_BLADES.map((b) => (
              <li key={b.href}>
                <span className="font-medium text-ink">{b.label}</span> — {b.hint}
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">The environment</h2>
        <p className="mt-1 text-sm text-muted">
          Contoso, a mid-size finance business. Seven days of telemetry across endpoints, identity,
          email, cloud apps, and the firewall.
        </p>
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Table</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Records</th>
              </tr>
            </thead>
            <tbody>
              {TABLES.map((t) => (
                <tr key={t.name} className="border-b border-line last:border-0">
                  <td className="px-4 py-2 font-mono text-xs">{t.name}</td>
                  <td className="px-4 py-2 text-muted">{t.source}</td>
                  <td className="px-4 py-2">{(counts[t.name] ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">There is something to find</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          This environment is not random noise. A complete intrusion runs through it — initial
          access by phishing, credential theft, lateral movement, and exfiltration — and every stage
          is visible in the telemetry if you query for it. Start from{" "}
          <code className="font-mono text-xs">EmailEvents</code> where{" "}
          <code className="font-mono text-xs">ThreatTypes == &quot;Phish&quot;</code> and follow it.
        </p>
        <details className="card mt-4 p-4">
          <summary className="cursor-pointer text-sm font-medium text-accent-text">
            Reveal the answer (try hunting first)
          </summary>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>A phishing message from {IOC.phishSender} reached six mailboxes.</li>
            <li>{IOC.victimUpn} clicked the link; nobody else did.</li>
            <li>
              Their credentials were replayed from {IOC.c2Ip} with no MFA, and the same address
              sprayed other Finance accounts.
            </li>
            <li>
              On {IOC.victimDevice}, encoded PowerShell ran, then LSASS was dumped using
              comsvcs.dll MiniDump.
            </li>
            <li>
              The {IOC.compromisedService} account moved laterally to {IOC.pivotDevice}.
            </li>
            <li>Finance data was archived and sent out to the same address.</li>
          </ol>
        </details>
      </section>

      <p className="mt-10 rounded-lg border border-line bg-surface-2 p-4 text-sm text-muted">
        This is a simulation for learning, not a Microsoft product. Table names, columns, and KQL
        behaviour follow the real thing closely so your queries transfer, but the data is synthetic
        and the engine supports a documented subset of KQL.
      </p>
    </div>
  );
}
