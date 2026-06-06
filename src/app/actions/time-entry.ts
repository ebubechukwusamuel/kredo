"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function startTimer(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const description = formData.get("description") as string
  const projectId = (formData.get("projectId") as string) || null

  await prisma.timeEntry.create({
    data: {
      userId: session.user.id,
      projectId,
      description: description || "Untitled timer",
      duration: 0,
      startedAt: new Date(),
      billable: true,
    },
  })

  revalidatePath("/time")
}

export async function stopTimer(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const entry = await prisma.timeEntry.findFirst({
    where: { id, userId: session.user.id, endedAt: null },
  })
  if (!entry || !entry.startedAt) return

  const endedAt = new Date()
  const duration = Math.round(
    (endedAt.getTime() - entry.startedAt.getTime()) / 1000,
  )

  await prisma.timeEntry.updateMany({
    where: { id, userId: session.user.id },
    data: { endedAt, duration },
  })

  revalidatePath("/time")
}

export async function createTimeEntry(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const description = formData.get("description") as string
  const hours = parseFloat(formData.get("hours") as string) || 0
  const minutes = parseFloat(formData.get("minutes") as string) || 0
  const date = formData.get("date") as string
  const rate = formData.get("rate")
    ? parseFloat(formData.get("rate") as string)
    : null
  const projectId = (formData.get("projectId") as string) || null

  if (!description) throw new Error("Description is required")
  if (hours === 0 && minutes === 0) throw new Error("Enter hours or minutes")

  const duration = hours * 3600 + minutes * 60

  await prisma.timeEntry.create({
    data: {
      userId: session.user.id,
      projectId,
      description,
      duration,
      billable: formData.get("billable") !== "off",
      rate,
      date: date ? new Date(date) : new Date(),
      startedAt: date ? new Date(date) : new Date(),
    },
  })

  revalidatePath("/time")
}

export async function deleteTimeEntry(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  await prisma.timeEntry.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/time")
}
