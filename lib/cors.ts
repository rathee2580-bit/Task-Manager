import { NextResponse } from "next/server";

const allowedOrigin = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "*";

export const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export function withCors(response: NextResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function corsPreflight() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}
