"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, FolderPlus, LogIn, LogOut, Plus, UserPlus } from "lucide-react";

type Role = "ADMIN" | "MEMBER";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type User = { id: string; name: string; email: string; role: Role };
type Project = { id: string; title: string; description?: string | null; _count?: { tasks: number } };
type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate: string;
  project: { id: string; title: string };
  assignee: { id: string; name: string; email: string };
};
type Stats = {
  total: number;
  byStatus: Partial<Record<TaskStatus, number>>;
  overdue: Array<{
    id: string;
    title: string;
    status: TaskStatus;
    dueDate: string;
    project: { title: string };
    assignee: { name: string };
  }>;
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done"
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Request failed");
  return payload as T;
}

export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, byStatus: {}, overdue: [] });
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", role: "MEMBER" as Role });
  const [projectForm, setProjectForm] = useState({ title: "", description: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", dueDate: "", projectId: "", assigneeId: "" });

  async function loadDashboard() {
    setLoading(true);
    try {
      const me = await requestJson<{ user: User }>("/api/auth/me");
      const [taskData, statData, projectData] = await Promise.all([
        requestJson<{ tasks: Task[] }>("/api/tasks"),
        requestJson<Stats>("/api/tasks/stats"),
        requestJson<{ projects: Project[] }>("/api/projects")
      ]);
      setUser(me.user);
      setTasks(taskData.tasks);
      setStats(statData);
      setProjects(projectData.projects);
      setUsers(me.user.role === "ADMIN" ? (await requestJson<{ users: User[] }>("/api/users")).users : []);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const groupedTasks = useMemo(
    () => (["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map((status) => ({ status, tasks: tasks.filter((task) => task.status === status) })),
    [tasks]
  );

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const body = mode === "login" ? { email: authForm.email, password: authForm.password } : authForm;
    try {
      await requestJson(`/api/auth/${mode}`, { method: "POST", body: JSON.stringify(body) });
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    }
  }

  async function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await requestJson("/api/projects", { method: "POST", body: JSON.stringify(projectForm) });
      setProjectForm({ title: "", description: "" });
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Project creation failed");
    }
  }

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await requestJson("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ ...taskForm, dueDate: new Date(taskForm.dueDate).toISOString() })
      });
      setTaskForm({ title: "", description: "", dueDate: "", projectId: "", assigneeId: "" });
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Task creation failed");
    }
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    await requestJson(`/api/tasks?id=${taskId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await loadDashboard();
  }

  async function logout() {
    await requestJson("/api/auth/logout", { method: "POST" });
    setUser(null);
    setTasks([]);
    setProjects([]);
    setStats({ total: 0, byStatus: {}, overdue: [] });
  }

  if (loading) return <main className="min-h-screen bg-mist px-6 py-8 text-ink">Loading dashboard...</main>;

  if (!user) {
    return (
      <main className="min-h-screen bg-mist px-6 py-8">
        <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_420px] md:items-center">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-ink">
              <ClipboardList className="h-6 w-6 text-coral" />
              Team Task Manager
            </div>
            <h1 className="mt-10 text-5xl font-semibold tracking-normal text-ink">RBAC task control for focused teams</h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Admins create projects and assign work. Members get a clean board of their own tasks.
            </p>
          </div>
          <form onSubmit={submitAuth} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex rounded-md border border-slate-200 p-1">
              {(["login", "signup"] as const).map((item) => (
                <button key={item} type="button" onClick={() => setMode(item)} className={`flex-1 rounded px-3 py-2 text-sm font-medium ${mode === item ? "bg-ink text-white" : "text-slate-600"}`}>
                  {item === "login" ? "Login" : "Signup"}
                </button>
              ))}
            </div>
            {mode === "signup" && <input className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Name" value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} />}
            <input className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2" type="email" placeholder="Email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} />
            <input className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2" type="password" placeholder="Password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} />
            {mode === "signup" && (
              <select className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2" value={authForm.role} onChange={(event) => setAuthForm({ ...authForm, role: event.target.value as Role })}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            )}
            {message && <p className="mb-3 text-sm text-coral">{message}</p>}
            <button className="flex w-full items-center justify-center gap-2 rounded-md bg-coral px-4 py-2 font-semibold text-white">
              {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {mode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mist px-6 py-8">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-coral">{user.role}</p>
            <h1 className="text-3xl font-semibold tracking-normal text-ink">Welcome, {user.name}</h1>
          </div>
          <button onClick={logout} className="flex w-fit items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-ink">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </header>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Total tasks" value={stats.total} icon={<ClipboardList className="h-5 w-5" />} />
          <StatCard label="To do" value={stats.byStatus.TODO || 0} />
          <StatCard label="In progress" value={stats.byStatus.IN_PROGRESS || 0} />
          <StatCard label="Done" value={stats.byStatus.DONE || 0} icon={<CheckCircle2 className="h-5 w-5" />} />
        </div>
        {message && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-coral">{message}</p>}
        {user.role === "ADMIN" && (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <form onSubmit={createProject} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink"><FolderPlus className="h-5 w-5 text-coral" />Create project</h2>
              <input className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Project title" value={projectForm.title} onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })} />
              <textarea className="mb-3 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Description" value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} />
              <button className="flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Create</button>
            </form>
            <form onSubmit={createTask} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink"><Plus className="h-5 w-5 text-coral" />Assign task</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Task title" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} />
                <input className="rounded-md border border-slate-300 px-3 py-2" type="datetime-local" value={taskForm.dueDate} onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })} />
                <select className="rounded-md border border-slate-300 px-3 py-2" value={taskForm.projectId} onChange={(event) => setTaskForm({ ...taskForm, projectId: event.target.value })}>
                  <option value="">Project</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
                </select>
                <select className="rounded-md border border-slate-300 px-3 py-2" value={taskForm.assigneeId} onChange={(event) => setTaskForm({ ...taskForm, assigneeId: event.target.value })}>
                  <option value="">Assignee</option>
                  {users.map((member) => <option key={member.id} value={member.id}>{member.name} ({member.role})</option>)}
                </select>
              </div>
              <textarea className="mt-3 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Description" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} />
              <button className="mt-3 flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Assign</button>
            </form>
          </div>
        )}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-ink">Task board</h2>
            <div className="grid gap-4 lg:grid-cols-3">
              {groupedTasks.map((group) => (
                <div key={group.status} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 flex items-center justify-between font-semibold text-ink">
                    {statusLabels[group.status]}
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{group.tasks.length}</span>
                  </h3>
                  <div className="space-y-3">
                    {group.tasks.map((task) => (
                      <article key={task.id} className="rounded-md border border-slate-200 p-3">
                        <h4 className="font-medium text-ink">{task.title}</h4>
                        <p className="mt-2 text-sm text-slate-600">{task.project.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{new Date(task.dueDate).toLocaleString()} · {task.assignee.name}</p>
                        <select className="mt-3 w-full rounded-md border border-slate-300 px-2 py-2 text-sm" value={task.status} onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)}>
                          <option value="TODO">To do</option>
                          <option value="IN_PROGRESS">In progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </article>
                    ))}
                    {group.tasks.length === 0 && <p className="text-sm text-slate-500">No tasks here.</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-ink"><AlertTriangle className="h-5 w-5 text-coral" />Overdue</h2>
            <div className="space-y-3">
              {stats.overdue.map((task) => (
                <div key={task.id} className="rounded-md border border-red-100 bg-red-50 p-3">
                  <p className="font-medium text-ink">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{task.project.title} · {task.assignee.name}</p>
                  <p className="mt-1 text-sm text-coral">{new Date(task.dueDate).toLocaleString()}</p>
                </div>
              ))}
              {stats.overdue.length === 0 && <p className="text-sm text-slate-500">Nothing overdue.</p>}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-slate-500">
        <p className="text-sm font-medium">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}
