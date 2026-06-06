"use client"

import { useState } from "react"
import { CheckCircle, Building, User, Copy } from "lucide-react"

interface ClientPaymentPageProps {
  invoice: {
    number: string
    amount: number
    total: number
    depositAmount: number
    currency: string
    items: Array<{
      description: string
      quantity: number
      rate: number
      amount: number
    }>
  }
  freelancer: {
    name: string
    brandColor: string
    logoUrl: string | null
    bankName: string | null
    bankAccountName: string | null
    bankAccountNumber: string | null
  }
  invoiceId: string
  clientEmail: string
}

export function ClientPaymentPage({
  invoice,
  freelancer,
  invoiceId,
  clientEmail,
}: ClientPaymentPageProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [copied, setCopied] = useState(false)
  const color = freelancer.brandColor

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency || "USD",
    }).format(amount)
  }

  async function handleConfirmDeposit() {
    const res = await fetch(`/api/invoice/${invoiceId}/confirm-deposit`, {
      method: "POST",
    })
    if (res.ok) setConfirmed(true)
    else alert("Something went wrong. Please try again.")
  }

  function handleCopyAccount() {
    const text = [
      freelancer.bankName && `Bank: ${freelancer.bankName}`,
      freelancer.bankAccountName && `Account Name: ${freelancer.bankAccountName}`,
      freelancer.bankAccountNumber && `Account Number: ${freelancer.bankAccountNumber}`,
    ]
      .filter(Boolean)
      .join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (confirmed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: color + "20" }}
          >
            <CheckCircle className="h-8 w-8" style={{ color }} />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Deposit confirmed!
          </h1>
          <p className="mt-3 text-muted-foreground">
            Your deposit has been confirmed. Your project is now in progress. We'll notify
            you when your project is ready.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center border-b border-border bg-background/80 px-6 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-4xl items-center">
          {freelancer.logoUrl ? (
            <img src={freelancer.logoUrl} alt="" className="h-8" />
          ) : (
            <span
              className="font-heading text-lg font-bold"
              style={{ color }}
            >
              {freelancer.name}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Invoice</p>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {invoice.number}
          </h1>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Qty</th>
                <th className="pb-3 text-right font-medium">Rate</th>
                <th className="pb-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3">{item.quantity}</td>
                  <td className="py-3 text-right">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="py-3 text-right font-medium">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="font-medium">Deposit required (50%)</span>
              <span
                className="text-lg font-bold"
                style={{ color }}
              >
                {formatCurrency(invoice.depositAmount)}
              </span>
            </div>
          </div>
        </div>

        {freelancer.bankName && (
          <div className="mt-8 rounded-xl border-2 border-dashed border-border bg-card/50 p-6">
            <h2 className="font-heading text-base font-semibold">
              Make your deposit
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Transfer your deposit to the account below, then confirm your payment.
            </p>
            <div className="mt-4 space-y-3 rounded-lg bg-muted/50 p-4">
              {freelancer.bankName && (
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{freelancer.bankName}</span>
                </div>
              )}
              {freelancer.bankAccountName && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{freelancer.bankAccountName}</span>
                </div>
              )}
              {freelancer.bankAccountNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono font-medium">
                    {freelancer.bankAccountNumber}
                  </span>
                </div>
              )}
              <button
                onClick={handleCopyAccount}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied!" : "Copy account details"}
              </button>
            </div>

            <button
              onClick={handleConfirmDeposit}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg px-6 text-sm font-medium text-white transition-all"
              style={{ backgroundColor: color }}
            >
              I&apos;ve made the deposit
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        Powered by Kredo
      </footer>
    </div>
  )
}
