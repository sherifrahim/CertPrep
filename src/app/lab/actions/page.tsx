import { ActionCenter } from "@/components/lab/action-center";
import { buildActions, pendingActions } from "@/lab/actions";

export const metadata = {
  title: "Action center",
  description:
    "Approve or reject pending remediation from an automated investigation, and see how the device group's automation level decides what waits for you.",
};

export default function ActionsPage() {
  const actions = buildActions();
  const pending = pendingActions(actions);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Defender XDR
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Action center</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {pending.length} actions are waiting on a decision. Each one shows what it actually does,
          what it costs if you are wrong, and the query that proves the case either way — because
          approving remediation is a judgement, not a reflex.
        </p>
      </div>
      <ActionCenter actions={actions} />
    </div>
  );
}
