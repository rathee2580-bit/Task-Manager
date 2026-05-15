import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { validationError } from "@/lib/http";
import { corsPreflight, withCors } from "@/lib/cors";
import { requireServerConfig } from "@/lib/env";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: NextRequest) {
  try {
    requireServerConfig();
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      return withCors(NextResponse.json({ error: "Invalid email or password" }, { status: 401 }));
    }

    const authUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = signAuthToken(authUser);
    const response = NextResponse.json({ user: authUser, token });
    setAuthCookie(response, token);
    return withCors(response);
  } catch (error) {
    return withCors(NextResponse.json(validationError(error), { status: 400 }));
  }
}
