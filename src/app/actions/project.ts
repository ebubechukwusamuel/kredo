"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function createProject(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const clientId = formData.get("clientId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const budget = formData.get("budget") as string
  const rate = formData.get("rate") as string
  const startDate = formData.get("startDate") as string
  const deadline = formData.get("deadline") as string
  const notes = formData.get("notes") as string

  if (!clientId || !name) throw new Error("Client and name are required")

  await prisma.project.create({
    data: {
      userId: session.user.id,
      clientId,
      name,
      description: description || null,
      budget: budget ? parseFloat(budget) : null,
      rate: rate ? parseFloat(rate) : null,
      startDate: startDate ? new Date(startDate) : null,
      deadline: deadline ? new Date(deadline) : null,
      notes: notes || null,
    },
  })

  revalidatePath("/projects")
  redirect("/projects")
}

export async function updateProject(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const status = formData.get("status") as string
  const budget = formData.get("budget") as string
  const rate = formData.get("rate") as string
  const startDate = formData.get("startDate") as string
  const deadline = formData.get("deadline") as string
  const notes = formData.get("notes") as string

  const data: Record<string, unknown> = {
    name,
    description: description || null,
    status: status || "ACTIVE",
    budget: budget ? parseFloat(budget) : null,
    rate: rate ? parseFloat(rate) : null,
    startDate: startDate ? new Date(startDate) : null,
    deadline: deadline ? new Date(deadline) : null,
    notes: notes || null,
  }

  if (status === "COMPLETED") data.completedAt = new Date()

  await prisma.project.updateMany({
    where: { id, userId: session.user.id },
    data,
  })

  revalidatePath("/projects")
  revalidatePath(`/projects/${id}`)
}

export async function deleteProject(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  await prisma.project.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/projects")
  redirect("/projects")
}
