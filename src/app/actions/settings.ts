"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function updateSettings(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const data = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    bio: formData.get("bio") as string,
    company: formData.get("company") as string,
    title: formData.get("title") as string,
    address: formData.get("address") as string,
    taxId: formData.get("taxId") as string,
    currency: (formData.get("currency") as string) || "USD",
    rate: formData.get("rate") ? parseFloat(formData.get("rate") as string) : null,
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  })

  revalidatePath("/settings")
}

export async function updatePassword(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string

  if (!currentPassword || !newPassword) throw new Error("Both passwords are required")
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user?.password) throw new Error("Cannot change password for OAuth accounts")

  const bcrypt = await import("bcryptjs")
  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) throw new Error("Current password is incorrect")

  const hashed = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  })
}
