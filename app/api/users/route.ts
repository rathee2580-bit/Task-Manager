import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { response } = authorize(request, [Role.ADMIN]);
  if (response) return response;

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: [{ role: "asc" }, { name: "asc" }]
  });

  return NextResponse.json({ users });
}
