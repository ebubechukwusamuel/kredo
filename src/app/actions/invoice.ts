"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

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

  await prisma.invoice.create({
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
      status: "DRAFT",
      items: {
        create: items,
      },
    },
  })

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

  revalidatePath("/invoices")
  revalidatePath(`/invoices/${id}`)
}

export async function createInvoiceFromRequest({
  requestId,
  clientName,
  clientEmail,
  projectName,
  description,
  budget,
}: {
  requestId: string
  clientName: string
  clientEmail: string
  projectName: string
  description: string
  budget: number
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

  const total = budget
  const depositAmount = total * 0.5
  const number = generateInvoiceNumber()

  const invoice = await prisma.invoice.create({
    data: {
      userId: session.user.id,
      clientId: client.id,
      number,
      amount: total,
      tax: 0,
      total,
      depositAmount,
      status: "SENT",
      items: {
        create: {
          description: projectName + (description ? ` — ${description.slice(0, 100)}` : ""),
          quantity: 1,
          rate: total,
          amount: total,
        },
      },
    },
  })

  await prisma.projectRequest.update({
    where: { id: requestId },
    data: { invoiceId: invoice.id, status: "INVOICE_SENT" },
  })

  revalidatePath(`/requests/${requestId}`)
  return { id: invoice.id }
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
