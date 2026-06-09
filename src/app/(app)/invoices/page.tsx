import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Plus, Receipt, ArrowRight, DollarSign, TrendingUp, Clock } from "lucide-react"

const statusConfig: Record<string, { label: string; dot: string; className: string }> = {
  DRAFT:     { label: "Draft",     dot: "bg-white/30",       className: "bg-white/5 text-white/40 border border-white/10" },
  SENT:      { label: "Sent",      dot: "bg-blue-400",       className: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  VIEWED:    { label: "Viewed",    dot: "bg-violet-400",     className: "bg-violet-500/10 text-violet-400 border border-violet-500/20" },
  PARTIAL:   { label: "Partial",   dot: "bg-orange-400",     className: "bg-orange-500/10 text-orange-400 border border-orange-500/20" },
  PAID:      { label: "Paid",      dot: "bg-emerald-400",    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  OVERDUE:   { label: "Overdue",   dot: "bg-red-500 animate-pulse", className: "bg-red-500/10 text-red-400 border border-red-500/20" },
  CANCELLED: { label: "Cancelled", dot: "bg-white/20",       className: "bg-white/5 text-white/30 border border-white/10" },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default async function InvoicesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [invoices, paidTotal, pendingTotal] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true } } },
    }),
    prisma.invoice.aggregate({
      where: { userId: session.user.id, status: "PAID" },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { userId: session.user.id, status: { in: ["SENT", "OVERDUE", "PARTIAL"] } },
      _sum: { total: true },
    }),
  ])

  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length

  return (
    <div className="relative mx-auto max-w-5xl space-y-8 pb-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[5%] right-[10%] h-[350px] w-[350px] rounded-full bg-emerald-600/6 blur-[100px]" />
        <div className="absolute top-[40%] -left-[5%] h-[250px] w-[250px] rounded-full bg-red-600/5 blur-[80px]" />
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Receipt className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/25">Billing</span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white">Invoices</h1>
          <p className="mt-1 text-sm text-white/45">Bill your clients and track payments.</p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-b from-red-500 to-red-600 px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.45)] hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
      </div>

      {/* Revenue Metrics */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-400/70 uppercase tracking-wider">Collected</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(paidTotal._sum.total ?? 0)}</p>
          </div>
          <div className="rounded-2xl border border-orange-500/15 bg-orange-500/5 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <p className="text-xs font-semibold text-orange-400/70 uppercase tracking-wider">Pending</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">{formatCurrency(pendingTotal._sum.total ?? 0)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-4 w-4 text-white/40" />
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Total</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {invoices.length}
              {overdueCount > 0 && (
                <span className="ml-2 text-sm font-normal text-red-400">{overdueCount} overdue</span>
              )}
            </p>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-24 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <Receipt className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-white">No invoices yet</h2>
          <p className="mt-2 max-w-sm text-sm text-white/45">
            Invoices are how you get paid. Create one with line items, add tax, and send it to your
            client. Track when it's viewed and when payment arrives.
          </p>
          <Link
            href="/invoices/new"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-red-500 to-red-600 px-6 text-sm font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.45)]"
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/[0.06] px-6 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Invoice</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Amount</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Status</span>
          </div>
          {invoices.map((inv, i) => {
            const s = statusConfig[inv.status] || statusConfig.DRAFT
            return (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className={`group grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.04] ${
                  i < invoices.length - 1 ? "border-b border-white/[0.06]" : ""
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <DollarSign className="h-4 w-4 text-white/40" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{inv.number}</p>
                    <p className="text-xs text-white/40 truncate">{inv.client.name}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-white tabular-nums">{formatCurrency(inv.total)}</span>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${s.className}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-white/15 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white/50" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
