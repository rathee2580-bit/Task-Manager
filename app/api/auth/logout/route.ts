import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { corsPreflight, withCors } from "@/lib/cors";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST() {
  clearAuthCookie();
  return withCors(NextResponse.json({ ok: true }));
}
