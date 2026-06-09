"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { linkInvoiceToRequest, updateRequestStatus, submitDelivery } from "@/app/actions/requests"
import { createInvoiceFromRequest } from "@/app/actions/invoice"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, Send, Link2 } from "lucide-react"

interface RequestActionsProps {
  request: {
    id: string
    status: string
    clientName: string
    clientEmail: string
    projectName: string
    invoiceId: string | null
    deliveryLink: string | null
  }
}

export function RequestActions({ request }: RequestActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [deliveryUrl, setDeliveryUrl] = useState("")
  const [showDelivery, setShowDelivery] = useState(false)

  async function handleCreateInvoice() {
    setLoading("invoice")
    await createInvoiceFromRequest({
      requestId: request.id,
      clientName: request.clientName,
      clientEmail: request.clientEmail,
    })
  }

  async function handleMarkDepositPaid() {
    setLoading("deposit")
    try {
      await updateRequestStatus(request.id, "DEPOSIT_PAID")
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  async function handleStartProgress() {
    setLoading("progress")
    try {
      await updateRequestStatus(request.id, "IN_PROGRESS")
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  async function handleSubmitDelivery() {
    if (!deliveryUrl) return
    setLoading("delivery")
    try {
      await submitDelivery(request.id, deliveryUrl)
      setShowDelivery(false)
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold">Actions</h2>
      <div className="mt-4 space-y-3">
        {request.status === "PENDING" && (
          <Button onClick={handleCreateInvoice} disabled={loading === "invoice"}>
            <FileText className="h-4 w-4" />
            {loading === "invoice" ? "Creating..." : "Create Invoice"}
          </Button>
        )}

        {request.status === "INVOICE_SENT" && (
          <Button onClick={handleMarkDepositPaid} disabled={loading === "deposit"}>
            <CheckCircle className="h-4 w-4" />
            {loading === "deposit" ? "Updating..." : "Mark Deposit Paid"}
          </Button>
        )}

        {request.status === "DEPOSIT_PAID" && (
          <Button onClick={handleStartProgress} disabled={loading === "progress"}>
            <Send className="h-4 w-4" />
            {loading === "progress" ? "Updating..." : "Start Project"}
          </Button>
        )}

        {(request.status === "IN_PROGRESS" || request.status === "DEPOSIT_PAID") && (
          <div className="space-y-3">
            {!showDelivery ? (
              <Button
                variant="outline"
                onClick={() => setShowDelivery(true)}
              >
                <Link2 className="h-4 w-4" />
                Submit Delivery
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  placeholder="Project URL..."
                  value={deliveryUrl}
                  onChange={(e) => setDeliveryUrl(e.target.value)}
                  className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button
                  onClick={handleSubmitDelivery}
                  disabled={!deliveryUrl || loading === "delivery"}
                >
                  {loading === "delivery" ? "Sending..." : "Submit"}
                </Button>
              </div>
            )}
          </div>
        )}

        {request.status === "DELIVERED" && request.deliveryLink && (
          <div className="text-sm text-muted-foreground">
            Delivered — project link has been sent to the client.
          </div>
        )}
      </div>
    </div>
  )
}
