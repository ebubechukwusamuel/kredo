import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ArrowRight, DollarSign, FileText, Users } from "lucide-react"

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  PARTIAL: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  CANCELLED: "bg-muted text-muted-foreground",
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id

  const [clientCount, proposalCount, invoiceCount, paidTotal, pendingTotal, recentInvoices, acceptedProposals] =
    await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.proposal.count({ where: { userId } }),
      prisma.invoice.count({ where: { userId } }),
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
      prisma.proposal.count({ where: { userId, status: "ACCEPTED" } }),
    ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Clients</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{clientCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Proposals</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{proposalCount}</p>
          {acceptedProposals > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400">
              {acceptedProposals} accepted
            </p>
          )}
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Invoices</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{invoiceCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Revenue</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">
            ${(paidTotal._sum.total ?? 0).toFixed(0)}
          </p>
          {pendingTotal._sum.total && pendingTotal._sum.total > 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              ${pendingTotal._sum.total.toFixed(0)} pending
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent Invoices</h2>
          <Link
            href="/invoices"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
            <p className="text-sm text-muted-foreground">No invoices yet</p>
            <Link
              href="/invoices/new"
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border">
            {recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between border-b px-4 py-3 transition-colors hover:bg-muted/50 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium">{inv.number}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.client.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    ${inv.total.toFixed(2)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
    </div>
  )
}
