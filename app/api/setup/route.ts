import { NextResponse } from "next/server";
import { getSetupStatus } from "@/lib/env";
import { corsPreflight, withCors } from "@/lib/cors";

export function OPTIONS() {
  return corsPreflight();
}

export function GET() {
  const status = getSetupStatus();

  return withCors(
    NextResponse.json({
      ok: status.databaseUrl && status.jwtSecret,
      missing: Object.entries(status)
        .filter(([, configured]) => !configured)
        .map(([key]) => key),
      required: {
        DATABASE_URL: status.databaseUrl,
        JWT_SECRET: status.jwtSecret
      }
    })
  );
}
