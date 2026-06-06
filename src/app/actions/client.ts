"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function createClient(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const company = formData.get("company") as string
  const website = formData.get("website") as string
  const address = formData.get("address") as string
  const notes = formData.get("notes") as string

  if (!name) throw new Error("Name is required")

  await prisma.client.create({
    data: {
      userId: session.user.id,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      website: website || null,
      address: address || null,
      notes: notes || null,
    },
  })

  revalidatePath("/clients")
  redirect("/clients")
}

export async function updateClient(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const company = formData.get("company") as string
  const website = formData.get("website") as string
  const address = formData.get("address") as string
  const notes = formData.get("notes") as string

  if (!name) throw new Error("Name is required")

  await prisma.client.updateMany({
    where: { id, userId: session.user.id },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      website: website || null,
      address: address || null,
      notes: notes || null,
    },
  })

  revalidatePath("/clients")
  revalidatePath(`/clients/${id}`)
  redirect("/clients")
}

export async function deleteClient(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  await prisma.client.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/clients")
  redirect("/clients")
}
