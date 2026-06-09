import nodemailer from "nodemailer"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXTAUTH_URL || "https://kredo-gray.vercel.app"

interface EmailOptions {
  to: string
  subject: string
  html: string
  fromName?: string
  replyTo?: string
}

function createSmtpTransport() {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!user || !pass) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  })
}

function getFromAddress(senderName?: string) {
  const fallbackEmail = process.env.SMTP_USER || "kredo@kredo.app"
  return senderName ? `${senderName} <${fallbackEmail}>` : (process.env.EMAIL_FROM || `Kredo <${fallbackEmail}>`)
}

export async function sendEmail({ to, subject, html, fromName, replyTo }: EmailOptions) {
  const transport = createSmtpTransport()

  if (transport) {
    try {
      const fromAddress = process.env.SMTP_USER || "noreply@kredo.app"
      const from = fromName ? `"${fromName}" <${fromAddress}>` : `"Kredo" <${fromAddress}>`
      await transport.sendMail({ from, to, subject, html, replyTo })
      console.log(`[EMAIL SMTP] Sent to: ${to} | Subject: ${subject}`)
      return
    } catch (e) {
      console.error("[EMAIL SMTP] Failed, falling back to Resend:", e)
    }
  }

  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`)
    console.log(`[EMAIL] HTML: ${html.slice(0, 200)}...`)
    return
  }

  const result = await resend.emails.send({
    from: getFromAddress(fromName),
    to,
    subject,
    html,
    ...(replyTo ? { reply_to: replyTo } : {}),
  })

  if (result.error) {
    console.error("[RESEND ERROR]", JSON.stringify(result.error, null, 2))
    return
  }

  console.log(`[EMAIL RESEND] To: ${to} | Subject: ${subject} | Id: ${result.data?.id}`)
}

function brandStyles(color: string) {
  return `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
      .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
      .card { background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e8e4df; }
      .btn { display: inline-block; padding: 12px 24px; background: ${color}; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; }
      .footer { margin-top: 24px; text-align: center; color: #8a8278; font-size: 12px; }
      h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px; }
      p { color: #555; line-height: 1.6; font-size: 14px; }
    </style>
  `
}

export function invoiceEmail({
  clientName,
  invoiceNumber,
  invoiceTotal,
  depositAmount,
  paymentLink,
  brandColor,
  brandName,
}: {
  clientName: string
  invoiceNumber: string
  invoiceTotal: string
  depositAmount: string
  paymentLink: string
  brandColor: string
  brandName: string
}) {
  return {
    subject: `Invoice ${invoiceNumber} from ${brandName}`,
    html: `
      <html>
        <head>${brandStyles(brandColor)}</head>
        <body>
          <div class="wrapper">
            <div class="card">
              <h1>Invoice from ${brandName}</h1>
              <p>Hi ${clientName},</p>
              <p>You've received an invoice for <strong>${invoiceTotal}</strong>.</p>
              <p>A <strong>50% deposit of ${depositAmount}</strong> is required to get started.</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${paymentLink}" class="btn">View Invoice & Pay Deposit</a>
              </div>
              <p style="font-size:12px;color:#8a8278">
                Invoice #${invoiceNumber} &middot; Total: ${invoiceTotal}
              </p>
            </div>
            <div class="footer">
              Powered by Kredo &middot; ${brandName}
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function depositConfirmedEmail({
  clientName,
  projectName,
  brandColor,
  brandName,
}: {
  clientName: string
  projectName: string
  brandColor: string
  brandName: string
}) {
  return {
    subject: `Your project "${projectName}" is in progress`,
    html: `
      <html>
        <head>${brandStyles(brandColor)}</head>
        <body>
          <div class="wrapper">
            <div class="card">
              <h1>Project in progress</h1>
              <p>Hi ${clientName},</p>
              <p>Your deposit has been confirmed. <strong>${brandName}</strong> is now working on <strong>${projectName}</strong>.</p>
              <p>You'll receive an update when your project is ready.</p>
            </div>
            <div class="footer">Powered by Kredo &middot; ${brandName}</div>
          </div>
        </body>
      </html>
    `,
  }
}

export function deliveryEmail({
  clientName,
  projectName,
  deliveryLink,
  brandColor,
  brandName,
}: {
  clientName: string
  projectName: string
  deliveryLink: string
  brandColor: string
  brandName: string
}) {
  return {
    subject: `Your project "${projectName}" is ready!`,
    html: `
      <html>
        <head>${brandStyles(brandColor)}</head>
        <body>
          <div class="wrapper">
            <div class="card">
              <h1>Your project is ready</h1>
              <p>Hi ${clientName},</p>
              <p>Your project <strong>${projectName}</strong> is complete. Click below to view it.</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${deliveryLink}" class="btn">View Your Project</a>
              </div>
            </div>
            <div class="footer">Powered by Kredo &middot; ${brandName}</div>
          </div>
        </body>
      </html>
    `,
  }
}

export function finalPaymentReminderEmail({
  clientName,
  projectName,
  remainingBalance,
  invoiceNumber,
  paymentLink,
  brandColor,
  brandName,
}: {
  clientName: string
  projectName: string
  remainingBalance: string
  invoiceNumber: string
  paymentLink: string
  brandColor: string
  brandName: string
}) {
  return {
    subject: `Final payment reminder for "${projectName}"`,
    html: `
      <html>
        <head>${brandStyles(brandColor)}</head>
        <body>
          <div class="wrapper">
            <div class="card">
              <h1>Your project is delivered! 🎉</h1>
              <p>Hi ${clientName},</p>
              <p>Your project <strong>${projectName}</strong> has been delivered and is ready for you.</p>
              <p>To complete payment, please settle the remaining balance of <strong>${remainingBalance}</strong> (Invoice #${invoiceNumber}).</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${paymentLink}" class="btn">Pay Remaining Balance</a>
              </div>
              <p style="font-size:12px;color:#8a8278">Once the final payment is confirmed, you'll receive a receipt.</p>
            </div>
            <div class="footer">Powered by Kredo &middot; ${brandName}</div>
          </div>
        </body>
      </html>
    `,
  }
}

export function newRequestEmail({
  freelancerName,
  clientName,
  projectName,
  requestLink,
}: {
  freelancerName: string
  clientName: string
  projectName: string
  requestLink: string
}) {
  return {
    subject: `New project request from ${clientName}`,
    html: `
      <html>
        <head>${brandStyles("#e85d3a")}</head>
        <body>
          <div class="wrapper">
            <div class="card">
              <h1>New project request</h1>
              <p>Hi ${freelancerName},</p>
              <p><strong>${clientName}</strong> has submitted a project request for <strong>${projectName}</strong>.</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${requestLink}" class="btn" style="background:#e85d3a">View Request</a>
              </div>
            </div>
            <div class="footer">Powered by Kredo</div>
          </div>
        </body>
      </html>
    `,
  }
}

export function paymentPendingNotificationEmail({
  clientName,
  projectName,
  depositAmount,
  invoiceNumber,
  invoiceLink,
  brandName,
}: {
  clientName: string
  projectName: string
  depositAmount: string
  invoiceNumber: string
  invoiceLink: string
  brandName: string
}) {
  return {
    subject: `💰 ${clientName} claims payment for "${projectName}"`,
    html: `
      <html>
        <head>${brandStyles("#e85d3a")}</head>
        <body>
          <div class="wrapper">
            <div class="card">
              <h1>Payment claimed by client</h1>
              <p>Hi ${brandName},</p>
              <p><strong>${clientName}</strong> has indicated they've made a deposit of <strong>${depositAmount}</strong> for <strong>${projectName}</strong> (Invoice #${invoiceNumber}).</p>
              <p>Please check your bank account to verify the deposit, then confirm the payment.</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${invoiceLink}" class="btn" style="background:#e85d3a">View Invoice & Confirm</a>
              </div>
              <p style="font-size:12px;color:#8a8278">The payment will only be marked as received after you confirm it.</p>
            </div>
            <div class="footer">Powered by Kredo</div>
          </div>
        </body>
      </html>
    `,
  }
}

export function receiptEmail({
  clientName,
  projectName,
  invoiceNumber,
  amountPaid,
  paymentType,
  balanceRemaining,
  brandColor,
  brandName,
  confirmationDate,
}: {
  clientName: string
  projectName: string
  invoiceNumber: string
  amountPaid: string
  paymentType: "deposit" | "full"
  balanceRemaining?: string
  brandColor: string
  brandName: string
  confirmationDate: string
}) {
  const isFull = paymentType === "full"
  return {
    subject: isFull
      ? `Receipt: Full payment received for ${projectName}`
      : `Receipt: Deposit received for ${projectName}`,
    html: `
      <html>
        <head>${brandStyles(brandColor)}</head>
        <body>
          <div class="wrapper">
            <div class="card">
              <div style="text-align:center;margin-bottom:24px">
                <div style="width:56px;height:56px;border-radius:50%;background:${brandColor}20;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${brandColor}" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h1 style="font-size:20px;margin:0 0 4px;color:#1a1a1a">Payment Receipt</h1>
                <p style="font-size:13px;color:#8a8278;margin:0">Invoice #${invoiceNumber}</p>
              </div>

              <div style="background:#f8f6f3;border-radius:8px;padding:20px;margin-bottom:20px">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                  <span style="font-size:13px;color:#666">Project</span>
                  <span style="font-size:13px;font-weight:600;color:#1a1a1a">${projectName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                  <span style="font-size:13px;color:#666">Client</span>
                  <span style="font-size:13px;font-weight:600;color:#1a1a1a">${clientName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                  <span style="font-size:13px;color:#666">Date confirmed</span>
                  <span style="font-size:13px;font-weight:600;color:#1a1a1a">${confirmationDate}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid #e8e4df">
                  <span style="font-size:13px;color:#666">Amount received</span>
                  <span style="font-size:18px;font-weight:700;color:${brandColor}">${amountPaid}</span>
                </div>
              </div>

              <div style="background:${isFull ? brandColor + "10" : "#fff8e5"};border-radius:8px;padding:16px;margin-bottom:20px;border-left:3px solid ${isFull ? brandColor : "#f0ad4e"}">
                <div style="display:flex;align-items:flex-start;gap:10px">
                  <span style="font-size:16px">${isFull ? "✅" : "⏳"}</span>
                  <div>
                    <p style="font-size:13px;font-weight:600;color:#1a1a1a;margin:0 0 2px">
                      ${isFull ? "Full payment received" : "Deposit received"}
                    </p>
                    <p style="font-size:12px;color:#666;margin:0">
                      ${isFull
                        ? "Thank you! The invoice has been fully settled. No balance remaining."
                        : `A deposit of ${amountPaid} has been received. The remaining balance of ${balanceRemaining} is due upon delivery.`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <p style="font-size:12px;color:#8a8278;text-align:center;margin:0">Thank you for your business!</p>
            </div>
            <div class="footer">Powered by Kredo &middot; ${brandName}</div>
          </div>
        </body>
      </html>
    `,
  }
}

export function getBaseUrl() {
  return BASE_URL
}
