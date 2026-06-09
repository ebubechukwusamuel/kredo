import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Plus, FileText, ArrowRight, Eye, CheckCircle, XCircle } from "lucide-react"

const statusConfig: Record<string, { label: string; dot: string; className: string }> = {
  DRAFT:    { label: "Draft",    dot: "bg-white/30",       className: "bg-white/5 text-white/40 border border-white/10" },
  SENT:     { label: "Sent",     dot: "bg-blue-400",       className: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  VIEWED:   { label: "Viewed",   dot: "bg-violet-400",     className: "bg-violet-500/10 text-violet-400 border border-violet-500/20" },
  ACCEPTED: { label: "Accepted", dot: "bg-emerald-400",    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  DECLINED: { label: "Declined", dot: "bg-red-400",        className: "bg-red-500/10 text-red-400 border border-red-500/20" },
  EXPIRED:  { label: "Expired",  dot: "bg-white/20",       className: "bg-white/5 text-white/30 border border-white/8" },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function ProposalsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const proposals = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  })

  const acceptedCount = proposals.filter((p) => p.status === "ACCEPTED").length
  const sentCount = proposals.filter((p) => p.status === "SENT" || p.status === "VIEWED").length
  const totalValue = proposals
    .filter((p) => p.status === "ACCEPTED")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)

  return (
    <div className="page-shell page-stack max-w-6xl">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[5%] right-[15%] h-[300px] w-[300px] rounded-full bg-amber-600/7 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] h-[200px] w-[200px] rounded-full bg-emerald-600/5 blur-[80px]" />
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <FileText className="h-3.5 w-3.5 text-amber-400" />
            </div>
            Sales
          </div>
          <h1 className="page-title mt-3">Proposals</h1>
          <p className="page-description">Create and send professional proposals to your clients.</p>
        </div>
        <Link
          href="/proposals/new"
          className="primary-action"
        >
          <Plus className="h-4 w-4" />
          New Proposal
        </Link>
      </div>

      {/* Metrics */}
      {proposals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-400/70 uppercase tracking-wider">Won Value</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalValue)}</p>
          </div>
          <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-400" />
              <p className="text-xs font-semibold text-blue-400/70 uppercase tracking-wider">Out for Review</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{sentCount}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-white/40" />
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Win Rate</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {proposals.length > 0
                ? `${Math.round((acceptedCount / proposals.length) * 100)}%`
                : "—"}
            </p>
          </div>
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-24 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <FileText className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-white">No proposals yet</h2>
          <p className="mt-2 max-w-sm text-sm text-white/45">
            Proposals help you win projects. Create one for a client, set your rate, and send it.
            You&apos;ll know the moment they view it.
          </p>
          <Link
            href="/proposals/new"
            className="primary-action mt-8"
          >
            Create your first proposal
          </Link>
        </div>
      ) : (
        <div className="list-shell">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/[0.06] px-6 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Proposal</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Value</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Status</span>
          </div>

          {proposals.map((p, i) => {
            const s = statusConfig[p.status] || statusConfig.DRAFT
            return (
              <Link
                key={p.id}
                href={`/proposals/${p.id}`}
                className={`group grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.04] ${
                  i < proposals.length - 1 ? "border-b border-white/[0.06]" : ""
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <FileText className="h-4 w-4 text-amber-400/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.title}</p>
                    <p className="text-xs text-white/40 truncate">{p.client.name}</p>
                  </div>
                </div>

                <span className="text-sm font-bold text-white tabular-nums">
                  {p.amount ? formatCurrency(p.amount) : "—"}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${s.className}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-white/15 transition-all group-hover:translate-x-0.5 group-hover:text-white/50" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
