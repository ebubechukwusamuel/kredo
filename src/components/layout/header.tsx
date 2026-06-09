"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import * as Avatar from "@radix-ui/react-avatar"
import * as Dialog from "@radix-ui/react-dialog"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {
  LogOut,
  Settings,
  ChevronDown,
  Bell,
  Menu,
  Plus,
  X,
  Users,
  FileText,
  Receipt,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { KredoLogo } from "@/components/kredo-logo"
import { NavigationLinks, SettingsLink } from "./sidebar"

const quickActions = [
  { href: "/clients/new", label: "Client", icon: Users },
  { href: "/proposals/new", label: "Proposal", icon: FileText },
  { href: "/invoices/new", label: "Invoice", icon: Receipt },
  { href: "/time", label: "Track time", icon: Clock },
]

export function Header() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const initials = (session?.user?.name || session?.user?.email || "U")
    .charAt(0)
    .toUpperCase()

  return (
    <header className="app-header sticky top-0 z-40 flex min-h-16 items-center justify-between gap-4 border-b border-white/[0.08] bg-[#0B0A0A]/82 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Trigger asChild>
            <button
              aria-label="Open navigation"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/75 transition-all hover:bg-white/[0.09] hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
            <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,22rem)] flex-col border-r border-white/10 bg-[#0D0B0C] p-4 shadow-2xl outline-none">
              <div className="mb-6 flex items-center justify-between">
                <KredoLogo />
                <Dialog.Close asChild>
                  <button
                    aria-label="Close navigation"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/65 hover:bg-white/[0.08] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>
              <NavigationLinks onNavigate={() => setMobileOpen(false)} />
              <div className="mt-5 border-t border-white/[0.08] pt-4">
                <SettingsLink onNavigate={() => setMobileOpen(false)} />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <KredoLogo tagline={false} />
      </div>

      <div className="hidden min-w-0 lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-200/35">
          Workspace
        </p>
        <p className="mt-0.5 text-sm text-white/58">
          Manage clients, projects, billing, and time from one place.
        </p>
      </div>

      {session?.user && (
        <div className="flex items-center gap-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="hidden h-10 items-center gap-2 rounded-xl border border-orange-400/20 bg-orange-500/10 px-4 text-sm font-semibold text-orange-100 outline-none transition-all hover:bg-orange-500/15 sm:flex">
              <Plus className="h-4 w-4" />
              New
              <ChevronDown className="h-3.5 w-3.5 text-orange-100/50" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-[190px] overflow-hidden rounded-2xl border border-white/10 bg-[#141012]/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              >
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <DropdownMenu.Item key={action.href} asChild>
                      <Link
                        href={action.href}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-white/75 outline-none transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <Icon className="h-4 w-4 text-orange-300" />
                        New {action.label}
                      </Link>
                    </DropdownMenu.Item>
                  )
                })}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <button
            aria-label="Notifications"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/55 transition-all hover:bg-white/[0.09] hover:text-white hover:border-orange-400/20"
          >
            <Bell className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-orange-300" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
            </span>
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex h-10 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] px-2.5 outline-none transition-all hover:border-white/18 hover:bg-white/[0.09] sm:px-3">
              <Avatar.Root className="brand-gradient flex h-7 w-7 items-center justify-center overflow-hidden rounded-full shadow-[0_10px_24px_rgba(239,68,68,0.24)]">
                {session.user.image ? (
                  <Avatar.Image src={session.user.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Avatar.Fallback className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </Avatar.Fallback>
                )}
              </Avatar.Root>
              <span className="text-sm font-medium text-white/80">
                {session.user.name?.split(" ")[0] || session.user.email}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-white/30" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#141012]/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              >
                <div className="mb-1 px-3 py-2.5">
                  <p className="text-xs font-semibold text-white/90">{session.user.name || "User"}</p>
                  <p className="text-xs text-white/40">{session.user.email}</p>
                </div>
                <DropdownMenu.Separator className="my-1 border-t border-white/10" />

                <DropdownMenu.Item asChild>
                  <Link
                    href="/settings"
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-white/70 outline-none transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 border-t border-white/10" />

                <DropdownMenu.Item
                  onClick={() => signOut({ redirectTo: "/login" })}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-400 outline-none transition-colors hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      )}
    </header>
  )
}
