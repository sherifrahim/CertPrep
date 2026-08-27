"use client";

import { useMemo, useState } from "react";

/**
 * Azure portal resource-blade chrome.
 *
 * The portal's resource pages all share one layout, and reproducing it is most
 * of what makes a simulated blade feel like the real thing: breadcrumb, a
 * resource header with a command bar, a collapsible Essentials panel, and a
 * searchable left menu whose items are grouped exactly as Azure groups them.
 *
 * Every lab blade that represents an Azure resource renders through this, so a
 * learner navigates the same way here as they will in the portal.
 */

export type NavItem = {
  id: string;
  label: string;
  /** Shown right-aligned, as Azure does for counts and preview tags. */
  badge?: string;
  /** Renders greyed and unselectable, for surfaces the lab does not model. */
  disabled?: boolean;
};

export type NavGroup = {
  /** Undefined for the ungrouped items that sit directly under the search box. */
  label?: string;
  items: NavItem[];
};

export type EssentialsEntry = {
  label: string;
  value: React.ReactNode;
};

export type Command = {
  label: string;
  /** A single character or short glyph standing in for the portal's icon. */
  glyph: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Renders the command in the destructive style Azure uses for Delete. */
  destructive?: boolean;
};

type Props = {
  breadcrumb: string[];
  resourceName: string;
  resourceType: string;
  /** Short glyph for the resource icon tile. */
  glyph: string;
  essentials: EssentialsEntry[];
  commands?: Command[];
  nav: NavGroup[];
  activeId: string;
  onNavigate: (id: string) => void;
  children: React.ReactNode;
};

export function AzureResourceShell({
  breadcrumb,
  resourceName,
  resourceType,
  glyph,
  essentials,
  commands = [],
  nav,
  activeId,
  onNavigate,
  children,
}: Props) {
  const [search, setSearch] = useState("");
  const [essentialsOpen, setEssentialsOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return nav;
    return nav
      .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [nav, search]);

  return (
    <div className="card overflow-hidden">
      {/* breadcrumb */}
      <div className="border-b border-line px-4 py-2 text-xs text-muted">
        {breadcrumb.map((crumb, i) => (
          <span key={`${crumb}-${i}`}>
            {i > 0 && <span className="mx-1.5 opacity-60">›</span>}
            <span className={i === breadcrumb.length - 1 ? "text-ink" : ""}>{crumb}</span>
          </span>
        ))}
      </div>

      {/* resource header */}
      <div className="border-b border-line px-4 py-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded bg-accent-soft text-sm font-semibold text-accent-text"
          >
            {glyph}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold tracking-tight">{resourceName}</h2>
            <p className="truncate text-xs text-muted">{resourceType}</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="btn-secondary shrink-0 px-2 py-1 text-xs lg:hidden"
            aria-expanded={menuOpen}
          >
            Menu
          </button>
        </div>

        {commands.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-line pt-2">
            {commands.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={c.onClick}
                disabled={c.disabled}
                className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  c.destructive
                    ? "text-bad hover:bg-bad-soft"
                    : "text-accent-text hover:bg-surface-2"
                }`}
              >
                <span aria-hidden className="text-sm leading-none">
                  {c.glyph}
                </span>
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* essentials */}
      {essentials.length > 0 && (
        <div className="border-b border-line">
          <button
            type="button"
            onClick={() => setEssentialsOpen((v) => !v)}
            aria-expanded={essentialsOpen}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold hover:bg-surface-2"
          >
            <span aria-hidden className="text-[10px]">
              {essentialsOpen ? "▾" : "▸"}
            </span>
            Essentials
          </button>
          {essentialsOpen && (
            <dl className="grid gap-x-8 gap-y-1 px-4 pb-3 pl-9 text-xs sm:grid-cols-2 xl:grid-cols-3">
              {essentials.map((e) => (
                <div key={e.label} className="flex min-w-0 gap-2">
                  <dt className="shrink-0 text-muted">{e.label}</dt>
                  <dd className="min-w-0 truncate">{e.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {/* menu + content */}
      <div className="grid lg:grid-cols-[230px_minmax(0,1fr)]">
        <nav
          aria-label={`${resourceName} menu`}
          className={`${
            menuOpen ? "block" : "hidden"
          } border-b border-line bg-surface-2/40 p-2 lg:block lg:border-b-0 lg:border-r`}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            aria-label="Search menu"
            className="field mb-2 py-1 text-xs"
          />
          {filtered.map((group, gi) => {
            const isCollapsed = group.label ? collapsed[group.label] : false;
            return (
              <div key={group.label ?? `ungrouped-${gi}`} className="mb-1">
                {group.label && (
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed((c) => ({ ...c, [group.label!]: !c[group.label!] }))
                    }
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-center gap-1 px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-muted hover:text-ink"
                  >
                    <span aria-hidden className="text-[9px]">
                      {isCollapsed ? "▸" : "▾"}
                    </span>
                    {group.label}
                  </button>
                )}
                {!isCollapsed && (
                  <ul>
                    {group.items.map((item) => {
                      const active = item.id === activeId;
                      if (item.disabled) {
                        return (
                          <li key={item.id}>
                            <span
                              title="Not modelled in the lab"
                              className="flex cursor-not-allowed items-center gap-2 rounded px-2 py-1 text-xs text-muted/45"
                            >
                              {item.label}
                            </span>
                          </li>
                        );
                      }
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onNavigate(item.id);
                              setMenuOpen(false);
                            }}
                            aria-current={active ? "page" : undefined}
                            className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs ${
                              active
                                ? "bg-accent-soft font-medium text-accent-text"
                                : "hover:bg-surface-2"
                            }`}
                          >
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {item.badge && (
                              <span className="shrink-0 rounded bg-surface-2 px-1 text-[10px] text-muted">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="min-w-0 p-4">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- helpers */

/** Azure's section heading + description pairing, used at the top of each blade. */
export function BladeHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="mt-0.5 max-w-2xl text-xs text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-1">{actions}</div>}
    </div>
  );
}

/**
 * The teaching note. Kept visually distinct from the simulated portal chrome so
 * it is never mistaken for something Azure itself says.
 */
export function LabNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border-l-2 border-accent bg-accent-soft/40 p-3 text-xs">
      <p className="mb-1 font-semibold uppercase tracking-wide text-accent-text">Lab note</p>
      <div className="space-y-2 text-ink">{children}</div>
    </div>
  );
}
