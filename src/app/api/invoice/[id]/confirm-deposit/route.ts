import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmail, paymentPendingNotificationEmail, getBaseUrl } from "@/lib/email"

export async function POST(
  _req: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await props.params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const depositAmount = invoice.depositAmount || invoice.total * 0.5

    await prisma.payment.create({
      data: {
        invoiceId: id,
        amount: depositAmount,
        method: "bank_transfer",
        notes: "Client deposit — pending verification",
        status: "PENDING",
      },
    })

    // Notify the freelancer that a client claims payment
    const req = await prisma.projectRequest.findFirst({
      where: { invoiceId: id },
    })

    if (req) {
      try {
        const brandName = invoice.user.brandName || invoice.user.name || "Freelancer"
        const clientName = req.clientName
        const projectName = req.projectName

        const { subject, html } = paymentPendingNotificationEmail({
          clientName,
          projectName,
          depositAmount: `${invoice.currency} ${depositAmount.toFixed(2)}`,
          invoiceNumber: invoice.number,
          invoiceLink: `${getBaseUrl()}/invoices/${id}`,
          brandName,
        })
        await sendEmail({
          to: invoice.user.email,
          subject,
          html,
        })
      } catch (e) {
        console.error("[PENDING PAYMENT EMAIL] Failed to send to freelancer:", e)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment notification sent to freelancer for verification.",
    })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    )
  }
}
