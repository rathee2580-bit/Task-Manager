# Team Task Manager

RBAC-focused task manager built with Next.js App Router, Prisma, PostgreSQL, Tailwind CSS, and Lucide React.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` and `JWT_SECRET`.
3. Run `npm install`.
4. Run `npx prisma migrate dev`.
5. Run `npm run seed`.
6. Run `npm run dev`.

## Demo Login

After running `npm run seed`, use:

```bash
Admin email: admin@example.com
Admin password: password123
```

```bash
Member email: member@example.com
Member password: password123
```

The admin can create projects and assign tasks. The member can see assigned tasks and update task status.

## Render Deployment

This repo includes `render.yaml` for a Render Blueprint deployment.

1. Push the repo to GitHub.
2. In Render, create a new Blueprint from this repo.
3. Render will create the web service and PostgreSQL database.
4. After the first deploy, open the Render service shell and run:

```bash
npx prisma db push
```

The app uses these Render commands:

```bash
npm run render:build
npm run render:start
```

Set this Render environment variable after your Vercel frontend is deployed:

```bash
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Vercel Frontend Deployment

This repo includes `vercel.json` for Vercel.

1. Import the GitHub repo into Vercel.
2. Add this environment variable in Vercel:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-render-service.onrender.com
```

3. Deploy the project.

In Vercel Project Settings, keep these build settings:

```bash
Framework Preset: Next.js
Build Command: npm run vercel:build
Output Directory: .next
Install Command: npm install
```

Do not put a Vercel deployment URL in **Output Directory**. That field must be a folder path, not a website URL.

Vercel uses:

```bash
npm run vercel:build
```

For local full-stack development, leave `NEXT_PUBLIC_API_BASE_URL` empty so the frontend calls the local Next.js API routes.

## Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/projects`
- `POST /api/projects` admin only
- `GET /api/tasks`
- `POST /api/tasks` admin only
- `PATCH /api/tasks?id=<taskId>`
- `GET /api/tasks/stats`
