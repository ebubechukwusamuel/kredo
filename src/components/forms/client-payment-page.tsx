"use client"

import { useState, useRef } from "react"
import { Clock, Copy, Printer } from "lucide-react"

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
            <Clock className="h-8 w-8" style={{ color }} />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
            Payment notification sent
          </h1>
          <p className="mt-3 text-white/50">
            We&apos;ve notified the freelancer about your deposit. They&apos;ll verify
            and confirm it once it reflects in their bank account. You&apos;ll receive
            a receipt email when confirmed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .kp-wrap {
          background: #09090B;
          color: #FAFAFA;
          min-height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .kp-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 24px;
        }
        .kp-print-btn-wrap {
          text-align: right;
          margin-bottom: 16px;
        }
        .kp-print-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #FAFAFA;
          cursor: pointer;
        }
        .kp-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
        }
        .kp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 32px 32px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .kp-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .kp-header-name {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 4px;
          letter-spacing: -0.03em;
        }
        .kp-header-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
        }
        .kp-header-right {
          text-align: right;
          flex-shrink: 0;
        }
        .kp-header-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
          margin-bottom: 4px;
        }
        .kp-header-number {
          font-size: 22px;
          font-weight: 700;
          color: #FAFAFA;
          letter-spacing: -0.02em;
        }
        .kp-header-date {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-top: 4px;
        }
        .kp-addresses {
          display: flex;
          justify-content: space-between;
          padding: 24px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 24px;
        }
        .kp-address-block {
          width: 45%;
        }
        .kp-address-block:last-child {
          text-align: right;
        }
        .kp-address-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.3);
          margin-bottom: 8px;
        }
        .kp-address-name {
          font-size: 16px;
          font-weight: 600;
          color: #FAFAFA;
          margin-bottom: 2px;
        }
        .kp-address-line {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
        }
        .kp-body {
          padding: 24px 32px;
        }
        .kp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .kp-table th {
          padding: 10px 8px 10px 0;
          text-align: left;
          color: rgba(255,255,255,0.35);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .kp-table th:nth-child(n+2) {
          text-align: right;
          padding: 10px 8px;
        }
        .kp-table th:last-child {
          padding: 10px 0 10px 8px;
        }
        .kp-table td {
          padding: 14px 8px 14px 0;
          color: #FAFAFA;
          font-weight: 500;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .kp-table td:nth-child(n+2) {
          text-align: right;
          color: rgba(255,255,255,0.6);
          font-weight: 400;
          padding: 14px 8px;
        }
        .kp-table td:last-child {
          text-align: right;
          color: #FAFAFA;
          font-weight: 600;
          padding: 14px 0 14px 8px;
        }
        .kp-totals-wrap {
          margin-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 16px;
          display: flex;
          justify-content: flex-end;
        }
        .kp-totals {
          min-width: 200px;
        }
        .kp-totals-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
        }
        .kp-totals-label {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
        }
        .kp-totals-value {
          font-size: 14px;
          color: #FAFAFA;
          font-weight: 600;
        }
        .kp-totals-deposit {
          display: flex;
          justify-content: space-between;
          padding: 8px 0 0;
          margin-top: 4px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .kp-deposit-label {
          font-size: 14px;
          font-weight: 700;
        }
        .kp-deposit-value {
          font-size: 20px;
          font-weight: 800;
        }
        .kp-bank-section {
          margin: 0 32px 32px;
          border-radius: 12px;
          border: 1px dashed rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.02);
          padding: 24px;
        }
        .kp-bank-title {
          font-size: 13px;
          font-weight: 700;
          color: #FAFAFA;
          margin-bottom: 4px;
        }
        .kp-bank-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 16px;
        }
        .kp-bank-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .kp-bank-card {
          flex: 1;
          min-width: 140px;
          padding: 12px 14px;
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .kp-bank-card-label {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .kp-bank-card-value {
          font-size: 13px;
          font-weight: 600;
          color: #FAFAFA;
        }
        .kp-bank-card-value.mono {
          font-family: monospace;
        }
        .kp-bank-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        .kp-btn-copy {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: #FAFAFA;
          cursor: pointer;
          flex: 1;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .kp-btn-pay {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          border: none;
          color: #FAFAFA;
          cursor: pointer;
          flex: 1;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .kp-terms {
          margin: 0 32px 32px;
          padding: 20px 24px;
          border-radius: 12px;
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .kp-terms-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.3);
          margin-bottom: 10px;
        }
        .kp-terms-text {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .kp-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          padding: 16px 0;
        }

        @media (max-width: 640px) {
          .kp-container {
            padding: 12px 8px !important;
          }
          .kp-header {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 20px 16px 16px !important;
          }
          .kp-header-right {
            text-align: left !important;
            width: 100% !important;
          }
          .kp-addresses {
            flex-direction: column !important;
            padding: 20px 16px !important;
          }
          .kp-address-block {
            width: 100% !important;
          }
          .kp-address-block:last-child {
            text-align: left !important;
          }
          .kp-body {
            padding: 16px !important;
          }
          .kp-table {
            font-size: 12px !important;
          }
          .kp-table th,
          .kp-table td {
            padding: 8px 4px !important;
          }
          .kp-table th:last-child,
          .kp-table td:last-child {
            padding: 8px 0 8px 4px !important;
          }
          .kp-totals-wrap {
            justify-content: stretch !important;
          }
          .kp-totals {
            min-width: unset !important;
            width: 100% !important;
          }
          .kp-deposit-value {
            font-size: 18px !important;
          }
          .kp-bank-section {
            margin: 0 12px 20px !important;
            padding: 16px !important;
          }
          .kp-bank-grid {
            flex-direction: column !important;
          }
          .kp-bank-card {
            min-width: unset !important;
            width: 100% !important;
          }
          .kp-bank-actions {
            flex-direction: column !important;
          }
          .kp-btn-copy,
          .kp-btn-pay {
            padding: 14px !important;
            font-size: 15px !important;
          }
          .kp-terms {
            margin: 0 12px 20px !important;
            padding: 16px !important;
          }
        }

        @media (max-width: 380px) {
          .kp-container {
            padding: 8px 4px !important;
          }
          .kp-header {
            padding: 16px 12px 12px !important;
          }
          .kp-body {
            padding: 12px !important;
          }
          .kp-table {
            font-size: 11px !important;
          }
          .kp-table th,
          .kp-table td {
            padding: 6px 3px !important;
          }
          .kp-header-number {
            font-size: 18px !important;
          }
        }

        @media print {
          @page { margin: 0; size: A4; }
          html, body { background: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-hide { display: none !important; }
          .kp-wrap { background: #000 !important; min-height: 100vh !important; padding: 0 !important; }
          .kp-container { padding: 0 !important; max-width: none !important; }
          .kp-card { border-radius: 0 !important; border: none !important; box-shadow: none !important; }
        }
      `}</style>

      <div ref={printRef} className="kp-wrap">
        <div className="kp-container">
          <div className="print-hide kp-print-btn-wrap">
            <button onClick={handlePrint} className="kp-print-btn">
              <Printer style={{ width: "14px", height: "14px" }} />
              Print / PDF
            </button>
          </div>

          <div className="kp-card">
            <div className="kp-header">
              <div className="kp-header-left">
                {freelancer.logoUrl ? (
                  <img src={freelancer.logoUrl} alt="" style={{ height: "40px", marginBottom: "12px", display: "block" }} />
                ) : (
                  <div className="kp-header-name" style={{ color }}>
                    {freelancer.name}
                  </div>
                )}
                <div className="kp-header-sub">{freelancer.name}</div>
              </div>
              <div className="kp-header-right">
                <div className="kp-header-label">Invoice</div>
                <div className="kp-header-number">{invoice.number}</div>
                <div className="kp-header-date">{today}</div>
              </div>
            </div>

            <div className="kp-addresses">
              <div className="kp-address-block">
                <div className="kp-address-label">From</div>
                <div className="kp-address-name">{freelancer.name}</div>
                {freelancer.company && <div className="kp-address-line" style={{ color: "rgba(255,255,255,0.4)" }}>{freelancer.company}</div>}
                <div className="kp-address-line">{freelancer.email}</div>
                {freelancer.phone && <div className="kp-address-line">{freelancer.phone}</div>}
                {freelancer.address && <div className="kp-address-line" style={{ marginTop: "2px" }}>{freelancer.address}</div>}
              </div>
              <div className="kp-address-block">
                <div className="kp-address-label">Bill To</div>
                <div className="kp-address-name">{client.name}</div>
                {client.company && <div className="kp-address-line" style={{ color: "rgba(255,255,255,0.4)" }}>{client.company}</div>}
                <div className="kp-address-line">{client.email}</div>
                {client.phone && <div className="kp-address-line">{client.phone}</div>}
                {client.address && <div className="kp-address-line" style={{ marginTop: "2px" }}>{client.address}</div>}
              </div>
            </div>

            <div className="kp-body">
              <table className="kp-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.rate, invoice.currency)}</td>
                      <td>{formatCurrency(item.amount, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="kp-totals-wrap">
                <div className="kp-totals">
                  <div className="kp-totals-row">
                    <span className="kp-totals-label">Total</span>
                    <span className="kp-totals-value">{formatCurrency(invoice.total, invoice.currency)}</span>
                  </div>
                  <div className="kp-totals-deposit">
                    <span className="kp-deposit-label" style={{ color }}>Deposit (50%)</span>
                    <span className="kp-deposit-value" style={{ color }}>{formatCurrency(invoice.depositAmount, invoice.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {freelancer.bankName && (
              <div className="kp-bank-section">
                <div className="kp-bank-title">Make your deposit</div>
                <div className="kp-bank-sub">Transfer the deposit amount to the account below</div>
                <div className="kp-bank-grid">
                  <div className="kp-bank-card">
                    <div className="kp-bank-card-label">Bank</div>
                    <div className="kp-bank-card-value">{freelancer.bankName}</div>
                  </div>
                  <div className="kp-bank-card">
                    <div className="kp-bank-card-label">Account Name</div>
                    <div className="kp-bank-card-value">{freelancer.bankAccountName}</div>
                  </div>
                  <div className="kp-bank-card">
                    <div className="kp-bank-card-label">Account Number</div>
                    <div className="kp-bank-card-value mono">{freelancer.bankAccountNumber}</div>
                  </div>
                </div>
                <div className="print-hide kp-bank-actions">
                  <button onClick={handleCopyAccount} className="kp-btn-copy">
                    <Copy style={{ width: "14px", height: "14px" }} />
                    {copied ? "Copied!" : "Copy details"}
                  </button>
                  <button
                    onClick={handleConfirmDeposit}
                    className="kp-btn-pay"
                    style={{ backgroundColor: color }}
                  >
                    I&apos;ve made the deposit
                  </button>
                </div>
              </div>
            )}
          </div>

          {(invoice.terms || DEFAULT_TERMS) && (
            <div className="kp-terms">
              <div className="kp-terms-label">Terms &amp; Conditions</div>
              <div className="kp-terms-text">{invoice.terms || DEFAULT_TERMS}</div>
            </div>
          )}

          <div className="kp-footer">Powered by Kredo</div>
        </div>
      </div>
    </>
  )
}
