"use server";

import { z } from "zod";
import { LAB_NOW, labTables } from "@/lab/data";
import { KqlError, MAX_DISPLAY_ROWS, runQuery, type Value } from "@/lab/kql/engine";

/**
 * Query results are serialised for the client because Dates and nested arrays
 * do not survive the server-action boundary in a form the table can render.
 */
export type LabCell = string | number | boolean | null;

export type LabResult =
  | {
      ok: true;
      columns: string[];
      rows: LabCell[][];
      totalRows: number;
      truncated: boolean;
      durationMs: number;
    }
  | { ok: false; error: string };

const schema = z.object({ query: z.string().min(1).max(8000) });

function serialise(v: Value): LabCell {
  if (v === null) return null;
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return v.map((x) => (x instanceof Date ? x.toISOString() : String(x))).join(", ");
  if (typeof v === "boolean" || typeof v === "number") return v;
  return String(v);
}

export async function runLabQuery(input: unknown): Promise<LabResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a query to run." };

  try {
    // The lab clock is fixed so ago() lines up with the generated telemetry.
    const result = runQuery(parsed.data.query, labTables(), { now: LAB_NOW });
    return {
      ok: true,
      columns: result.columns,
      rows: result.rows.map((row) => result.columns.map((c) => serialise(row[c] ?? null))),
      totalRows: result.totalRows,
      truncated: result.totalRows > MAX_DISPLAY_ROWS,
      durationMs: result.durationMs,
    };
  } catch (error) {
    if (error instanceof KqlError) return { ok: false, error: error.message };
    console.error("[lab] query failed", error);
    return { ok: false, error: "That query could not be run. Check the syntax and try again." };
  }
}
