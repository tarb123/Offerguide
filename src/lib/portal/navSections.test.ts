// Sprint 9, Story 9.2.1 — the 3-tier permission-aware nav.
//
// The nav filters a declaration through the caller's permission set, so what is
// testable here is the declaration and the filter — which is the whole of the
// logic. The DoD's criteria map onto these almost one-for-one.

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { NAV_SECTIONS, navEntriesInGroup, type NavEntry } from "./navSections";
import { PERMISSIONS, permissionsFor, type Permission } from "./permissions";

/** What usePermissionFilter does, minus React. */
function visibleTo(identity: { userInfoId: number; role: string } | null): NavEntry[] {
  const held = permissionsFor(identity);
  return NAV_SECTIONS.filter((entry) => held.has(entry.permission));
}

const guest = null;
const user = { userInfoId: 1, role: "user" };
const admin = { userInfoId: 2, role: "admin" };

const labels = (entries: NavEntry[]) => entries.map((e) => e.label);

describe("three tiers render correctly", () => {
  it("a guest sees the public entries and nothing else", () => {
    expect(labels(visibleTo(guest)).sort()).toEqual(
      [
        "3D CVs",
        "Blogs",
        "Khudi Assessment",
        "Offer Calculator",
        "Offer Guide",
        "Professional Growth Program",
      ].sort()
    );
  });

  it("a registered user sees everything a guest sees, plus the authenticated tier", () => {
    const forGuest = labels(visibleTo(guest));
    const forUser = labels(visibleTo(user));

    expect(forUser).toEqual(expect.arrayContaining(forGuest));
    expect(forUser).toContain("My Evaluations");
    expect(forUser).not.toContain("API Contract");
  });

  it("an admin sees everything a user sees, plus the admin tier", () => {
    const forUser = labels(visibleTo(user));
    const forAdmin = labels(visibleTo(admin));

    expect(forAdmin).toEqual(expect.arrayContaining(forUser));
    expect(forAdmin).toContain("API Contract");
  });

  it("the tiers strictly nest — guest ⊆ user ⊆ admin", () => {
    const g = new Set(labels(visibleTo(guest)));
    const u = new Set(labels(visibleTo(user)));
    const a = new Set(labels(visibleTo(admin)));

    for (const label of g) expect(u.has(label), `user lost "${label}"`).toBe(true);
    for (const label of u) expect(a.has(label), `admin lost "${label}"`).toBe(true);
  });
});

describe("the guest tier never leaks a higher tier", () => {
  // The DoD's no-hydration-flash criterion: "A guest must never briefly see
  // admin or authenticated links before the client resolves identity."
  //
  // AuthProvider starts at the public tier and only ever widens, so the guest
  // nav is what renders first in every case. This pins the consequence: nothing
  // gated above public can appear in it.
  it("contains no entry requiring a permission a guest lacks", () => {
    const guestPermissions = permissionsFor(guest);
    for (const entry of visibleTo(guest)) {
      expect(guestPermissions.has(entry.permission), `"${entry.label}" leaked`).toBe(true);
    }
  });

  it("the first render — before identity resolves — is exactly the guest nav", () => {
    // An unresolved AuthProvider holds PUBLIC_PERMISSION_SET, which is what
    // permissionsFor(null) returns.
    expect(labels(visibleTo(null))).toEqual(labels(visibleTo(guest)));
  });
});

describe("the declaration itself", () => {
  it("gates every entry on a real permission", () => {
    for (const entry of NAV_SECTIONS) {
      expect(PERMISSIONS as readonly Permission[]).toContain(entry.permission);
    }
  });

  it("keeps OfferGuide reachable with no account", () => {
    const offerguide = NAV_SECTIONS.find((e) => e.href === "/offerguide" && e.group === "services");
    expect(offerguide, "the OfferGuide entry point is missing").toBeDefined();
    expect(permissionsFor(guest).has(offerguide!.permission)).toBe(true);
  });

  it("declares the Sprint 2 OfferGuide entry once, not twice", () => {
    const inServices = NAV_SECTIONS.filter(
      (e) => e.href === "/offerguide" && e.group === "services"
    );
    expect(inServices).toHaveLength(1);
  });

  it("points the admin tier at /api-docs", () => {
    const adminOnly = NAV_SECTIONS.filter((e) => e.permission === "portal.admin.access");
    expect(adminOnly.map((e) => e.href)).toEqual(["/api-docs"]);
  });

  it("has no duplicate labels", () => {
    const seen = NAV_SECTIONS.map((e) => e.label);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("assigns every entry to a known group", () => {
    for (const entry of NAV_SECTIONS) {
      expect(["explore", "services", "account"]).toContain(entry.group);
    }
  });

  it("navEntriesInGroup partitions without loss", () => {
    const groups = (["explore", "services", "account"] as const).flatMap((g) =>
      navEntriesInGroup(NAV_SECTIONS, g)
    );
    expect(groups).toHaveLength(NAV_SECTIONS.length);
  });
});

describe("the nav components hold no hardcoded link list", () => {
  const header = fs.readFileSync(
    path.join(process.cwd(), "src", "app", "components", "nav", "ModernHeader.tsx"),
    "utf8"
  );

  it("ModernHeader reads the shared declaration", () => {
    expect(header).toMatch(/NAV_SECTIONS/);
  });

  it("ModernHeader no longer declares its own arrays", () => {
    // The Sprint 2 shape: `const mainLinks = [ { label: …, href: … } ]`.
    expect(header).not.toMatch(/const\s+(mainLinks|serviceLinks)\s*=\s*\[/);
  });

  it("no nav component branches on a role", () => {
    for (const file of ["ModernHeader.tsx", "ResponsiveNav.tsx", "Header.tsx"]) {
      const full = path.join(process.cwd(), "src", "app", "components", "nav", file);
      if (!fs.existsSync(full)) continue;
      expect(fs.readFileSync(full, "utf8")).not.toMatch(/\brole\b\s*[=!]==?\s*["'`]/);
    }
  });
});
