import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { validationError } from "@/lib/http";
import { corsPreflight, withCors } from "@/lib/cors";
import { requireServerConfig } from "@/lib/env";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: NextRequest) {
  try {
    requireServerConfig();
    const input = signupSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      return withCors(NextResponse.json({ error: "Email is already registered" }, { status: 409 }));
    }

    const user = await prisma.user.create({
      data: { ...input, password: await bcrypt.hash(input.password, 12) },
      select: { id: true, name: true, email: true, role: true }
    });

    const token = signAuthToken(user);
    const response = NextResponse.json({ user, token }, { status: 201 });
    setAuthCookie(response, token);
    return withCors(response);
  } catch (error) {
    return withCors(NextResponse.json(validationError(error), { status: 400 }));
  }
}
