import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Plus, Briefcase, ArrowRight } from "lucide-react"

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  ON_HOLD: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-muted text-muted-foreground",
}

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true } },
      _count: { select: { proposals: true, invoices: true, timeEntries: true } },
    },
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize your work. Link everything to a project.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-heading text-xl font-semibold">No projects yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Projects bring everything together. Link clients, proposals, invoices, and time
            entries to a single project so you always have the full picture.
          </p>
          <Link
            href="/projects/new"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusStyles[p.status] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {p.status === "ON_HOLD"
                    ? "On Hold"
                    : p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                </span>
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold group-hover:text-primary">
                {p.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.client.name}</p>
              {p.budget && (
                <p className="mt-2 text-sm font-medium">
                  ${p.budget.toLocaleString()}
                </p>
              )}
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span>{p._count.proposals} proposals</span>
                <span>{p._count.invoices} invoices</span>
                <span>{p._count.timeEntries} entries</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
