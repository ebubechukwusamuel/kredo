import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  VIEWED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ACCEPTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
          <p className="text-sm text-muted-foreground">
            Create and send proposals to your clients
          </p>
        </div>
        <Button asChild>
          <Link href="/proposals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Link>
        </Button>
      </div>

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-sm text-muted-foreground">No proposals yet</p>
          <Button asChild className="mt-4">
            <Link href="/proposals/new">Create your first proposal</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          {proposals.map((proposal) => (
            <Link
              key={proposal.id}
              href={`/proposals/${proposal.id}`}
              className="flex items-center justify-between border-b px-4 py-3 transition-colors hover:bg-muted/50 last:border-b-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{proposal.title}</p>
                <p className="text-xs text-muted-foreground">
                  {proposal.client.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {proposal.amount && (
                  <span className="text-sm font-medium">
                    ${proposal.amount.toFixed(2)}
                  </span>
                )}
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusStyles[proposal.status]
                  }`}
                >
                  {proposal.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
