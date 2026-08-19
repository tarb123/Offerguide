// OfferGuide — interim admin access gate
// Sprint 5, Epic 5.2 §4.2.
//
// *** TEMPORARY — PLACEHOLDER FOR SPRINT 9 REAL RBAC ***
// This is a single env-token check, not a role column, not usePermission()
// (neither exists yet — both are Sprint 9 work, explicitly out of scope
// here). It exists only so /admin/config/* isn't publicly reachable while
// Sprint 5 ships the Mongo config CRUD contract. Every /admin/config/* route
// must call requireAdmin() before touching data.

import { NextRequest } from "next/server";
import { unauthorized } from "./errors";

const ADMIN_TOKEN_HEADER = "x-og-admin-token";

/**
 * Returns an error Response if the caller isn't an admin, or null if the
 * request may proceed. Callers: `const denied = requireAdmin(req); if
 * (denied) return denied;`
 */
export function requireAdmin(req: NextRequest) {
  const expectedToken = process.env.OFFERGUIDE_ADMIN_TOKEN;
  // Fails closed: an unset token means no admin token check could ever pass.
  if (!expectedToken) return unauthorized();

  const providedToken = req.headers.get(ADMIN_TOKEN_HEADER);
  if (providedToken !== expectedToken) return unauthorized();

  return null;
}
