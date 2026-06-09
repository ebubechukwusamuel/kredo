import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { RequestActions } from "@/components/forms/request-actions"
import { ArrowLeft, Mail, Phone, Building2, User, FileText, Link2, Clock, Inbox } from "lucide-react"
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
  PENDING: "border border-amber-500/20 bg-amber-500/10 text-amber-300",
  REVIEWED: "border border-blue-500/20 bg-blue-500/10 text-blue-300",
  INVOICE_SENT: "border border-violet-500/20 bg-violet-500/10 text-violet-300",
  DEPOSIT_PAID: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  IN_PROGRESS: "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  DELIVERED: "border border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
  COMPLETED: "border border-white/10 bg-white/5 text-white/45",
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
    <div className="page-shell page-stack max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/requests"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="page-kicker">
            <Inbox className="h-3.5 w-3.5 text-orange-300" />
            Request Detail
          </div>
          <h1 className="page-title mt-3">
            {req.projectName}
          </h1>
          <p className="page-description">
            Request from {req.clientName}
          </p>
        </div>
      </div>

      {/* Status */}
      <div
        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-bold ${
          statusStyles[req.status] || "border border-white/10 bg-white/5 text-white/45"
        }`}
      >
        {statusLabels[req.status] || req.status}
      </div>

      {/* Client Info */}
      <div className="detail-card">
        <h2 className="font-heading text-base font-semibold text-white">Client Details</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-white/72">
            <User className="h-4 w-4 text-white/42" />
            <span>{req.clientName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-white/42" />
            <a
              href={`mailto:${req.clientEmail}`}
              className="text-orange-300 hover:underline"
            >
              {req.clientEmail}
            </a>
          </div>
          {req.clientPhone && (
            <div className="flex items-center gap-3 text-sm text-white/72">
              <Phone className="h-4 w-4 text-white/42" />
              <a href={`tel:${req.clientPhone}`} className="hover:underline">
                {req.clientPhone}
              </a>
            </div>
          )}
          {req.company && (
            <div className="flex items-center gap-3 text-sm text-white/72">
              <Building2 className="h-4 w-4 text-white/42" />
              <span>{req.company}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {req.description && (
        <div className="detail-card">
          <h2 className="font-heading text-base font-semibold text-white">Project Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/62">
            {req.description}
          </p>
        </div>
      )}

      {/* Features / Requirements */}
      {req.features && (
        <div className="detail-card">
          <h2 className="font-heading text-base font-semibold text-white">Features & Requirements</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/62">
            {req.features}
          </p>
        </div>
      )}

      {/* Reference URLs */}
      {req.referenceUrls && (
        <div className="detail-card">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-white/42" />
            <h2 className="font-heading text-base font-semibold text-white">References & Examples</h2>
          </div>
          <div className="mt-3 space-y-1">
            {req.referenceUrls.split("\n").filter(Boolean).map((url, i) => (
              <a
                key={i}
                href={url.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-orange-300 hover:underline"
              >
                {url.trim()}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {req.timeline && (
        <div className="detail-card">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/42" />
            <h2 className="font-heading text-base font-semibold text-white">Desired Timeline</h2>
          </div>
          <p className="mt-2 text-sm text-white/62">{req.timeline}</p>
        </div>
      )}

      {/* Invoice */}
      {req.invoice && (
        <div className="detail-card">
          <h2 className="font-heading text-base font-semibold text-white">Invoice</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/45">Invoice #</span>
              <Link
                href={`/invoices/${req.invoice.id}`}
                className="font-medium text-orange-300 hover:underline"
              >
                {req.invoice.number}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/45">Total</span>
              <span className="font-medium">${req.invoice.total.toFixed(2)}</span>
            </div>
            {req.invoice.depositAmount && (
              <div className="flex items-center justify-between">
                <span className="text-white/45">Deposit (50%)</span>
                <span className="font-medium">
                  ${req.invoice.depositAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-white/45">Deposit paid</span>
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
        <div className="detail-card">
          <h2 className="font-heading text-base font-semibold text-white">Delivery</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-white/42" />
              <a
                href={req.deliveryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-300 hover:underline"
              >
                {req.deliveryLink}
              </a>
            </div>
            {req.deliveredAt && (
              <p className="text-xs text-white/45">
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
          invoiceId: req.invoiceId,
          deliveryLink: req.deliveryLink,
        }}
      />
    </div>
  )
}
