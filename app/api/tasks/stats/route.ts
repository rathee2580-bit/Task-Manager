import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { corsPreflight, withCors } from "@/lib/cors";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: NextRequest) {
  const { user, response } = authorize(request);
  if (response || !user) return response;

  const where = user.role === "ADMIN" ? { project: { ownerId: user.id } } : { assigneeId: user.id };
  const [total, byStatus, overdue] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.groupBy({ by: ["status"], where, _count: { id: true } }),
    prisma.task.findMany({
      where: { ...where, dueDate: { lt: new Date() }, status: { not: "DONE" } },
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        project: { select: { title: true } },
        assignee: { select: { name: true } }
      },
      orderBy: { dueDate: "asc" }
    })
  ]);

  return withCors(NextResponse.json({
    total,
    byStatus: byStatus.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {}),
    overdue
  }));
}
