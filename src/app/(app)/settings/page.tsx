import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { SettingsForm } from "@/components/forms/settings-form"
import { BrandForm } from "@/components/forms/brand-form"
import { PasswordForm } from "@/components/forms/password-form"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) redirect("/login")

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, brand, and payment details
        </p>
      </div>

      <section className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div>
          <h2 className="font-heading text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Your personal and business information
          </p>
        </div>
        <SettingsForm user={user} />
      </section>

      <section className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div>
          <h2 className="font-heading text-lg font-semibold">Brand & Payments</h2>
          <p className="text-sm text-muted-foreground">
            Set up your public page, brand colors, and bank details. Clients will see these
            when they submit a project request and make payments.
          </p>
        </div>
        <BrandForm user={user} />
      </section>

      {user.password && (
        <section className="space-y-6 rounded-xl border border-border bg-card p-6">
          <div>
            <h2 className="font-heading text-lg font-semibold">Password</h2>
            <p className="text-sm text-muted-foreground">
              Update your login password
            </p>
          </div>
          <PasswordForm />
        </section>
      )}
    </div>
  )
}
