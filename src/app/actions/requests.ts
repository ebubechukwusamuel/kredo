"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendEmail, newRequestEmail, deliveryEmail, getBaseUrl } from "@/lib/email"

export async function submitProjectRequest(slug: string, formData: FormData) {
  const user = await prisma.user.findUnique({ where: { slug } })
  if (!user) throw new Error("Freelancer not found")

  const clientName = formData.get("clientName") as string
  const clientEmail = formData.get("clientEmail") as string
  const clientPhone = formData.get("clientPhone") as string
  const company = formData.get("company") as string
  const projectName = formData.get("projectName") as string
  const description = formData.get("description") as string
  const features = formData.get("features") as string
  const referenceUrls = formData.get("referenceUrls") as string
  const timeline = formData.get("timeline") as string

  // Auto-create or update Client record
  const existingClient = await prisma.client.findFirst({
    where: { userId: user.id, email: clientEmail },
  })

  if (existingClient) {
    await prisma.client.update({
      where: { id: existingClient.id },
      data: { name: clientName, phone: clientPhone, company },
    })
  } else {
    await prisma.client.create({
      data: {
        userId: user.id,
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        company,
      },
    })
  }

  const request = await prisma.projectRequest.create({
    data: {
      userId: user.id,
      clientName,
      clientEmail,
      clientPhone,
      company,
      projectName,
      description,
      features,
      referenceUrls,
      timeline,
    },
  })

  try {
    const { subject, html } = newRequestEmail({
      freelancerName: user.name || user.brandName || "Freelancer",
      clientName,
      projectName,
      requestLink: `${getBaseUrl()}/requests/${request.id}`,
    })
    await sendEmail({ to: user.email, subject, html, fromName: clientName, replyTo: clientEmail })
  } catch (e) {
    console.error("[REQUEST EMAIL] Failed to send to freelancer:", e)
  }

  return { success: true }
}

export async function getProjectRequests() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")

  return prisma.projectRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function updateRequestStatus(id: string, status: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")

  await prisma.projectRequest.update({
    where: { id, userId: session.user.id },
    data: { status },
  })

  revalidatePath("/requests")
}

export async function linkInvoiceToRequest(requestId: string, invoiceId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")

  await prisma.projectRequest.update({
    where: { id: requestId, userId: session.user.id },
    data: { invoiceId, status: "INVOICE_SENT" },
  })

  revalidatePath(`/requests/${requestId}`)
}

export async function submitDelivery(requestId: string, deliveryLink: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const req = await prisma.projectRequest.findFirst({
    where: { id: requestId, userId: session.user.id },
    include: { user: true, invoice: true },
  })
  if (!req) throw new Error("Request not found")

  await prisma.projectRequest.update({
    where: { id: requestId },
    data: { deliveryLink, deliveredAt: new Date(), status: "DELIVERED" },
  })

  try {
    const brandName = req.user.brandName || req.user.name || "Freelancer"
    const brandColor = req.user.brandColor || "#e85d3a"

    const { subject, html } = deliveryEmail({
      clientName: req.clientName,
      projectName: req.projectName,
      deliveryLink,
      brandColor,
      brandName,
    })
    await sendEmail({ to: req.clientEmail, subject, html, fromName: brandName, replyTo: req.user.email })
  } catch (e) {
    console.error("[DELIVERY EMAIL] Failed to send to client:", e)
  }

  revalidatePath(`/requests/${requestId}`)
}
