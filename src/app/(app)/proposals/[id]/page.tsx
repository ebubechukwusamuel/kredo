import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ProposalActions } from "@/components/forms/proposal-actions"
import { ArrowLeft, Calendar, DollarSign, FileText } from "lucide-react"
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
  DRAFT: "border border-white/10 bg-white/5 text-white/45",
  SENT: "border border-blue-500/20 bg-blue-500/10 text-blue-300",
  VIEWED: "border border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
  ACCEPTED: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  DECLINED: "border border-red-500/20 bg-red-500/10 text-red-300",
  EXPIRED: "border border-white/10 bg-white/5 text-white/45",
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
    <div className="page-shell page-stack max-w-5xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/proposals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">
                {proposal.title}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                  statusStyles[proposal.status]
                }`}
              >
                {statusLabels[proposal.status]}
              </span>
            </div>
            <p className="page-description">
              For{" "}
              <Link
                href={`/clients/${proposal.client.id}`}
                className="font-semibold text-orange-300 underline-offset-4 hover:underline"
              >
                {proposal.client.name}
              </Link>
              {proposal.client.company ? ` — ${proposal.client.company}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="metric-card">
          <p className="flex items-center gap-2 text-xs font-bold text-white/42 uppercase tracking-wider">
            <DollarSign className="h-4 w-4 text-orange-300" />
            Amount
          </p>
          <p className="mt-2 text-2xl font-bold text-white">
            {proposal.amount
              ? `$${proposal.amount.toFixed(2)}`
              : "Not specified"}
          </p>
        </div>
        <div className="metric-card">
          <p className="flex items-center gap-2 text-xs font-bold text-white/42 uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-orange-300" />
            Created
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {proposal.createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {proposal.content && (
        <div className="detail-card p-0">
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
              <FileText className="h-4 w-4 text-orange-300" />
            </div>
            <h2 className="font-heading text-sm font-semibold text-white">Proposal Content</h2>
          </div>
          <div className="p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-white/70">
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
