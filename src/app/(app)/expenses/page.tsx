import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Plus, Wallet, TrendingDown, ShieldCheck, Tag } from "lucide-react"

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  SOFTWARE:  { label: "Software",   color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  EQUIPMENT: { label: "Equipment",  color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20" },
  TRAVEL:    { label: "Travel",     color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  FOOD:      { label: "Food",       color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20" },
  OFFICE:    { label: "Office",     color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  SERVICES:  { label: "Services",   color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20" },
  EDUCATION: { label: "Education",  color: "text-cyan-400",    bg: "bg-cyan-500/10 border-cyan-500/20" },
  OTHER:     { label: "Other",      color: "text-white/40",    bg: "bg-white/5 border-white/10" },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)
}

export default async function ExpensesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [expenses, totals, deductibleTotal] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    }),
    prisma.expense.aggregate({
      where: { userId: session.user.id },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { userId: session.user.id, taxDeductible: true },
      _sum: { amount: true },
    }),
  ])

  const totalAmount = totals._sum.amount ?? 0
  const deductibleAmount = deductibleTotal._sum.amount ?? 0

  return (
    <div className="relative mx-auto max-w-5xl space-y-8 pb-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[5%] right-[5%] h-[300px] w-[300px] rounded-full bg-orange-600/7 blur-[100px]" />
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Wallet className="h-3.5 w-3.5 text-orange-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/25">Finance</span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white">Expenses</h1>
          <p className="mt-1 text-sm text-white/45">Track business expenses and stay organized for tax season.</p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-b from-red-500 to-red-600 px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.45)] hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New Expense
        </Link>
      </div>

      {/* Metrics */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-orange-500/15 bg-orange-500/5 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-orange-400" />
              <p className="text-xs font-semibold text-orange-400/70 uppercase tracking-wider">Total Spent</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-400/70 uppercase tracking-wider">Tax Deductible</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(deductibleAmount)}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-white/40" />
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Entries</p>
            </div>
            <p className="text-2xl font-bold text-white">{expenses.length}</p>
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-24 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
            <Wallet className="h-8 w-8 text-orange-400" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-white">No expenses yet</h2>
          <p className="mt-2 max-w-sm text-sm text-white/45">
            Track your business expenses so you never miss a write-off. Categorize them and
            mark which ones are tax deductible.
          </p>
          <Link
            href="/expenses/new"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-red-500 to-red-600 px-6 text-sm font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.45)]"
          >
            Add your first expense
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm">
          <div className="grid grid-cols-[1fr_auto] border-b border-white/[0.06] px-6 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Description</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Amount</span>
          </div>

          {expenses.map((e, i) => {
            const cat = categoryConfig[e.category] || categoryConfig.OTHER
            return (
              <div
                key={e.id}
                className={`group flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.03] ${
                  i < expenses.length - 1 ? "border-b border-white/[0.06]" : ""
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${cat.bg}`}>
                    <Wallet className={`h-4 w-4 ${cat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{e.description}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${cat.bg} ${cat.color}`}>
                        {cat.label}
                      </span>
                      {e.taxDeductible && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                          <ShieldCheck className="h-3 w-3" />
                          Deductible
                        </span>
                      )}
                      <span className="text-xs text-white/25">{formatDate(e.date)}</span>
                    </div>
                  </div>
                </div>
                <span className="ml-4 text-sm font-bold text-white tabular-nums shrink-0">
                  {formatCurrency(e.amount)}
                </span>
              </div>
            )
          })}

          {/* Total footer */}
          <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-6 py-4">
            <span className="text-sm font-semibold text-white/50">Total</span>
            <span className="text-base font-bold text-orange-400">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
