"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function completeOnboarding(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Not authenticated")

  const company = formData.get("company") as string
  const title = formData.get("title") as string
  const currency = (formData.get("currency") as string) || "USD"
  const rate = formData.get("rate") as string

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      company: company || null,
      title: title || null,
      currency,
      rate: rate ? parseFloat(rate) : null,
    },
  })

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
