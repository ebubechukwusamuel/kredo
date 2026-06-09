import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { InvoiceActions } from "@/components/forms/invoice-actions"
import { ConfirmPaymentButton } from "@/components/forms/confirm-payment-button"
import { ArrowLeft, Calendar, DollarSign, Receipt } from "lucide-react"
import { PrintPdfButton } from "@/components/print-pdf-button"
import QRCode from "qrcode"

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  PARTIAL: "Partially Paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
}

const statusStyles: Record<string, string> = {
  DRAFT: "border border-white/10 bg-white/5 text-white/45",
  SENT: "border border-blue-500/20 bg-blue-500/10 text-blue-300",
  VIEWED: "border border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
  PARTIAL: "border border-orange-500/20 bg-orange-500/10 text-orange-300",
  PAID: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  OVERDUE: "border border-red-500/20 bg-red-500/10 text-red-300",
  CANCELLED: "border border-white/10 bg-white/5 text-white/45",
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount)
}

export default async function InvoiceDetailPage(
  props: PageProps<"/invoices/[id]">,
) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      company: true,
      address: true,
      brandName: true,
      brandColor: true,
      logoUrl: true,
      bankName: true,
      bankAccountName: true,
      bankAccountNumber: true,
      slug: true,
    },
  })

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.user.id },
    include: {
      client: { select: { id: true, name: true, email: true, company: true, phone: true, address: true } },
      items: true,
      payments: true,
    },
  })

  if (!invoice) notFound()

  const brandName = user?.brandName || user?.name || "Freelancer"
  const brandColor = user?.brandColor || "#e85d3a"

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://kredo-gray.vercel.app"
  const paymentUrl = `${siteUrl}/${user?.slug || "freelancer"}/invoice/${id}`
  const qrDataUrl = await QRCode.toDataURL(paymentUrl, { width: 160, margin: 0, color: { dark: "#ffffff", light: "#000000" } })

  return (
    <div className="page-shell page-stack max-w-6xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">
                {invoice.number}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                  statusStyles[invoice.status]
                }`}
              >
                {statusLabels[invoice.status]}
              </span>
            </div>
            <p className="page-description">
              For{" "}
              <Link
                href={`/clients/${invoice.client.id}`}
                className="font-semibold text-orange-300 underline-offset-4 hover:underline"
              >
                {invoice.client.name}
              </Link>
              {invoice.client.company ? ` — ${invoice.client.company}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="metric-card">
          <p className="flex items-center gap-2 text-xs font-bold text-white/42 uppercase tracking-wider">
            <DollarSign className="h-4 w-4 text-orange-300" />
            Total
          </p>
          <p className="mt-2 text-2xl font-bold text-white">
            {invoice.currency} {invoice.total.toFixed(2)}
          </p>
        </div>
        <div className="metric-card">
          <p className="flex items-center gap-2 text-xs font-bold text-white/42 uppercase tracking-wider">
            <Receipt className="h-4 w-4 text-orange-300" />
            Subtotal
          </p>
          <p className="mt-2 text-lg font-bold text-white">
            {invoice.currency} {invoice.amount.toFixed(2)}
          </p>
        </div>
        <div className="metric-card">
          <p className="text-xs font-bold text-white/42 uppercase tracking-wider">
            Tax
          </p>
          <p className="mt-2 text-lg font-bold text-white">
            {invoice.currency} {invoice.tax.toFixed(2)}
          </p>
        </div>
        <div className="metric-card">
          <p className="flex items-center gap-2 text-xs font-bold text-white/42 uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-orange-300" />
            Due Date
          </p>
          <p className="mt-2 text-sm font-semibold text-white">
            {invoice.dueDate
              ? invoice.dueDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Not set"}
          </p>
        </div>
      </div>

      <div className="list-shell">
        <div className="border-b border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <p className="text-xs font-bold text-white/42 uppercase tracking-wider">
            Line Items
          </p>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {invoice.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.description}</p>
                <p className="text-xs text-white/42">
                  {item.quantity} &times; {invoice.currency}{" "}
                  {item.rate.toFixed(2)}
                </p>
              </div>
              <p className="text-sm font-bold text-white">
                {invoice.currency} {item.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="ml-auto w-60 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-white/45">Subtotal</span>
              <span>
                {invoice.currency} {invoice.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/45">Tax</span>
              <span>
                {invoice.currency} {invoice.tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-white">
              <span>Total</span>
              <span>
                {invoice.currency} {invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {invoice.payments.length > 0 && (
        <div className="list-shell">
          <div className="border-b border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <p className="text-xs font-bold text-white/42 uppercase tracking-wider">
              Payments
            </p>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {invoice.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm">
                      {payment.date.toLocaleDateString()}
                    </p>
                    {payment.reference && (
                      <p className="text-xs text-white/42">
                        Ref: {payment.reference}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    payment.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {payment.status === "CONFIRMED" ? "Confirmed" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-sm font-medium ${
                    payment.status === "CONFIRMED" ? "text-green-600" : "text-amber-600"
                  }`}>
                    +{invoice.currency} {payment.amount.toFixed(2)}
                  </p>
                  {payment.status === "PENDING" && (
                    <ConfirmPaymentButton paymentId={payment.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {invoice.notes && (
        <div className="detail-card">
          <p className="text-xs font-bold text-white/42 uppercase tracking-wider mb-2">
            Notes
          </p>
          <p className="text-sm leading-6 text-white/65 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      <div className="flex gap-3 no-print">
        <InvoiceActions
          invoiceId={invoice.id}
          status={invoice.status}
        />
        <PrintPdfButton />
      </div>

      {/* Print-only branded invoice */}
      <div className="print-only" style={{ background: "#000", padding: "56px 48px", minHeight: "100vh" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
            <div>
              {user?.logoUrl ? (
                <img src={user.logoUrl} alt="" style={{ height: 56, display: "block" }} />
              ) : (
                <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{brandName}</div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: brandColor, marginBottom: 3 }}>Invoice</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{invoice.number}</div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>{today}</div>
            </div>
          </div>

          {/* Accent bar */}
          <div style={{ height: 3, width: "100%", background: brandColor, marginBottom: 40, borderRadius: 2 }} />

          {/* Addresses */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 44 }}>
            <div style={{ width: "45%" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", marginBottom: 8 }}>From</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{brandName}</div>
              {user?.company && <div style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>{user.company}</div>}
              <div style={{ fontSize: 13, color: "#777", lineHeight: "1.5" }}>{user?.email}</div>
              {user?.phone && <div style={{ fontSize: 13, color: "#777" }}>{user.phone}</div>}
              {user?.address && <div style={{ fontSize: 13, color: "#777", lineHeight: "1.4", marginTop: 2 }}>{user.address}</div>}
            </div>
            <div style={{ width: "45%", textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", marginBottom: 8 }}>Bill To</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{invoice.client.name}</div>
              {invoice.client.company && <div style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>{invoice.client.company}</div>}
              <div style={{ fontSize: 13, color: "#777", lineHeight: "1.5" }}>{invoice.client.email}</div>
              {invoice.client.phone && <div style={{ fontSize: 13, color: "#777" }}>{invoice.client.phone}</div>}
              {invoice.client.address && <div style={{ fontSize: 13, color: "#777", lineHeight: "1.4", marginTop: 2 }}>{invoice.client.address}</div>}
            </div>
          </div>

          {/* Items table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 28 }}>
            <thead>
              <tr>
                <th style={{ padding: "14px 18px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", color: "#555", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Description</th>
                <th style={{ padding: "14px 18px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right", color: "#555", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Qty</th>
                <th style={{ padding: "14px 18px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right", color: "#555", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Rate</th>
                <th style={{ padding: "14px 18px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right", color: "#555", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: "16px 18px", fontSize: 15, borderBottom: "1px solid rgba(255,255,255,0.03)", color: "#ddd" }}>{item.description}</td>
                  <td style={{ padding: "16px 18px", fontSize: 15, borderBottom: "1px solid rgba(255,255,255,0.03)", textAlign: "right", color: "#888" }}>{item.quantity}</td>
                  <td style={{ padding: "16px 18px", fontSize: 15, borderBottom: "1px solid rgba(255,255,255,0.03)", textAlign: "right", color: "#888" }}>{formatCurrency(item.rate, invoice.currency)}</td>
                  <td style={{ padding: "16px 18px", fontSize: 15, borderBottom: "1px solid rgba(255,255,255,0.03)", textAlign: "right", color: "#fff", fontWeight: 500 }}>{formatCurrency(item.amount, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ marginLeft: "auto", width: 270, marginBottom: 44 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 14, color: "#777" }}>
              <span>Subtotal</span><span>{formatCurrency(invoice.amount, invoice.currency)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 14, color: "#777" }}>
              <span>Tax</span><span>{formatCurrency(invoice.tax, invoice.currency)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 6px", borderTop: "1.5px solid " + brandColor, marginTop: 6, fontSize: 22, fontWeight: 700, color: brandColor, letterSpacing: "-0.01em" }}>
              <span>Total</span><span>{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
          </div>

          {/* Bank + QR */}
          <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "22px 26px", marginBottom: 36 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: brandColor, marginBottom: 14 }}>
              {user?.bankName ? "Payment Details" : "Pay Online"}
            </div>
            {user?.bankName && (
              <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginBottom: 16 }}>
                {user.bankName && <div style={{ fontSize: 14, color: "#999" }}>Bank<strong style={{ display: "block", fontSize: 15, color: "#fff", fontWeight: 600, marginTop: 2 }}>{user.bankName}</strong></div>}
                {user.bankAccountName && <div style={{ fontSize: 14, color: "#999" }}>Account Name<strong style={{ display: "block", fontSize: 15, color: "#fff", fontWeight: 600, marginTop: 2 }}>{user.bankAccountName}</strong></div>}
                {user.bankAccountNumber && <div style={{ fontSize: 14, color: "#999" }}>Account Number<strong style={{ display: "block", fontSize: 15, color: "#fff", fontWeight: 600, marginTop: 2 }}>{user.bankAccountNumber}</strong></div>}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: user?.bankName ? "flex-end" : "flex-start", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ textAlign: user?.bankName ? "right" : "left" }}>
                <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Scan to pay</div>
                <img src={qrDataUrl} alt="QR" style={{ width: 100, height: 100, display: "inline-block" }} />
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div style={{ fontSize: 13, color: "#666", marginBottom: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", marginBottom: 8 }}>Notes</div>
              <div>{invoice.notes}</div>
            </div>
          )}

          {/* Terms */}
          {invoice.terms && (
            <div style={{ fontSize: 13, color: "#666", marginBottom: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", marginBottom: 8 }}>Terms &amp; Conditions</div>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{invoice.terms}</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: "center", fontSize: 11, color: "#333", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.03)" }}>
            Powered by Kredo
          </div>
        </div>
      </div>
    </div>
  )
}
