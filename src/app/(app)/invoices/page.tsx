import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Plus, Receipt, ArrowRight } from "lucide-react"

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  VIEWED: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  PARTIAL: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED: "bg-muted text-muted-foreground",
}

export default async function InvoicesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bill your clients and track payments.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Receipt className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-heading text-xl font-semibold">No invoices yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Invoices are how you get paid. Create one with line items, add tax, and send it
            to your client. Track when it's viewed and when payment arrives.
          </p>
          <Link
            href="/invoices/new"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {invoices.map((inv, i) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50 ${
                i < invoices.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{inv.number}</p>
                  <p className="text-xs text-muted-foreground">{inv.client.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">
                  ${inv.total.toFixed(2)}
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
  )
}
