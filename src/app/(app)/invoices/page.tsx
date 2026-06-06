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
  PARTIAL: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage invoices for your clients
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-sm text-muted-foreground">No invoices yet</p>
          <Button asChild className="mt-4">
            <Link href="/invoices/new">Create your first invoice</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="flex items-center justify-between border-b px-4 py-3 transition-colors hover:bg-muted/50 last:border-b-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{invoice.number}</p>
                <p className="text-xs text-muted-foreground">
                  {invoice.client.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {invoice.currency} {invoice.total.toFixed(2)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusStyles[invoice.status]
                  }`}
                >
                  {invoice.status === "PARTIAL"
                    ? "Partial"
                    : invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
