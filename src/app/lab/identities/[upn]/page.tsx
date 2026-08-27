import { notFound } from "next/navigation";
import { IdentityPage } from "@/components/lab/xdr/identity-page";
import { buildIdentities, getIdentity } from "@/lab/identity";

export function generateStaticParams() {
  return buildIdentities().map((i) => ({ upn: i.samAccountName }));
}

export async function generateMetadata({ params }: { params: Promise<{ upn: string }> }) {
  const { upn } = await params;
  const identity = getIdentity(decodeURIComponent(upn));
  return {
    title: identity ? identity.displayName : "Identity",
    description: "Identity entity page with response actions and sign-in activity.",
  };
}

export default async function IdentityEntityPage({
  params,
}: {
  params: Promise<{ upn: string }>;
}) {
  const { upn } = await params;
  const identity = getIdentity(decodeURIComponent(upn));
  if (!identity) notFound();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Defender XDR · Assets
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Identity entity</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Take response actions and watch whether the account is actually contained. Disabling and
          revoking sessions are not alternatives — one of them leaves the attacker&rsquo;s existing
          token working, the other lets them sign back in.
        </p>
      </div>
      <IdentityPage identity={identity} />
    </div>
  );
}
