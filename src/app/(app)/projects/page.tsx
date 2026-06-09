import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Plus, Briefcase, ArrowRight, Calendar } from "lucide-react"

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  ON_HOLD: {
    label: "On Hold",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-white/5 text-white/30 border border-white/10",
  },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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

  const activeCount = projects.filter((p) => p.status === "ACTIVE").length
  const completedCount = projects.filter((p) => p.status === "COMPLETED").length

  return (
    <div className="page-shell page-stack max-w-6xl">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-[20%] h-[300px] w-[300px] rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Briefcase className="h-3.5 w-3.5 text-violet-400" />
            </div>
            Workspace
          </div>
          <h1 className="page-title mt-3">Projects</h1>
          <p className="page-description">Organize your work. Link everything to a project.</p>
        </div>
        <Link
          href="/projects/new"
          className="primary-action"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Stats strip */}
      {projects.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Projects", value: projects.length, color: "text-white" },
            { label: "Active", value: activeCount, color: "text-emerald-400" },
            { label: "Completed", value: completedCount, color: "text-blue-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="metric-card"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-24 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <Briefcase className="h-8 w-8 text-violet-400" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-white">No projects yet</h2>
          <p className="mt-2 max-w-sm text-sm text-white/45">
            Projects bring everything together. Link clients, proposals, invoices, and time entries
            to a single project so you always have the full picture.
          </p>
          <Link
            href="/projects/new"
            className="primary-action mt-8"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {projects.map((p) => {
            const s = statusConfig[p.status] || statusConfig.CANCELLED
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="app-panel group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.055]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/4 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <Briefcase className="h-5 w-5 text-violet-400" />
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${s.className}`}>
                    {s.label}
                  </span>
                </div>

                <div className="relative mt-4">
                  <h3 className="font-heading text-base font-semibold text-white transition-colors group-hover:text-violet-300">
                    {p.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-white/40">{p.client.name}</p>
                  {p.budget && (
                    <p className="mt-2 text-lg font-bold text-white/80">
                      {formatCurrency(p.budget)}
                    </p>
                  )}
                </div>

                <div className="relative mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <div className="flex gap-4 text-xs text-white/30">
                    <span><span className="font-semibold text-white/55">{p._count.proposals}</span> proposals</span>
                    <span><span className="font-semibold text-white/55">{p._count.invoices}</span> invoices</span>
                    <span><span className="font-semibold text-white/55">{p._count.timeEntries}</span> entries</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-white/60" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
