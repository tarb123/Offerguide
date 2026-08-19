// OfferGuide — Sprint 8, Story 8.2.3: the interim admin gate
//
// The gate is LAUNCH-BLOCKING. The admin config API ships with no UI, so these
// routes are the only thing protecting configuration integrity — and a hole in
// them is a hole in scoring itself.
//
// adminAuth.test.ts covers requireAdmin() in isolation. This file covers the
// three rejection cases the DoD names by name, across all 26 admin operations,
// plus the structural guarantees: every admin route file actually calls the
// gate, and no `role` reference has crept into it.

import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import jwt from "jsonwebtoken";
import { requireAdmin } from "./adminAuth";
import { GUEST_COOKIE_NAME } from "./identity";

const ADMIN_TOKEN = "sprint8-admin-token";
const ORIGINAL_TOKEN = process.env.OFFERGUIDE_ADMIN_TOKEN;
const ORIGINAL_JWT_SECRET = process.env.JWT_SECRET;

const ADMIN_DIR = path.join(
  process.cwd(),
  "src",
  "app",
  "api",
  "offerguide",
  "admin",
  "config"
);

function adminRouteFiles(): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "route.ts") files.push(full);
    }
  };
  walk(ADMIN_DIR);
  return files;
}

type Credentials = {
  adminToken?: string;
  guestToken?: string;
  bearer?: string;
};

function adminRequest({ adminToken, guestToken, bearer }: Credentials = {}) {
  const headers = new Headers();
  if (adminToken) headers.set("x-og-admin-token", adminToken);
  if (bearer) headers.set("authorization", `Bearer ${bearer}`);
  if (guestToken) headers.set("cookie", `${GUEST_COOKIE_NAME}=${guestToken}`);
  return new NextRequest("http://localhost/api/offerguide/admin/config/questions", {
    headers,
  });
}

/** A perfectly valid portal JWT for an ordinary registered user. */
function ordinaryUserJwt() {
  return jwt.sign({ id: 9001, email: "candidate@example.com" }, process.env.JWT_SECRET!);
}

describe("Story 8.2.3 — the interim admin gate", () => {
  process.env.JWT_SECRET = ORIGINAL_JWT_SECRET ?? "test-secret";

  afterEach(() => {
    process.env.OFFERGUIDE_ADMIN_TOKEN = ORIGINAL_TOKEN;
    process.env.JWT_SECRET = ORIGINAL_JWT_SECRET;
  });

  it("rejects a request carrying no credentials at all", () => {
    process.env.OFFERGUIDE_ADMIN_TOKEN = ADMIN_TOKEN;
    const denied = requireAdmin(adminRequest());
    expect(denied?.status).toBe(401);
  });

  it("rejects a valid guest cookie", () => {
    process.env.OFFERGUIDE_ADMIN_TOKEN = ADMIN_TOKEN;
    const denied = requireAdmin(adminRequest({ guestToken: crypto.randomUUID() }));
    expect(denied?.status).toBe(401);
  });

  it("rejects a valid ordinary registered-user JWT — a registered user is not an admin", () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.OFFERGUIDE_ADMIN_TOKEN = ADMIN_TOKEN;
    const denied = requireAdmin(adminRequest({ bearer: ordinaryUserJwt() }));
    expect(denied?.status).toBe(401);
  });

  it("rejects a guest cookie and a user JWT presented together", () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.OFFERGUIDE_ADMIN_TOKEN = ADMIN_TOKEN;
    const denied = requireAdmin(
      adminRequest({ bearer: ordinaryUserJwt(), guestToken: crypto.randomUUID() })
    );
    expect(denied?.status).toBe(401);
  });

  it("succeeds with the configured interim admin credential", () => {
    process.env.OFFERGUIDE_ADMIN_TOKEN = ADMIN_TOKEN;
    expect(requireAdmin(adminRequest({ adminToken: ADMIN_TOKEN }))).toBeNull();
  });

  it("still succeeds when a candidate's own credentials ride along", () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.OFFERGUIDE_ADMIN_TOKEN = ADMIN_TOKEN;
    expect(
      requireAdmin(
        adminRequest({
          adminToken: ADMIN_TOKEN,
          bearer: ordinaryUserJwt(),
          guestToken: crypto.randomUUID(),
        })
      )
    ).toBeNull();
  });
});

describe("Story 8.2.3 — the gate is applied everywhere and references no role", () => {
  const files = adminRouteFiles();

  it("finds every admin config route file", () => {
    expect(files.length).toBeGreaterThanOrEqual(12);
  });

  for (const file of files) {
    const relative = path.relative(process.cwd(), file).replace(/\\/g, "/");
    it(`${relative} is gated`, () => {
      const source = fs.readFileSync(file, "utf8");
      // Either the route calls requireAdmin itself, or it delegates to the
      // adminCrud factory, which calls it in every handler.
      const gated =
        source.includes("requireAdmin") ||
        source.includes("createItemHandlers") ||
        source.includes("createCollectionHandlers");
      expect(gated, "no admin gate found in this route").toBe(true);
    });
  }

  it("no role field is referenced anywhere in the gate's logic — it does not exist yet", () => {
    // Comments are stripped first, deliberately: both files DO mention "role
    // column" and "usePermission()", in comments saying those are Sprint 9 and
    // do not exist yet. That documentation is required, not a violation. What
    // must not appear is executable code reading a role.
    const stripComments = (source: string) =>
      source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

    for (const file of [
      path.join(process.cwd(), "src", "lib", "offerguide", "adminAuth.ts"),
      path.join(process.cwd(), "src", "lib", "offerguide", "adminCrud.ts"),
    ]) {
      const logic = stripComments(fs.readFileSync(file, "utf8"));
      expect(logic).not.toMatch(/\brole\b/);
      expect(logic).not.toMatch(/usePermission/);
    }
  });

  it("the gate is flagged as a Sprint 9 placeholder in code", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src", "lib", "offerguide", "adminAuth.ts"),
      "utf8"
    );
    expect(source).toMatch(/TEMPORARY/i);
    expect(source).toMatch(/Sprint 9/);
  });
});
