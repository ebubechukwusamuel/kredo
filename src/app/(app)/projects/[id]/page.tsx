import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ProjectDetailActions } from "@/components/forms/project-detail-actions"
import { ArrowLeft, Briefcase, Calendar, Clock, DollarSign } from "lucide-react"

const statusStyles: Record<string, string> = {
  ACTIVE: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  ON_HOLD: "border border-amber-500/20 bg-amber-500/10 text-amber-300",
  COMPLETED: "border border-blue-500/20 bg-blue-500/10 text-blue-300",
  CANCELLED: "border border-white/10 bg-white/5 text-white/45",
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[id]">,
) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      proposals: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, amount: true },
      },
      invoices: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, number: true, status: true, total: true },
      },
    },
  })

  if (!project) notFound()

  const timeSum = await prisma.timeEntry.aggregate({
    where: { projectId: id, userId: session.user.id, endedAt: { not: null } },
    _sum: { duration: true },
  })

  const totalHours = Math.round((timeSum._sum.duration ?? 0) / 3600)

  return (
    <div className="page-shell page-stack max-w-6xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">
                {project.name}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                  statusStyles[project.status]
                }`}
              >
                {statusLabels[project.status]}
              </span>
            </div>
            <p className="page-description">
              Client:{" "}
              <Link
                href={`/clients/${project.client.id}`}
                className="font-semibold text-orange-300 underline-offset-4 hover:underline"
              >
                {project.client.name}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="metric-card">
          <p className="flex items-center gap-2 text-xs font-bold text-white/42 uppercase tracking-wider">
            <DollarSign className="h-4 w-4 text-orange-300" />
            Budget
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {project.budget
              ? `$${project.budget.toFixed(2)}`
              : "Not set"}
          </p>
        </div>
        <div className="metric-card">
          <p className="flex items-center gap-2 text-xs font-bold text-white/42 uppercase tracking-wider">
            <DollarSign className="h-4 w-4 text-orange-300" />
            Rate
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {project.rate ? `$${project.rate.toFixed(2)}/hr` : "Not set"}
          </p>
        </div>
        <div className="metric-card">
          <p className="flex items-center gap-2 text-xs font-bold text-white/42 uppercase tracking-wider">
            <Clock className="h-4 w-4 text-orange-300" />
            Time Tracked
          </p>
          <p className="mt-2 text-xl font-bold text-white">{totalHours}h</p>
        </div>
        <div className="metric-card">
          <p className="flex items-center gap-2 text-xs font-bold text-white/42 uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-orange-300" />
            {project.deadline ? "Deadline" : "Started"}
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {(project.deadline ?? project.startDate)?.toLocaleDateString(
              "en-US",
              { year: "numeric", month: "long", day: "numeric" },
            ) ?? "Not set"}
          </p>
        </div>
      </div>

      {project.description && (
        <div className="detail-card">
          <p className="text-xs font-bold text-white/42 uppercase tracking-wider mb-2">
            Description
          </p>
          <p className="text-sm leading-6 text-white/70 whitespace-pre-wrap">{project.description}</p>
        </div>
      )}

      {project.notes && (
        <div className="detail-card">
          <p className="text-xs font-bold text-white/42 uppercase tracking-wider mb-2">
            Notes
          </p>
          <p className="text-sm leading-6 text-white/70 whitespace-pre-wrap">{project.notes}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Briefcase className="h-4 w-4 text-orange-300" />
            Recent Proposals
          </h3>
          {project.proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposals</p>
          ) : (
            <div className="list-shell divide-y divide-white/[0.06]">
              {project.proposals.map((p) => (
                <Link
                  key={p.id}
                  href={`/proposals/${p.id}`}
                  className="flex items-center justify-between px-4 py-3 text-sm text-white/75 hover:bg-white/[0.05]"
                >
                  <span>{p.title}</span>
                  <span className="text-white/42">{p.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <DollarSign className="h-4 w-4 text-orange-300" />
            Recent Invoices
          </h3>
          {project.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices</p>
          ) : (
            <div className="list-shell divide-y divide-white/[0.06]">
              {project.invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between px-4 py-3 text-sm text-white/75 hover:bg-white/[0.05]"
                >
                  <span>{inv.number}</span>
                  <span className="text-white/42">
                    ${inv.total.toFixed(0)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProjectDetailActions
        projectId={project.id}
        status={project.status}
        clients={[{ id: project.client.id, name: project.client.name, company: project.client.company }]}
        defaults={{
          name: project.name,
          description: project.description,
          budget: project.budget,
          rate: project.rate,
          startDate: project.startDate,
          deadline: project.deadline,
          notes: project.notes,
        }}
      />
    </div>
  )
}
