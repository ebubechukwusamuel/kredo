"use client"

import { Button } from "@/components/ui/button"
import { deleteInvoice, updateInvoiceStatus } from "@/app/actions/invoice"

export function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string
  status: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {status === "DRAFT" && (
        <Button
          onClick={async () => {
            await updateInvoiceStatus(invoiceId, "SENT")
          }}
        >
          Mark as Sent
        </Button>
      )}
      {status === "SENT" && (
        <>
          <Button
            onClick={async () => {
              await updateInvoiceStatus(invoiceId, "PAID")
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Mark as Paid
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await updateInvoiceStatus(invoiceId, "OVERDUE")
            }}
            className="text-red-600"
          >
            Mark Overdue
          </Button>
        </>
      )}
      {status !== "DRAFT" && status !== "SENT" && (
        <Button
          variant="outline"
          onClick={async () => {
            await updateInvoiceStatus(invoiceId, "SENT")
          }}
        >
          Reopen
        </Button>
      )}
      {(status === "DRAFT" || status === "CANCELLED") && (
        <Button
          variant="outline"
          onClick={async () => {
            if (confirm("Delete this invoice?")) {
              await deleteInvoice(invoiceId)
            }
          }}
          className="text-destructive"
        >
          Delete
        </Button>
      )}
    </div>
  )
}
