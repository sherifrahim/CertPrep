"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LAB_NAV } from "@/lab/nav";

/**
 * Portal chrome for the lab: a persistent left rail grouped by product, the way
 * the Defender and Azure portals present their blades. Planned blades stay
 * visible but disabled so the navigation shows the whole surface honestly.
 */
export function LabShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto flex max-w-[1600px] gap-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-30 rounded-full border border-line bg-surface px-4 py-2 text-sm shadow-lg lg:hidden"
        aria-expanded={open}
      >
        {open ? "Close blades" : "Blades"}
      </button>

      <nav
        aria-label="Lab blades"
        className={`${
          open ? "block" : "hidden"
        } fixed inset-y-0 left-0 z-20 w-64 overflow-y-auto border-r border-line bg-surface p-3 pt-16 lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:pt-3`}
      >
        <Link
          href="/lab"
          className={`mb-3 block rounded px-2 py-1.5 text-sm font-medium ${
            pathname === "/lab" ? "bg-accent-soft text-accent-text" : "hover:bg-surface-2"
          }`}
        >
          Lab home
        </Link>

        {LAB_NAV.map((section) => (
          <div key={section.product} className="mb-4">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
              {section.product}
            </p>
            {section.groups.map((group) => (
              <div key={group.label} className="mb-2">
                <p className="px-2 py-1 text-xs text-muted/80">{group.label}</p>
                <ul>
                  {group.blades.map((blade) => {
                    const active = pathname.startsWith(blade.href);
                    if (blade.status === "planned") {
                      return (
                        <li key={blade.href}>
                          <span
                            title="Not built yet"
                            className="flex cursor-not-allowed items-center gap-2 rounded px-2 py-1.5 text-sm text-muted/50"
                          >
                            {blade.label}
                            <span className="ml-auto text-[10px] uppercase">soon</span>
                          </span>
                        </li>
                      );
                    }
                    return (
                      <li key={blade.href}>
                        <Link
                          href={blade.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`block rounded px-2 py-1.5 text-sm ${
                            active
                              ? "bg-accent-soft font-medium text-accent-text"
                              : "hover:bg-surface-2"
                          }`}
                        >
                          {blade.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </nav>

      <main className="min-w-0 flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
