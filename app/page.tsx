import Link from "next/link";
import { CheckSquare } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-mist px-6 py-8">
      <section className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold text-ink">
            <CheckSquare className="h-6 w-6 text-coral" />
            Team Task Manager
          </div>
          <Link href="/dashboard" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">
            Dashboard
          </Link>
        </nav>
        <div className="py-20">
          <h1 className="max-w-3xl text-5xl font-semibold tracking-normal text-ink">Team Task Manager</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Admins create projects and assign work. Members see their assigned tasks and update progress.
          </p>
          <Link href="/dashboard" className="mt-8 inline-flex rounded-md bg-coral px-5 py-3 text-sm font-semibold text-white">
            Open dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
