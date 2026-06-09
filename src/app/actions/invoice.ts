"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendEmail, invoiceEmail, receiptEmail } from "@/lib/email"

function generateInvoiceNumber() {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `INV-${year}-${random}`
}

export async function createInvoice(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const clientId = formData.get("clientId") as string
  const dueDate = formData.get("dueDate") as string
  const notes = formData.get("notes") as string
  const terms = formData.get("terms") as string
  const currency = (formData.get("currency") as string) || "USD"
  const requestId = formData.get("requestId") as string

  const descriptions = formData.getAll("description") as string[]
  const quantities = formData.getAll("quantity") as string[]
  const rates = formData.getAll("rate") as string[]

  if (!clientId) throw new Error("Client is required")

  const items = descriptions
    .map((desc, i) => ({
      description: desc,
      quantity: parseFloat(quantities[i] || "1"),
      rate: parseFloat(rates[i] || "0"),
      amount: parseFloat(quantities[i] || "1") * parseFloat(rates[i] || "0"),
    }))
    .filter((item) => item.description && item.rate > 0)

  if (items.length === 0) throw new Error("At least one line item is required")

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxRate = parseFloat((formData.get("tax") as string) || "0")
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  const number = generateInvoiceNumber()

  const invoice = await prisma.invoice.create({
    data: {
      userId: session.user.id,
      clientId,
      number,
      amount: subtotal,
      tax,
      total,
      currency,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes || null,
      terms: terms || null,
      status: "SENT",
      items: {
        create: items,
      },
    },
    include: {
      client: { select: { name: true, email: true } },
    },
  })

  if (requestId) {
    await prisma.projectRequest.update({
      where: { id: requestId },
      data: { invoiceId: invoice.id, status: "INVOICE_SENT" },
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { brandName: true, name: true, brandColor: true, slug: true, email: true },
  })

  if (user && invoice.client?.email) {
    const brandName = user.brandName || user.name || "Freelancer"
    const brandColor = user.brandColor || "#e85d3a"
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://kredo-gray.vercel.app"
    const paymentLink = `${siteUrl}/${user.slug || "freelancer"}/invoice/${invoice.id}`
    const depositAmount = invoice.depositAmount || invoice.total * 0.5

    const { subject, html } = invoiceEmail({
      clientName: invoice.client.name,
      invoiceNumber: invoice.number,
      invoiceTotal: `${invoice.currency} ${invoice.total.toFixed(2)}`,
      depositAmount: `${invoice.currency} ${depositAmount.toFixed(2)}`,
      paymentLink,
      brandColor,
      brandName,
    })

    try {
      await sendEmail({
        to: invoice.client.email,
        subject,
        html,
        fromName: brandName,
        replyTo: user.email,
      })
    } catch (e) {
      console.error("[INVOICE EMAIL] Failed to send:", e)
    }
  }

  revalidatePath("/invoices")
  redirect("/invoices")
}

export async function updateInvoiceStatus(
  id: string,
  status: "SENT" | "PAID" | "CANCELLED" | "OVERDUE",
) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const data: Record<string, unknown> = { status }
  if (status === "SENT") data.issuedDate = new Date()
  if (status === "PAID") data.paidAt = new Date()

  await prisma.invoice.updateMany({
    where: { id, userId: session.user.id },
    data,
  })

  if (status === "SENT") {
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: session.user.id },
      include: {
        client: { select: { name: true, email: true } },
      },
    })

    if (invoice?.client?.email) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { brandName: true, name: true, brandColor: true, slug: true, email: true },
      })

      if (user) {
        const brandName = user.brandName || user.name || "Freelancer"
        const brandColor = user.brandColor || "#e85d3a"
        const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://kredo-gray.vercel.app"
        const paymentLink = `${siteUrl}/${user.slug || "freelancer"}/invoice/${invoice.id}`
        const depositAmount = invoice.depositAmount || invoice.total * 0.5

        const { subject, html } = invoiceEmail({
          clientName: invoice.client.name,
          invoiceNumber: invoice.number,
          invoiceTotal: `${invoice.currency} ${invoice.total.toFixed(2)}`,
          depositAmount: `${invoice.currency} ${depositAmount.toFixed(2)}`,
          paymentLink,
          brandColor,
          brandName,
        })

        try {
          await sendEmail({
            to: invoice.client.email,
            subject,
            html,
            fromName: brandName,
            replyTo: user.email,
          })
        } catch (e) {
          console.error("[INVOICE EMAIL] Failed to send:", e)
        }
      }
    }
  }

  revalidatePath("/invoices")
  revalidatePath(`/invoices/${id}`)
}

export async function createInvoiceFromRequest({
  requestId,
  clientName,
  clientEmail,
}: {
  requestId: string
  clientName: string
  clientEmail: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) throw new Error("User not found")

  let client = await prisma.client.findFirst({
    where: { email: clientEmail, userId: session.user.id },
  })

  if (!client) {
    client = await prisma.client.create({
      data: {
        userId: session.user.id,
        name: clientName,
        email: clientEmail,
      },
    })
  }

  redirect(`/invoices/new?clientId=${client.id}&requestId=${requestId}`)
}

export async function confirmPayment(paymentId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      invoice: {
        include: {
          client: { select: { name: true, email: true } },
          user: { select: { brandName: true, name: true, brandColor: true, email: true } },
        },
      },
    },
  })
  if (!payment) throw new Error("Payment not found")
  if (payment.status !== "PENDING") throw new Error("Payment already confirmed")

  const invoice = payment.invoice
  const isFullPayment = payment.amount >= invoice.total

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  })

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      depositPaid: true,
      depositPaidAt: new Date(),
      status: isFullPayment ? "PAID" : "PARTIAL",
      paidAt: isFullPayment ? new Date() : undefined,
    },
  })

  const req = await prisma.projectRequest.findFirst({
    where: { invoiceId: invoice.id },
  })

  if (req) {
    await prisma.projectRequest.update({
      where: { id: req.id },
      data: { depositPaid: true, status: "DEPOSIT_PAID" },
    })
  }

  // Send receipt email to client
  if (invoice.client?.email) {
    const brandName = invoice.user.brandName || invoice.user.name || "Freelancer"
    const brandColor = invoice.user.brandColor || "#e85d3a"
    const balanceRemaining = invoice.total - payment.amount

    try {
      const { subject, html } = receiptEmail({
        clientName: invoice.client.name,
        projectName: req?.projectName || "Project",
        invoiceNumber: invoice.number,
        amountPaid: `${invoice.currency} ${payment.amount.toFixed(2)}`,
        paymentType: isFullPayment ? "full" : "deposit",
        balanceRemaining: isFullPayment ? undefined : `${invoice.currency} ${balanceRemaining.toFixed(2)}`,
        brandColor,
        brandName,
        confirmationDate: new Date().toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        }),
      })
      await sendEmail({
        to: invoice.client.email,
        subject,
        html,
        fromName: brandName,
        replyTo: invoice.user.email,
      })
    } catch (e) {
      console.error("[RECEIPT EMAIL] Failed to send:", e)
    }
  }

  revalidatePath("/invoices")
  revalidatePath(`/invoices/${invoice.id}`)
  if (req) revalidatePath(`/requests/${req.id}`)
}

export async function deleteInvoice(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  await prisma.invoice.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/invoices")
  redirect("/invoices")
}
