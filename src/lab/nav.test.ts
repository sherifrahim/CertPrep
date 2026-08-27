import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LAB_NAV, PLANNED_BLADES, READY_BLADES } from "./nav";

const ALL_BLADES = LAB_NAV.flatMap((s) => s.groups.flatMap((g) => g.blades));

/**
 * The navigation is presented to learners as an honest roadmap, so it has to
 * stay honest: a blade marked ready must have a page behind it, and a blade
 * marked planned must not silently exist.
 */
describe("the blade map", () => {
  it("has a page for every blade marked ready", () => {
    for (const blade of READY_BLADES) {
      const page = join(process.cwd(), "src", "app", `${blade.href}`, "page.tsx");
      expect(existsSync(page), `${blade.href} is marked ready but has no page.tsx`).toBe(true);
    }
  });

  it("has no page for a blade still marked planned", () => {
    for (const blade of PLANNED_BLADES) {
      const page = join(process.cwd(), "src", "app", `${blade.href}`, "page.tsx");
      expect(existsSync(page), `${blade.href} is built but still marked planned`).toBe(false);
    }
  });

  it("splits every blade into exactly one of the two states", () => {
    expect(READY_BLADES.length + PLANNED_BLADES.length).toBe(ALL_BLADES.length);
  });

  it("uses unique hrefs", () => {
    expect(new Set(ALL_BLADES.map((b) => b.href)).size).toBe(ALL_BLADES.length);
  });

  it("gives every blade a label and a hint", () => {
    for (const blade of ALL_BLADES) {
      expect(blade.label.trim().length).toBeGreaterThan(0);
      expect(blade.hint.trim().length, `${blade.href} has no hint`).toBeGreaterThan(10);
    }
  });

  it("keeps every blade under the lab route", () => {
    for (const blade of ALL_BLADES) expect(blade.href.startsWith("/lab/")).toBe(true);
  });
});
