import { describe, expect, it } from "vitest";
import { IOC, USERS } from "./data";
import {
  IDENTITY_ACTIONS,
  alertsFor,
  assessContainment,
  buildIdentities,
  devicesFor,
  getIdentity,
  signInsFor,
  type IdentityActionId,
} from "./identity";

const identities = buildIdentities();
const victim = identities.find((i) => i.upn === IOC.victimUpn)!;
const service = identities.find((i) => i.isServiceAccount)!;

describe("buildIdentities", () => {
  it("covers every directory account", () => {
    expect(identities).toHaveLength(USERS.length);
    expect(new Set(identities.map((i) => i.upn)).size).toBe(identities.length);
  });

  it("marks the compromised user high risk with no MFA", () => {
    expect(victim.riskLevel).toBe("High");
    expect(victim.mfaRegistered).toBe(false);
  });

  it("recognises the service account and its privilege", () => {
    expect(service.samAccountName.startsWith("svc_")).toBe(true);
    expect(service.privileged).toBe(true);
    expect(service.groups).toContain("Domain Admins");
  });

  // Investigation priority and risk level are different measures.
  it("keeps investigation priority separate from risk level", () => {
    const clean = identities.find((i) => i.riskLevel === "None")!;
    expect(clean.investigationPriority).toBe(0);
    expect(victim.investigationPriority).toBeGreaterThan(100);
  });

  it("finds an identity by UPN or SAM name", () => {
    expect(getIdentity(victim.upn)?.displayName).toBe(victim.displayName);
    expect(getIdentity(victim.samAccountName)?.upn).toBe(victim.upn);
    expect(getIdentity("nobody")).toBeUndefined();
  });
});

describe("response actions", () => {
  it("states a limitation on every action", () => {
    for (const a of IDENTITY_ACTIONS) {
      expect(a.effect.length).toBeGreaterThan(20);
      expect(a.limitation.length).toBeGreaterThan(20);
    }
  });

  // The distinction the whole blade exists for.
  it("says disabling leaves existing tokens valid", () => {
    const disable = IDENTITY_ACTIONS.find((a) => a.id === "disable-user")!;
    expect(disable.limitation).toContain("refresh and access tokens stay valid");
  });

  it("says revoking sessions is what cuts a stolen token off", () => {
    const revoke = IDENTITY_ACTIONS.find((a) => a.id === "revoke-sessions")!;
    expect(revoke.effect).toContain("refresh token");
  });

  it("describes confirm-compromised as a signal rather than a block", () => {
    const confirm = IDENTITY_ACTIONS.find((a) => a.id === "confirm-compromised")!;
    expect(confirm.limitation).toContain("Conditional Access");
  });
});

describe("assessContainment", () => {
  const check = (...taken: IdentityActionId[]) => assessContainment(taken);

  it("does not contain with nothing done", () => {
    expect(check().contained).toBe(false);
  });

  it("does not contain by disabling alone", () => {
    const r = check("disable-user");
    expect(r.contained).toBe(false);
    expect(r.explanation).toContain("already holds stays valid");
  });

  it("does not contain by revoking alone", () => {
    const r = check("revoke-sessions");
    expect(r.contained).toBe(false);
    expect(r.explanation).toContain("signing in again");
  });

  it("contains with disable plus revoke", () => {
    expect(check("disable-user", "revoke-sessions").contained).toBe(true);
  });

  it("contains with a password reset plus revoke", () => {
    expect(check("require-password-reset", "revoke-sessions").contained).toBe(true);
  });

  it("is not contained by risk signals alone", () => {
    const r = check("confirm-compromised", "mark-safe");
    expect(r.contained).toBe(false);
    expect(r.explanation).toContain("do not end a session");
  });

  it("ignores the order the actions were taken in", () => {
    expect(check("revoke-sessions", "disable-user").contained).toBe(
      check("disable-user", "revoke-sessions").contained,
    );
  });
});

describe("observed activity", () => {
  it("returns sign-ins newest first within the limit", () => {
    const rows = signInsFor(victim, 5);
    expect(rows.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].timestamp >= rows[i].timestamp).toBe(true);
    }
  });

  it("carries the fields the entity page shows", () => {
    const row = signInsFor(victim, 1)[0];
    expect(row.app.length).toBeGreaterThan(0);
    expect(row.mfa.length).toBeGreaterThan(0);
    expect(row.conditionalAccess.length).toBeGreaterThan(0);
  });

  it("lists the devices the service account touched", () => {
    const devices = devicesFor(service);
    expect(devices.length).toBeGreaterThan(0);
    expect(new Set(devices).size).toBe(devices.length);
  });

  it("attaches alerts to the compromised user", () => {
    const alerts = alertsFor(victim);
    expect(alerts.length).toBeGreaterThan(0);
    for (let i = 1; i < alerts.length; i++) {
      expect(alerts[i - 1].timestamp >= alerts[i].timestamp).toBe(true);
    }
  });

  it("returns nothing for an account with no alerts", () => {
    const quiet = identities.find((i) => alertsFor(i).length === 0);
    if (quiet) expect(alertsFor(quiet)).toEqual([]);
  });
});
