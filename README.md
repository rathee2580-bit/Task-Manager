# Team Task Manager

RBAC-focused task manager built with Next.js App Router, Prisma, PostgreSQL, Tailwind CSS, and Lucide React.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` and `JWT_SECRET`.
3. Run `npm install`.
4. Run `npx prisma migrate dev`.
5. Run `npm run dev`.

## Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/projects`
- `POST /api/projects` admin only
- `GET /api/tasks`
- `POST /api/tasks` admin only
- `PATCH /api/tasks?id=<taskId>`
- `GET /api/tasks/stats`
