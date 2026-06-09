"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { confirmPayment } from "@/app/actions/invoice"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export function ConfirmPaymentButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleConfirm() {
    if (!confirm("Have you verified this payment in your bank account? This will mark the deposit as paid and send a receipt to the client.")) return
    setLoading(true)
    try {
      await confirmPayment(paymentId)
      router.refresh()
    } catch (e) {
      console.error(e)
      alert("Failed to confirm payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleConfirm}
      disabled={loading}
      size="sm"
      className="bg-green-600 hover:bg-green-700 text-xs"
    >
      <CheckCircle className="h-3 w-3" />
      {loading ? "Confirming..." : "Confirm Payment"}
    </Button>
  )
}
