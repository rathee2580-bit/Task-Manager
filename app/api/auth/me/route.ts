import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, response } = authorize(request);
  if (response || !user) return response;
  return NextResponse.json({ user });
}
