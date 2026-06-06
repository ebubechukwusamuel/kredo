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
} from "lucide-react"

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  PARTIAL: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  CANCELLED: "bg-muted text-muted-foreground",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id
  const name = session?.user?.name || session?.user?.email

  const [clientCount, proposalCount, invoiceCount, projectCount, paidTotal, pendingTotal, recentInvoices] =
    await Promise.all([
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
    ])

  const hasData = clientCount > 0 || proposalCount > 0 || invoiceCount > 0 || projectCount > 0

  const stats = [
    {
      icon: Users,
      label: "Clients",
      value: clientCount,
      href: "/clients",
      color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
    },
    {
      icon: Briefcase,
      label: "Projects",
      value: projectCount,
      href: "/projects",
      color: "text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/30",
    },
    {
      icon: FileText,
      label: "Proposals",
      value: proposalCount,
      href: "/proposals",
      color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
    },
    {
      icon: TrendingUp,
      label: "Revenue",
      value: formatCurrency(paidTotal._sum.total ?? 0),
      href: "/invoices",
      sub: pendingTotal._sum.total ? `${formatCurrency(pendingTotal._sum.total)} pending` : null,
      color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Greeting */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Good to see you, {name?.split(" ")[0] || "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasData
            ? "Here's a snapshot of your business."
            : "Let's get your business set up. Add your first client to get started."}
        </p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-heading text-xl font-semibold">Welcome to Kredo</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Start by adding a client. Then send a proposal, track your time, and invoice
            them when the work is done. Everything connects.
          </p>
          <Link
            href="/clients/new"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Add your first client
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <Link
                  key={s.label}
                  href={s.href}
                  className="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
                  </div>
                  <p className="mt-4 text-2xl font-bold tracking-tight">{s.value}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {s.label}
                    {s.sub && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                        {s.sub}
                      </span>
                    )}
                  </p>
                </Link>
              )
            })}
          </div>

          {/* Recent Invoices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Recent Invoices</h2>
              <Link
                href="/invoices"
                className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-12 text-center">
                <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No invoices yet</p>
                <Link
                  href="/invoices/new"
                  className="mt-3 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Create your first invoice
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                {recentInvoices.map((inv, i) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50 ${
                      i < recentInvoices.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{inv.number}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.client.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold">
                        {formatCurrency(inv.total)}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusStyles[inv.status] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {inv.status === "PARTIAL"
                          ? "Partial"
                          : inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-base font-semibold">Quick Actions</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/clients/new"
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-all hover:border-primary/30 hover:bg-primary/[0.03]"
              >
                <Users className="h-4 w-4 text-primary" />
                New client
              </Link>
              <Link
                href="/proposals/new"
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-all hover:border-primary/30 hover:bg-primary/[0.03]"
              >
                <FileText className="h-4 w-4 text-primary" />
                New proposal
              </Link>
              <Link
                href="/invoices/new"
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-all hover:border-primary/30 hover:bg-primary/[0.03]"
              >
                <DollarSign className="h-4 w-4 text-primary" />
                New invoice
              </Link>
              <Link
                href="/time"
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-all hover:border-primary/30 hover:bg-primary/[0.03]"
              >
                <Clock className="h-4 w-4 text-primary" />
                Track time
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
