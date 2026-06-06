import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXTAUTH_URL || "https://kredo-gray.vercel.app"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`)
    console.log(`[EMAIL] HTML: ${html.slice(0, 200)}...`)
    return
  }

  await resend.emails.send({
    from: "Kredo <onboarding@resend.dev>",
    to,
    subject,
    html,
  })
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

export function getBaseUrl() {
  return BASE_URL
}
