"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Defender XDR entity page chrome.
 *
 * The Defender portal does not look like the Azure portal, so it does not
 * borrow the Azure shell: an entity page is a header with chips, a horizontal
 * bar of response actions, a row of tabs, and a details pane pinned to the
 * right. Reproducing that layout is most of what makes the device page
 * recognisable.
 */

export type EntityTab = { id: string; label: string; badge?: number };

export type EntityAction = {
  id: string;
  label: string;
  glyph: string;
  available: boolean;
  /** Shown as a tooltip and in the confirmation pane. */
  reason: string;
};

export type DetailEntry = { label: string; value: React.ReactNode };

type Props = {
  backHref: string;
  backLabel: string;
  glyph: string;
  name: string;
  subtitle: string;
  /** Small status chips under the name — risk, exposure, health. */
  chips: { label: string; tone: string }[];
  tags: string[];
  actions: EntityAction[];
  onAction: (id: string) => void;
  activeAction: string | null;
  tabs: EntityTab[];
  activeTab: string;
  onTab: (id: string) => void;
  details: DetailEntry[];
  children: React.ReactNode;
};

export function XdrEntityShell({
  backHref,
  backLabel,
  glyph,
  name,
  subtitle,
  chips,
  tags,
  actions,
  onAction,
  activeAction,
  tabs,
  activeTab,
  onTab,
  details,
  children,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? actions : actions.slice(0, 5);

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <Link href={backHref} className="text-xs text-accent-text">
          ← {backLabel}
        </Link>

        <div className="mt-2 flex flex-wrap items-start gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-accent-soft text-xs font-semibold text-accent-text"
          >
            {glyph}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold tracking-tight">{name}</h2>
            <p className="truncate text-xs text-muted">{subtitle}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {chips.map((c) => (
                <span key={c.label} className={`rounded px-1.5 py-0.5 text-[11px] ${c.tone}`}>
                  {c.label}
                </span>
              ))}
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded border border-line px-1.5 py-0.5 text-[11px] text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* response actions */}
        <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-line pt-2">
          {visible.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onAction(a.id)}
              disabled={!a.available}
              title={a.reason}
              className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                activeAction === a.id
                  ? "bg-accent-soft font-medium text-accent-text"
                  : "text-accent-text hover:bg-surface-2"
              }`}
            >
              <span aria-hidden className="text-sm leading-none">
                {a.glyph}
              </span>
              {a.label}
            </button>
          ))}
          {actions.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="rounded px-2 py-1 text-xs text-muted hover:bg-surface-2"
            >
              {showAll ? "Fewer actions" : `⋯ ${actions.length - 5} more`}
            </button>
          )}
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1 border-b border-line px-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTab(t.id)}
                className={`px-3 py-2 text-xs ${
                  activeTab === t.id
                    ? "border-b-2 border-accent font-medium text-ink"
                    : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="ml-1.5 rounded bg-surface-2 px-1 text-[10px]">{t.badge}</span>
                )}
              </button>
            ))}
          </div>
          <div className="p-4">{children}</div>
        </div>

        <aside className="border-t border-line p-4 xl:border-l xl:border-t-0">
          <h3 className="mb-2 text-xs font-semibold">Details</h3>
          <dl className="space-y-1.5 text-xs">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-muted">{d.label}</dt>
                <dd className="break-words">{d.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}
