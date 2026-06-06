import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ProjectDetailActions } from "@/components/forms/project-detail-actions"
import { ArrowLeft, Edit3 } from "lucide-react"

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  ON_HOLD: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-muted text-muted-foreground",
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {project.name}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  statusStyles[project.status]
                }`}
              >
                {statusLabels[project.status]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Client:{" "}
              <Link
                href={`/clients/${project.client.id}`}
                className="underline underline-offset-2 hover:text-foreground"
              >
                {project.client.name}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Budget
          </p>
          <p className="mt-1 text-xl font-semibold">
            {project.budget
              ? `$${project.budget.toFixed(2)}`
              : "Not set"}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Rate
          </p>
          <p className="mt-1 text-xl font-semibold">
            {project.rate ? `$${project.rate.toFixed(2)}/hr` : "Not set"}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Time Tracked
          </p>
          <p className="mt-1 text-xl font-semibold">{totalHours}h</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {project.deadline ? "Deadline" : "Started"}
          </p>
          <p className="mt-1 text-sm">
            {(project.deadline ?? project.startDate)?.toLocaleDateString(
              "en-US",
              { year: "numeric", month: "long", day: "numeric" },
            ) ?? "Not set"}
          </p>
        </div>
      </div>

      {project.description && (
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Description
          </p>
          <p className="text-sm whitespace-pre-wrap">{project.description}</p>
        </div>
      )}

      {project.notes && (
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Notes
          </p>
          <p className="text-sm whitespace-pre-wrap">{project.notes}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Recent Proposals</h3>
          {project.proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposals</p>
          ) : (
            <div className="rounded-lg border divide-y">
              {project.proposals.map((p) => (
                <Link
                  key={p.id}
                  href={`/proposals/${p.id}`}
                  className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <span>{p.title}</span>
                  <span className="text-muted-foreground">{p.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Recent Invoices</h3>
          {project.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices</p>
          ) : (
            <div className="rounded-lg border divide-y">
              {project.invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50"
                >
                  <span>{inv.number}</span>
                  <span className="text-muted-foreground">
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
