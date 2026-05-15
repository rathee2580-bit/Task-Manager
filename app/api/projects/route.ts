import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validationError } from "@/lib/http";
import { projectSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { user, response } = authorize(request);
  if (response || !user) return response;

  const projects = await prisma.project.findMany({
    where: user.role === "ADMIN" ? { ownerId: user.id } : { tasks: { some: { assigneeId: user.id } } },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const { user, response } = authorize(request, [Role.ADMIN]);
  if (response || !user) return response;

  try {
    const input = projectSchema.parse(await request.json());
    const project = await prisma.project.create({ data: { ...input, ownerId: user.id } });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json(validationError(error), { status: 400 });
  }
}
