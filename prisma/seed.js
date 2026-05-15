const bcrypt = require("bcryptjs");
require("dotenv").config({ quiet: true });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTaskIfMissing(data) {
  const existing = await prisma.task.findFirst({
    where: {
      title: data.title,
      projectId: data.projectId
    }
  });

  if (existing) return existing;
  return prisma.task.create({ data });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Create a .env file before running npm run seed.");
    process.exit(1);
  }

  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Admin",
      password,
      role: "ADMIN"
    },
    create: {
      name: "Admin",
      email: "admin@example.com",
      password,
      role: "ADMIN"
    }
  });

  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {
      name: "Member",
      password,
      role: "MEMBER"
    },
    create: {
      name: "Member",
      email: "member@example.com",
      password,
      role: "MEMBER"
    }
  });

  let project = await prisma.project.findFirst({
    where: {
      title: "Website Launch",
      ownerId: admin.id
    }
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        title: "Website Launch",
        description: "Demo project for the Team Task Manager dashboard.",
        ownerId: admin.id
      }
    });
  }

  await createTaskIfMissing({
    title: "Prepare homepage copy",
    description: "Write clear copy for the first release.",
    status: "TODO",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    projectId: project.id,
    assigneeId: member.id
  });

  await createTaskIfMissing({
    title: "Review task board flow",
    description: "Check status updates and overdue task behavior.",
    status: "IN_PROGRESS",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    projectId: project.id,
    assigneeId: member.id
  });

  await createTaskIfMissing({
    title: "Fix overdue sample task",
    description: "This task is intentionally overdue for dashboard testing.",
    status: "TODO",
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    projectId: project.id,
    assigneeId: member.id
  });

  console.log("Seed complete.");
  console.log("Admin: admin@example.com / password123");
  console.log("Member: member@example.com / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
