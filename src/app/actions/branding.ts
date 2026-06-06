"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateBranding(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const brandName = formData.get("brandName") as string
  const brandColor = formData.get("brandColor") as string
  const logoUrl = formData.get("logoUrl") as string
  const slug = formData.get("slug") as string
  const bankName = formData.get("bankName") as string
  const bankAccountName = formData.get("bankAccountName") as string
  const bankAccountNumber = formData.get("bankAccountNumber") as string

  if (slug) {
    const existing = await prisma.user.findUnique({ where: { slug } })
    if (existing && existing.id !== session.user.id) {
      throw new Error("This link name is already taken")
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { brandName, brandColor, logoUrl, slug, bankName, bankAccountName, bankAccountNumber },
  })

  revalidatePath("/settings")
}
