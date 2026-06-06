"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function createExpense(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const amount = formData.get("amount") as string
  const date = formData.get("date") as string
  const notes = formData.get("notes") as string
  const taxDeductible = formData.get("taxDeductible") === "on"

  if (!category || !description || !amount) {
    throw new Error("Category, description, and amount are required")
  }

  await prisma.expense.create({
    data: {
      userId: session.user.id,
      category,
      description,
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
      notes: notes || null,
      taxDeductible,
    },
  })

  revalidatePath("/expenses")
  redirect("/expenses")
}

export async function updateExpense(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const amount = formData.get("amount") as string
  const date = formData.get("date") as string
  const notes = formData.get("notes") as string
  const taxDeductible = formData.get("taxDeductible") === "on"

  await prisma.expense.updateMany({
    where: { id, userId: session.user.id },
    data: {
      category,
      description,
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
      notes: notes || null,
      taxDeductible,
    },
  })

  revalidatePath("/expenses")
}

export async function deleteExpense(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  await prisma.expense.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/expenses")
  redirect("/expenses")
}
