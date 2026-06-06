import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ProposalActions } from "@/components/forms/proposal-actions"
import { ArrowLeft } from "lucide-react"
import { PrintPdfButton } from "@/components/print-pdf-button"

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  VIEWED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ACCEPTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  DECLINED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  EXPIRED: "bg-muted text-muted-foreground",
}

export default async function ProposalDetailPage(
  props: PageProps<"/proposals/[id]">,
) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: session.user.id },
    include: { client: { select: { id: true, name: true, email: true, company: true } } },
  })

  if (!proposal) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/proposals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {proposal.title}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  statusStyles[proposal.status]
                }`}
              >
                {statusLabels[proposal.status]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              For{" "}
              <Link
                href={`/clients/${proposal.client.id}`}
                className="underline underline-offset-2 hover:text-foreground"
              >
                {proposal.client.name}
              </Link>
              {proposal.client.company ? ` — ${proposal.client.company}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Amount
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {proposal.amount
              ? `$${proposal.amount.toFixed(2)}`
              : "Not specified"}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Created
          </p>
          <p className="mt-1 text-sm">
            {proposal.createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {proposal.content && (
        <div className="rounded-lg border p-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {proposal.content}
            </pre>
          </div>
        </div>
      )}

      <div className="flex gap-3 no-print">
        <ProposalActions
          proposalId={proposal.id}
          status={proposal.status}
          clientEmail={proposal.client.email}
        />
        <PrintPdfButton />
      </div>
    </div>
  )
}
