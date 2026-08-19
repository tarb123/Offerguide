import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { requireAdmin } from "./adminAuth";

const ORIGINAL_TOKEN = process.env.OFFERGUIDE_ADMIN_TOKEN;

function requestWithToken(token: string | null) {
  const headers = new Headers();
  if (token !== null) headers.set("x-og-admin-token", token);
  return new NextRequest("http://localhost/api/offerguide/admin/config/questions", { headers });
}

describe("requireAdmin", () => {
  afterEach(() => {
    process.env.OFFERGUIDE_ADMIN_TOKEN = ORIGINAL_TOKEN;
  });

  it("rejects a request with no token", () => {
    process.env.OFFERGUIDE_ADMIN_TOKEN = "correct-token";
    const denied = requireAdmin(requestWithToken(null));
    expect(denied).not.toBeNull();
    expect(denied!.status).toBe(401);
  });

  it("rejects a request with the wrong token", () => {
    process.env.OFFERGUIDE_ADMIN_TOKEN = "correct-token";
    const denied = requireAdmin(requestWithToken("wrong-token"));
    expect(denied).not.toBeNull();
    expect(denied!.status).toBe(401);
  });

  it("allows a request with the correct token", () => {
    process.env.OFFERGUIDE_ADMIN_TOKEN = "correct-token";
    const denied = requireAdmin(requestWithToken("correct-token"));
    expect(denied).toBeNull();
  });

  it("fails closed when OFFERGUIDE_ADMIN_TOKEN isn't configured at all", () => {
    delete process.env.OFFERGUIDE_ADMIN_TOKEN;
    const denied = requireAdmin(requestWithToken("anything"));
    expect(denied).not.toBeNull();
    expect(denied!.status).toBe(401);
  });
});
