import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { validationError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { taskSchema, taskStatusSchema } from "@/lib/validation";
import { corsPreflight, withCors } from "@/lib/cors";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: NextRequest) {
  const { user, response } = authorize(request);
  if (response || !user) return response;

  const tasks = await prisma.task.findMany({
    where: user.role === "ADMIN" ? { project: { ownerId: user.id } } : { assigneeId: user.id },
    include: {
      project: { select: { id: true, title: true } },
      assignee: { select: { id: true, name: true, email: true } }
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }]
  });

  return withCors(NextResponse.json({ tasks }));
}

export async function POST(request: NextRequest) {
  const { user, response } = authorize(request, [Role.ADMIN]);
  if (response || !user) return response;

  try {
    const input = taskSchema.parse(await request.json());
    const project = await prisma.project.findFirst({ where: { id: input.projectId, ownerId: user.id } });
    if (!project) return withCors(NextResponse.json({ error: "Project not found" }, { status: 404 }));

    const assignee = await prisma.user.findUnique({ where: { id: input.assigneeId }, select: { id: true } });
    if (!assignee) return withCors(NextResponse.json({ error: "Assignee not found" }, { status: 404 }));

    const task = await prisma.task.create({
      data: { ...input, dueDate: new Date(input.dueDate) }
    });

    return withCors(NextResponse.json({ task }, { status: 201 }));
  } catch (error) {
    return withCors(NextResponse.json(validationError(error), { status: 400 }));
  }
}

export async function PATCH(request: NextRequest) {
  const { user, response } = authorize(request);
  if (response || !user) return response;

  const taskId = request.nextUrl.searchParams.get("id");
  if (!taskId) return withCors(NextResponse.json({ error: "Task id is required" }, { status: 400 }));

  try {
    const input = taskStatusSchema.parse(await request.json());
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { ownerId: true } } }
    });
    if (!task) return withCors(NextResponse.json({ error: "Task not found" }, { status: 404 }));

    const canUpdate = user.role === "ADMIN" ? task.project.ownerId === user.id : task.assigneeId === user.id;
    if (!canUpdate) return withCors(NextResponse.json({ error: "Forbidden" }, { status: 403 }));

    const updated = await prisma.task.update({ where: { id: taskId }, data: { status: input.status } });
    return withCors(NextResponse.json({ task: updated }));
  } catch (error) {
    return withCors(NextResponse.json(validationError(error), { status: 400 }));
  }
}
