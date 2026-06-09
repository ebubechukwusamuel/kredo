import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { SettingsForm } from "@/components/forms/settings-form"
import { BrandForm } from "@/components/forms/brand-form"
import { PasswordForm } from "@/components/forms/password-form"
import { Settings, User, Palette, Lock } from "lucide-react"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) redirect("/login")

  return (
    <div className="relative mx-auto max-w-3xl space-y-8 pb-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] right-[0%] h-[300px] w-[300px] rounded-full bg-red-600/6 blur-[100px]" />
      </div>

      {/* Page Header */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 border border-white/10">
            <Settings className="h-3.5 w-3.5 text-white/60" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/25">Preferences</span>
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-sm text-white/45">Manage your profile, brand, and payment details.</p>
      </div>

      {/* Profile Section */}
      <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
            <User className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-white">Profile</h2>
            <p className="text-xs text-white/40">Your personal and business information</p>
          </div>
        </div>
        <div className="p-6">
          <SettingsForm user={user} />
        </div>
      </section>

      {/* Brand & Payments Section */}
      <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Palette className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-white">Brand & Payments</h2>
            <p className="text-xs text-white/40">
              Set up your public page, brand colors, and bank details
            </p>
          </div>
        </div>
        <div className="p-6">
          <BrandForm user={user} />
        </div>
      </section>

      {/* Password Section */}
      {user.password && (
        <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
              <Lock className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-semibold text-white">Password</h2>
              <p className="text-xs text-white/40">Update your login password</p>
            </div>
          </div>
          <div className="p-6">
            <PasswordForm />
          </div>
        </section>
      )}
    </div>
  )
}
