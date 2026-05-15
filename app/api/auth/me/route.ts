import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { corsPreflight, withCors } from "@/lib/cors";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: NextRequest) {
  const { user, response } = authorize(request);
  if (response || !user) return response;
  return withCors(NextResponse.json({ user }));
}
