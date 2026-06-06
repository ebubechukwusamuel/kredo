import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmail, depositConfirmedEmail, getBaseUrl } from "@/lib/email"

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

    await prisma.invoice.update({
      where: { id },
      data: {
        depositPaid: true,
        depositPaidAt: new Date(),
        status: "PAID",
      },
    })

    const req = await prisma.projectRequest.findFirst({
      where: { invoiceId: id },
    })

    if (req) {
      await prisma.projectRequest.update({
        where: { id: req.id },
        data: { depositPaid: true, status: "DEPOSIT_PAID" },
      })
    }

    await prisma.payment.create({
      data: {
        invoiceId: id,
        amount: invoice.depositAmount || invoice.total * 0.5,
        method: "bank_transfer",
        notes: "Client deposit",
      },
    })

    if (req) {
      const brandName = invoice.user.brandName || invoice.user.name || "Freelancer"
      const brandColor = invoice.user.brandColor || "#e85d3a"

      const { subject, html } = depositConfirmedEmail({
        clientName: req.clientName,
        projectName: req.projectName,
        brandColor,
        brandName,
      })
      await sendEmail({ to: req.clientEmail, subject, html })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    )
  }
}
