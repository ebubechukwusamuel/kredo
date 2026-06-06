import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Inbox, ArrowRight } from "lucide-react"

const statusLabels: Record<string, string> = {
  PENDING: "New",
  REVIEWED: "Reviewed",
  INVOICE_SENT: "Invoice Sent",
  DEPOSIT_PAID: "Deposit Paid",
  IN_PROGRESS: "In Progress",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  REVIEWED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  INVOICE_SENT: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  DEPOSIT_PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  IN_PROGRESS: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  DELIVERED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  COMPLETED: "bg-muted text-muted-foreground",
}

export default async function RequestsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const requests = await prisma.projectRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const pendingCount = requests.filter((r) => r.status === "PENDING").length

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Project requests from your clients.
          {pendingCount > 0 && (
            <span className="ml-2 text-amber-600 dark:text-amber-400">
              {pendingCount} new
            </span>
          )}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Inbox className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-heading text-xl font-semibold">No requests yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Share your public link with potential clients. When they fill out the project
            form, their request will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {requests.map((r, i) => (
            <Link
              key={r.id}
              href={`/requests/${r.id}`}
              className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50 ${
                i < requests.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Inbox className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{r.projectName}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.clientName} &middot; {r.clientEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusStyles[r.status] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {statusLabels[r.status] || r.status}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
