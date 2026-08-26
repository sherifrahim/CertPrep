import type { Classification, IncidentStatus } from "./incidents";

/**
 * Analyst triage decisions, kept in the browser.
 *
 * The lab environment itself is read-only and identical for everyone, so only
 * the decisions a learner makes need storing. localStorage keeps that working
 * for signed-out visitors and avoids a database round trip per click; the
 * trade-off is that triage does not follow you to another device.
 */
export type TriageState = {
  status?: IncidentStatus;
  classification?: Classification;
  owner?: string;
  notes?: string;
  updatedAt?: number;
};

const KEY = "certprep.lab.triage";

type Store = Record<string, TriageState>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
}

function write(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Private mode or a full quota: losing triage state is acceptable.
  }
}

export function getTriage(incidentId: string): TriageState {
  return read()[incidentId] ?? {};
}

export function getAllTriage(): Store {
  return read();
}

export function setTriage(incidentId: string, patch: TriageState): TriageState {
  const store = read();
  const next = { ...store[incidentId], ...patch, updatedAt: Date.now() };
  store[incidentId] = next;
  write(store);
  return next;
}

export function resetTriage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
