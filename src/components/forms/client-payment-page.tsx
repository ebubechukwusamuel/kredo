"use client"

import { useState, useRef } from "react"
import { CheckCircle, Copy, Printer } from "lucide-react"

const DEFAULT_TERMS = `1. Payment: 50% deposit is required to begin work. The remaining 50% is due upon delivery.
2. Timeline: Project delivery timeline begins after deposit confirmation.
3. Revisions: Up to 3 rounds of revisions are included. Additional revisions will be billed separately.
4. Cancellation: If cancelled after work has begun, the deposit is non-refundable.
5. Ownership: Full ownership and rights transfer upon final payment.`

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
    terms: string | null
  }
  client: {
    name: string
    email: string
    company: string
    phone: string
    address: string
  }
  freelancer: {
    name: string
    brandColor: string
    logoUrl: string | null
    bankName: string | null
    bankAccountName: string | null
    bankAccountNumber: string | null
    email: string
    phone: string
    address: string
    company: string
  }
  invoiceId: string
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount)
}

export function ClientPaymentPage({
  invoice,
  freelancer,
  client,
  invoiceId,
}: ClientPaymentPageProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [copied, setCopied] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const color = freelancer.brandColor
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  async function handleConfirmDeposit() {
    const res = await fetch(`/api/invoice/${invoiceId}/confirm-deposit`, {
      method: "POST",
    })
    if (res.ok) setConfirmed(true)
    else alert("Something went wrong. Please try again.")
  }

  function handlePrint() {
    window.print()
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
      <div className="flex min-h-screen items-center justify-center bg-[#09090B] px-4">
        <div className="max-w-md text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: color + "20" }}
          >
            <CheckCircle className="h-8 w-8" style={{ color }} />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
            Deposit confirmed!
          </h1>
          <p className="mt-3 text-white/50">
            Your deposit has been confirmed. Your project is now in progress. We'll notify
            you when your project is ready.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
@media print {
  @page { margin: 0; size: A4; }
  html, body { background: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .print-hide { display: none !important; }
  .print-root {
    background: #000 !important;
    min-height: 100vh !important;
    padding: 0 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-invoice {
    border: 1px solid rgba(255,255,255,0.08) !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-payment-box {
    border: 1px solid rgba(255,255,255,0.12) !important;
  }
}
`}</style>

      <div ref={printRef} className="print-root" style={{ backgroundColor: "#09090B", color: "#FAFAFA", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
          {/* Print Button */}
          <div className="print-hide" style={{ textAlign: "right", marginBottom: "16px" }}>
            <button
              onClick={handlePrint}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#FAFAFA",
                cursor: "pointer",
              }}
            >
              <Printer style={{ width: "14px", height: "14px" }} />
              Print / PDF
            </button>
          </div>

          {/* Invoice Document */}
          <div className="print-invoice" style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden",
          }}>
          {/* Invoice Header */}
          <div style={{
            padding: "32px 32px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}>
            <div>
              {freelancer.logoUrl ? (
                <img src={freelancer.logoUrl} alt="" style={{ height: "40px", marginBottom: "12px", display: "block" }} />
              ) : (
                <div style={{ fontSize: "22px", fontWeight: 800, color, marginBottom: "12px", letterSpacing: "-0.03em" }}>
                  {freelancer.name}
                </div>
              )}
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
                {freelancer.name}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                Invoice
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#FAFAFA", letterSpacing: "-0.02em" }}>
                {invoice.number}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                {today}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width: "45%" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>From</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#FAFAFA", marginBottom: "2px" }}>{freelancer.name}</div>
              {freelancer.company && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>{freelancer.company}</div>}
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: "1.5" }}>{freelancer.email}</div>
              {freelancer.phone && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{freelancer.phone}</div>}
              {freelancer.address && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: "1.4", marginTop: "2px" }}>{freelancer.address}</div>}
            </div>
            <div style={{ width: "45%", textAlign: "right" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>Bill To</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#FAFAFA", marginBottom: "2px" }}>{client.name}</div>
              {client.company && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>{client.company}</div>}
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: "1.5" }}>{client.email}</div>
              {client.phone && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{client.phone}</div>}
              {client.address && <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: "1.4", marginTop: "2px" }}>{client.address}</div>}
            </div>
          </div>

          {/* Invoice Body */}
          <div style={{ padding: "24px 32px" }}>
            {/* Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th style={{ padding: "10px 8px 10px 0", textAlign: "left", color: "rgba(255,255,255,0.35)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Description
                  </th>
                  <th style={{ padding: "10px 8px", textAlign: "right", color: "rgba(255,255,255,0.35)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Qty
                  </th>
                  <th style={{ padding: "10px 8px", textAlign: "right", color: "rgba(255,255,255,0.35)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Rate
                  </th>
                  <th style={{ padding: "10px 0 10px 8px", textAlign: "right", color: "rgba(255,255,255,0.35)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "14px 8px 14px 0", color: "#FAFAFA", fontWeight: 500 }}>
                      {item.description}
                    </td>
                    <td style={{ padding: "14px 8px", textAlign: "right", color: "rgba(255,255,255,0.6)" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: "14px 8px", textAlign: "right", color: "rgba(255,255,255,0.6)" }}>
                      {formatCurrency(item.rate, invoice.currency)}
                    </td>
                    <td style={{ padding: "14px 0 14px 8px", textAlign: "right", color: "#FAFAFA", fontWeight: 600 }}>
                      {formatCurrency(item.amount, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "48px" }}>
                <div style={{ minWidth: "200px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Total</span>
                    <span style={{ fontSize: "14px", color: "#FAFAFA", fontWeight: 600 }}>
                      {formatCurrency(invoice.total, invoice.currency)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", marginTop: "4px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color }}>Deposit (50%)</span>
                    <span style={{ fontSize: "20px", fontWeight: 800, color }}>
                      {formatCurrency(invoice.depositAmount, invoice.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {freelancer.bankName && (
            <div style={{
              margin: "0 32px 32px",
              borderRadius: "12px",
              border: "1px dashed rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.02)",
              padding: "24px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#FAFAFA", marginBottom: "4px" }}>
                Make your deposit
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>
                Transfer the deposit amount to the account below
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={{
                  flex: 1,
                  minWidth: "140px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                    Bank
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#FAFAFA" }}>
                    {freelancer.bankName}
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  minWidth: "140px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                    Account Name
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#FAFAFA" }}>
                    {freelancer.bankAccountName}
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  minWidth: "140px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                    Account Number
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#FAFAFA", fontFamily: "monospace" }}>
                    {freelancer.bankAccountNumber}
                  </div>
                </div>
              </div>
              <div className="print-hide" style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                <button
                  onClick={handleCopyAccount}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    color: "#FAFAFA",
                    cursor: "pointer",
                  }}
                >
                  <Copy style={{ width: "12px", height: "12px" }} />
                  {copied ? "Copied!" : "Copy details"}
                </button>
                <button
                  onClick={handleConfirmDeposit}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px 24px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 700,
                    border: "none",
                    backgroundColor: color,
                    color: "#FAFAFA",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  I&apos;ve made the deposit
                </button>
              </div>
            </div>
          )}
        </div>

          {/* Terms & Conditions */}
          {(invoice.terms || DEFAULT_TERMS) && (
            <div style={{
              margin: "0 32px 32px",
              padding: "20px 24px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: "10px" }}>
                Terms &amp; Conditions
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {invoice.terms || DEFAULT_TERMS}
              </div>
            </div>
          )}

        {/* Footer */}
        <div style={{
          marginTop: "24px",
          textAlign: "center",
          fontSize: "12px",
          color: "rgba(255,255,255,0.2)",
          padding: "16px 0",
        }}>
          Powered by Kredo
        </div>
      </div>
    </div>
    </>
  )
}
