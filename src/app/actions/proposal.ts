"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function createProposal(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const clientId = formData.get("clientId") as string
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const amount = formData.get("amount") as string

  if (!clientId || !title) throw new Error("Client and title are required")

  await prisma.proposal.create({
    data: {
      userId: session.user.id,
      clientId,
      title,
      content: content || null,
      amount: amount ? parseFloat(amount) : null,
      status: "DRAFT",
    },
  })

  revalidatePath("/proposals")
  redirect("/proposals")
}

export async function updateProposalStatus(
  id: string,
  status: "SENT" | "ACCEPTED" | "DECLINED",
) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  await prisma.proposal.updateMany({
    where: { id, userId: session.user.id },
    data: { status, ...(status === "SENT" ? { sentAt: new Date() } : status === "ACCEPTED" || status === "DECLINED" ? { respondedAt: new Date() } : {}) },
  })

  revalidatePath("/proposals")
  revalidatePath(`/proposals/${id}`)
}

export async function deleteProposal(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  await prisma.proposal.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/proposals")
  redirect("/proposals")
}
