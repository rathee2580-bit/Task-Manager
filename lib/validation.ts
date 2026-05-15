import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(128),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER")
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional()
});

export const taskSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  dueDate: z.string().datetime(),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid()
});

export const taskStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"])
});
