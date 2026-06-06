import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { SettingsForm } from "@/components/forms/settings-form"
import { PasswordForm } from "@/components/forms/password-form"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) redirect("/login")

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, rates, and preferences
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Your personal and business information
          </p>
        </div>
        <SettingsForm user={user} />
      </section>

      {user.password && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-medium">Password</h2>
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
