import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export const GUEST_COOKIE_NAME = "guestToken";

export type Identity =
  | { type: "user"; userInfoId: number }
  | { type: "guest"; guestToken: string };

type PortalJwtPayload = {
  id: number;
  name?: string;
  email?: string;
};

function verifyBearerToken(req: NextRequest): number | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as PortalJwtPayload;
    return typeof payload.id === "number" ? payload.id : Number(payload.id);
  } catch {
    return null;
  }
}

/**
 * Resolves the caller's identity for guestOrAuth routes: a valid bearer JWT
 * takes precedence over the guestToken cookie, matching the OpenAPI contract.
 */
export function resolveIdentity(req: NextRequest): Identity | null {
  const userInfoId = verifyBearerToken(req);
  if (userInfoId !== null && !Number.isNaN(userInfoId)) {
    return { type: "user", userInfoId };
  }

  const guestToken = req.cookies.get(GUEST_COOKIE_NAME)?.value;
  if (guestToken) {
    return { type: "guest", guestToken };
  }

  return null;
}

/**
 * bearerAuth-only routes: no guest fallback.
 */
export function resolveAuthedUser(req: NextRequest): number | null {
  return verifyBearerToken(req);
}

export function mintGuestToken(): string {
  return crypto.randomUUID();
}

export function setGuestCookie(response: NextResponse, guestToken: string) {
  response.cookies.set(GUEST_COOKIE_NAME, guestToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 days — guests may take a while to register
  });
}
