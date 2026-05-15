import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { validationError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const authUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    setAuthCookie(signAuthToken(authUser));
    return NextResponse.json({ user: authUser });
  } catch (error) {
    return NextResponse.json(validationError(error), { status: 400 });
  }
}
