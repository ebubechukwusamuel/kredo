import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Plus, FileText, ArrowRight } from "lucide-react"

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  VIEWED: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  ACCEPTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  DECLINED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  EXPIRED: "bg-muted text-muted-foreground",
}

export default async function ProposalsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const proposals = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Proposals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and send professional proposals to your clients.
          </p>
        </div>
        <Link
          href="/proposals/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New proposal
        </Link>
      </div>

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-heading text-xl font-semibold">No proposals yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Proposals help you win projects. Create one for a client, set your rate, and
            send it. You'll know the moment they view it.
          </p>
          <Link
            href="/proposals/new"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Create your first proposal
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {proposals.map((p, i) => (
            <Link
              key={p.id}
              href={`/proposals/${p.id}`}
              className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50 ${
                i < proposals.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.client.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {p.amount && (
                  <span className="text-sm font-semibold">
                    ${p.amount.toFixed(0)}
                  </span>
                )}
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusStyles[p.status] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
