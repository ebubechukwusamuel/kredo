import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmail, paymentPendingNotificationEmail, getBaseUrl } from "@/lib/email"

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await props.params
    const body = await req.json().catch(() => ({}))
    const type: "deposit" | "final" = body.type === "final" ? "final" : "deposit"

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        user: true,
        client: { select: { name: true, email: true } },
      },
    })
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const depositAmount = invoice.depositAmount || invoice.total * 0.5
    const remainingBalance = invoice.total - depositAmount

    const amount = type === "final" ? remainingBalance : depositAmount
    const notes = type === "final"
      ? "Final payment — pending verification"
      : "Client deposit — pending verification"

    await prisma.payment.create({
      data: {
        invoiceId: id,
        amount,
        method: "bank_transfer",
        notes,
        status: "PENDING",
      },
    })

    const reqLookup = await prisma.projectRequest.findFirst({
      where: { invoiceId: id },
    })

    const brandName = invoice.user.brandName || invoice.user.name || "Freelancer"
    const clientName = invoice.client?.name || reqLookup?.clientName || "A client"
    const projectName = reqLookup?.projectName || (invoice.client?.name ? `Invoice #${invoice.number}` : "a project")

    try {
      const paymentLabel = type === "final" ? "final payment" : "deposit"
      const { subject, html } = paymentPendingNotificationEmail({
        clientName,
        projectName,
        depositAmount: `${invoice.currency} ${amount.toFixed(2)}`,
        invoiceNumber: invoice.number,
        invoiceLink: `${getBaseUrl()}/invoices/${id}`,
        brandName,
      })
      await sendEmail({
        to: invoice.user.email,
        subject: subject.replace("claims payment", `claims ${paymentLabel}`),
        html,
        fromName: brandName,
        replyTo: invoice.user.email,
      })
      console.log(`[PENDING ${type.toUpperCase()}] Notification sent to ${invoice.user.email}`)
    } catch (e) {
      console.error(`[PENDING ${type.toUpperCase()} EMAIL] Failed:`, e)
    }

    return NextResponse.json({
      success: true,
      message: type === "final"
        ? "Final payment notification sent to freelancer for verification."
        : "Payment notification sent to freelancer for verification.",
    })
  } catch (e) {
    console.error("[CONFIRM DEPOSIT ERROR]", e)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    )
  }
}
