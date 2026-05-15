import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { withCors } from "@/lib/cors";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

const cookieName = "team_task_token";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

export function signAuthToken(user: AuthUser) {
  return jwt.sign(user, getJwtSecret(), { expiresIn: "7d" });
}

export function setAuthCookie(token: string) {
  cookies().set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearAuthCookie() {
  cookies().delete(cookieName);
}

export function getUserFromRequest(request: NextRequest): AuthUser | null {
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  const token = bearer || request.cookies.get(cookieName)?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, getJwtSecret()) as AuthUser;
  } catch {
    return null;
  }
}

export function authorize(request: NextRequest, roles: Role[] = []) {
  const user = getUserFromRequest(request);
  if (!user) {
    return {
      user: null,
      response: withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
    };
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return {
      user,
      response: withCors(NextResponse.json({ error: "Forbidden" }, { status: 403 }))
    };
  }

  return { user, response: null };
}
