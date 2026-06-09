import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  ArrowRight,
  DollarSign,
  FileText,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  Wallet,
  Play,
  CheckCircle,
} from "lucide-react"

const statusStyles: Record<string, string> = {
  DRAFT: "bg-white/5 text-gray-400 border border-white/10",
  SENT: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  PAID: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  OVERDUE: "bg-red-500/10 text-red-400 border border-red-500/20",
  PARTIAL: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  CANCELLED: "bg-white/5 text-gray-400 border border-white/10",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id
  const name = session?.user?.name || session?.user?.email

  const [
    clientCount,
    proposalCount,
    invoiceCount,
    projectCount,
    paidTotal,
    pendingTotal,
    recentInvoices,
    timeSum,
    expenseSum,
    activeTimer,
  ] = await Promise.all([
    prisma.client.count({ where: { userId } }),
    prisma.proposal.count({ where: { userId } }),
    prisma.invoice.count({ where: { userId } }),
    prisma.project.count({ where: { userId } }),
    prisma.invoice.aggregate({
      where: { userId, status: "PAID" },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { userId, status: { in: ["SENT", "OVERDUE", "PARTIAL"] } },
      _sum: { total: true },
    }),
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    prisma.timeEntry.aggregate({
      where: { userId, billable: true },
      _sum: { duration: true },
    }),
    prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.timeEntry.findFirst({
      where: { userId, endedAt: null },
      include: { project: { select: { name: true } } },
    }),
  ])

  const hasData = clientCount > 0 || proposalCount > 0 || invoiceCount > 0 || projectCount > 0
  const totalLoggedTime = timeSum._sum.duration ?? 0
  const totalExpenses = expenseSum._sum.amount ?? 0

  const stats = [
    {
      icon: Users,
      label: "Clients",
      value: clientCount,
      href: "/clients",
      glowColor: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
      iconColor: "text-blue-400",
    },
    {
      icon: Briefcase,
      label: "Projects",
      value: projectCount,
      href: "/projects",
      glowColor: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]",
      iconColor: "text-violet-400",
    },
    {
      icon: FileText,
      label: "Proposals",
      value: proposalCount,
      href: "/proposals",
      glowColor: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
      iconColor: "text-amber-400",
    },
    {
      icon: TrendingUp,
      label: "Revenue",
      value: formatCurrency(paidTotal._sum.total ?? 0),
      href: "/invoices",
      sub: pendingTotal._sum.total ? `${formatCurrency(pendingTotal._sum.total)} pending` : null,
      glowColor: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]",
      iconColor: "text-red-400",
    },
  ]

  return (
    <div className="relative mx-auto max-w-5xl space-y-8 pb-12">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[100px]" />
      </div>

      {/* Greeting */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#09090B]/60 backdrop-blur-xl p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-red-500/15 to-orange-500/5 blur-3xl rounded-full" />
        <h1 className="relative z-10 font-heading text-3xl font-bold tracking-tight text-[#FAFAFA]">
          Good to see you, {name?.split(" ")[0] || "there"}
        </h1>
        <p className="relative z-10 mt-2 text-sm text-[#A1A1AA]">
          {hasData
            ? "Here's a snapshot of your business status."
            : "Let's get your business set up. Add your first client to get started."}
        </p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-[#09090B]/40 backdrop-blur-md px-6 py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Users className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-[#FAFAFA]">Welcome to Kredo</h2>
          <p className="mt-2 max-w-md text-sm text-[#A1A1AA]">
            Start by adding a client. Then send a proposal, track your time, and invoice
            them when the work is done. Everything connects.
          </p>
          <Link
            href="/clients/new"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-b from-white to-white/80 px-6 text-sm font-medium text-black transition-all hover:bg-white shadow-lg"
          >
            Add your first client
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <Link
                  key={s.label}
                  href={s.href}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[#09090B]/60 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 ${s.glowColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                      <Icon className={`h-6 w-6 ${s.iconColor}`} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/30 transition-all duration-300 group-hover:text-white/80 group-hover:translate-x-1" />
                  </div>
                  <div className="mt-6">
                    <p className="text-3xl font-bold tracking-tight text-[#FAFAFA]">{s.value}</p>
                    <p className="mt-1 text-sm font-medium text-[#A1A1AA]">
                      {s.label}
                      {s.sub && (
                        <span className="ml-2 inline-block rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-400 border border-orange-500/20">
                          {s.sub}
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Recent Invoices */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold text-[#FAFAFA]">Recent Invoices</h2>
                <Link
                  href="/invoices"
                  className="group flex items-center gap-1 text-sm font-medium text-red-400 transition-colors hover:text-red-300"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {recentInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#09090B]/60 backdrop-blur-md px-6 py-16 text-center">
                  <FileText className="mb-4 h-10 w-10 text-white/20" />
                  <p className="text-sm text-[#A1A1AA]">No invoices yet</p>
                  <Link
                    href="/invoices/new"
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white border border-white/10 transition-all hover:bg-white/10"
                  >
                    Create your first invoice
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#09090B]/60 backdrop-blur-md">
                  {recentInvoices.map((inv, i) => (
                    <Link
                      key={inv.id}
                      href={`/invoices/${inv.id}`}
                      className={`flex items-center justify-between px-6 py-5 transition-colors hover:bg-white/5 ${
                        i < recentInvoices.length - 1 ? "border-b border-white/10" : ""
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                          <DollarSign className="h-5 w-5 text-white/50" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#FAFAFA]">{inv.number}</p>
                          <p className="text-xs text-[#A1A1AA] mt-0.5">
                            {inv.client.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <span className="text-sm font-semibold text-[#FAFAFA]">
                          {formatCurrency(inv.total)}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-wider ${
                            statusStyles[inv.status] || "bg-white/5 text-gray-400 border border-white/10"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions & Work logs */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="rounded-2xl border border-white/10 bg-[#09090B]/60 backdrop-blur-md p-6">
                <h2 className="font-heading text-lg font-semibold text-[#FAFAFA]">Quick Actions</h2>
                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    href="/clients/new"
                    className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <Users className="h-4 w-4" />
                    </div>
                    New client
                  </Link>
                  <Link
                    href="/proposals/new"
                    className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    New proposal
                  </Link>
                  <Link
                    href="/invoices/new"
                    className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    New invoice
                  </Link>
                  <Link
                    href="/time"
                    className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                      <Clock className="h-4 w-4" />
                    </div>
                    Track time
                  </Link>
                </div>
              </div>

              {/* Time & Expense Tracker Widget */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#09090B]/60 backdrop-blur-md p-6">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-500/10 blur-2xl rounded-full" />
                
                {/* Active Timer Display */}
                {activeTimer ? (
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                        Timer Running
                      </span>
                      <Link href="/time" className="text-xs text-[#A1A1AA] hover:text-white underline">
                        Manage
                      </Link>
                    </div>
                    <div className="flex justify-between items-start bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">
                          {activeTimer.project?.name || "General Work"}
                        </p>
                        <p className="text-xs text-[#A1A1AA] line-clamp-1">
                          {activeTimer.description || "Active session"}
                        </p>
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/25">
                        <Play className="h-3.5 w-3.5 fill-red-400" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-neutral-600" />
                        No Active Timer
                      </span>
                      <Link href="/time" className="text-xs text-red-400 hover:text-red-300 font-medium">
                        Start
                      </Link>
                    </div>
                  </div>
                )}

                {/* Work Logged and Expenses summaries */}
                <h3 className="font-heading text-sm font-semibold text-[#FAFAFA] flex items-center gap-2 mb-4">
                  <Wallet className="h-4 w-4 text-orange-400" />
                  Business Metrics
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#A1A1AA]">Billable Hours Logged</span>
                    <span className="text-[#FAFAFA] font-mono font-semibold">
                      {formatDuration(totalLoggedTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#A1A1AA]">Total Expenses</span>
                    <span className="text-[#FAFAFA] font-mono font-semibold">
                      {formatCurrency(totalExpenses)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
