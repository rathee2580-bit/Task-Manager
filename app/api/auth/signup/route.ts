import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import { validationError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const input = signupSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return NextResponse.json({ error: "Email is already registered" }, { status: 409 });

    const user = await prisma.user.create({
      data: { ...input, password: await bcrypt.hash(input.password, 12) },
      select: { id: true, name: true, email: true, role: true }
    });

    setAuthCookie(signAuthToken(user));
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(validationError(error), { status: 400 });
  }
}
