import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { RequestActions } from "@/components/forms/request-actions"
import { ArrowLeft, Mail, User, DollarSign, FileText } from "lucide-react"
import Link from "next/link"

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

export default async function RequestDetailPage(
  props: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await props.params

  const req = await prisma.projectRequest.findFirst({
    where: { id, userId: session.user.id },
    include: { invoice: true },
  })

  if (!req) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/requests"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {req.projectName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Request from {req.clientName}
          </p>
        </div>
      </div>

      {/* Status */}
      <div
        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
          statusStyles[req.status] || "bg-muted text-muted-foreground"
        }`}
      >
        {statusLabels[req.status] || req.status}
      </div>

      {/* Client Info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading text-base font-semibold">Client Details</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{req.clientName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a
              href={`mailto:${req.clientEmail}`}
              className="text-primary hover:underline"
            >
              {req.clientEmail}
            </a>
          </div>
          {req.budget && (
            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Budget: ${req.budget.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {req.description && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold">Project Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {req.description}
          </p>
        </div>
      )}

      {/* Invoice */}
      {req.invoice && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold">Invoice</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Invoice #</span>
              <Link
                href={`/invoices/${req.invoice.id}`}
                className="font-medium text-primary hover:underline"
              >
                {req.invoice.number}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">${req.invoice.total.toFixed(2)}</span>
            </div>
            {req.invoice.depositAmount && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deposit (50%)</span>
                <span className="font-medium">
                  ${req.invoice.depositAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Deposit paid</span>
              <span
                className={
                  req.depositPaid
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }
              >
                {req.depositPaid ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Delivery */}
      {req.deliveryLink && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold">Delivery</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <a
                href={req.deliveryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {req.deliveryLink}
              </a>
            </div>
            {req.deliveredAt && (
              <p className="text-xs text-muted-foreground">
                Delivered on {req.deliveredAt.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      <RequestActions
        request={{
          id: req.id,
          status: req.status,
          clientName: req.clientName,
          clientEmail: req.clientEmail,
          projectName: req.projectName,
          description: req.description,
          budget: req.budget,
          invoiceId: req.invoiceId,
          deliveryLink: req.deliveryLink,
        }}
      />
    </div>
  )
}
