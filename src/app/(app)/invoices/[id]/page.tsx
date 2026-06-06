import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { InvoiceActions } from "@/components/forms/invoice-actions"
import { ArrowLeft } from "lucide-react"
import { PrintPdfButton } from "@/components/print-pdf-button"

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
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  VIEWED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  PARTIAL: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED: "bg-muted text-muted-foreground",
}

export default async function InvoiceDetailPage(
  props: PageProps<"/invoices/[id]">,
) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.user.id },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      items: true,
      payments: true,
    },
  })

  if (!invoice) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {invoice.number}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  statusStyles[invoice.status]
                }`}
              >
                {statusLabels[invoice.status]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              For{" "}
              <Link
                href={`/clients/${invoice.client.id}`}
                className="underline underline-offset-2 hover:text-foreground"
              >
                {invoice.client.name}
              </Link>
              {invoice.client.company ? ` — ${invoice.client.company}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {invoice.currency} {invoice.total.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Subtotal
          </p>
          <p className="mt-1 text-lg font-medium">
            {invoice.currency} {invoice.amount.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tax
          </p>
          <p className="mt-1 text-lg font-medium">
            {invoice.currency} {invoice.tax.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Due Date
          </p>
          <p className="mt-1 text-sm">
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

      <div className="rounded-lg border">
        <div className="border-b bg-muted/50 px-4 py-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Line Items
          </p>
        </div>
        <div className="divide-y">
          {invoice.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex-1">
                <p className="text-sm">{item.description}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} &times; {invoice.currency}{" "}
                  {item.rate.toFixed(2)}
                </p>
              </div>
              <p className="text-sm font-medium">
                {invoice.currency} {item.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t px-4 py-3">
          <div className="ml-auto w-60 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>
                {invoice.currency} {invoice.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>
                {invoice.currency} {invoice.tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-1 font-medium">
              <span>Total</span>
              <span>
                {invoice.currency} {invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {invoice.payments.length > 0 && (
        <div className="rounded-lg border">
          <div className="border-b bg-muted/50 px-4 py-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Payments
            </p>
          </div>
          <div className="divide-y">
            {invoice.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm">
                    {payment.date.toLocaleDateString()}
                  </p>
                  {payment.reference && (
                    <p className="text-xs text-muted-foreground">
                      Ref: {payment.reference}
                    </p>
                  )}
                </div>
                <p className="text-sm font-medium text-green-600">
                  +{invoice.currency} {payment.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {invoice.notes && (
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Notes
          </p>
          <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      <div className="flex gap-3 no-print">
        <InvoiceActions
          invoiceId={invoice.id}
          status={invoice.status}
        />
        <PrintPdfButton />
      </div>
    </div>
  )
}
