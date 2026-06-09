"use client"

import { useSession, signOut } from "next-auth/react"
import * as Avatar from "@radix-ui/react-avatar"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { LogOut, Settings, ChevronDown, Bell } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { data: session } = useSession()
  const initials = (session?.user?.name || session?.user?.email || "U")
    .charAt(0)
    .toUpperCase()

  return (
    <header className="app-header flex h-16 items-center justify-end gap-4 border-b border-white/[0.06] bg-[#09090B]/80 backdrop-blur-md px-6">
      {session?.user && (
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-4 w-4" />
          </button>

          {/* User Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 outline-none transition-all hover:bg-white/10 hover:border-white/20">
              <Avatar.Root className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-red-500 to-orange-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
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
                className="z-50 min-w-[200px] overflow-hidden rounded-2xl border border-white/10 bg-[#111113] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              >
                {/* User Info */}
                <div className="mb-1 px-3 py-2.5">
                  <p className="text-xs font-semibold text-white/90">{session.user.name || "User"}</p>
                  <p className="text-xs text-white/40">{session.user.email}</p>
                </div>
                <DropdownMenu.Separator className="my-1 border-t border-white/10" />

                <DropdownMenu.Item asChild>
                  <Link
                    href="/settings"
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-white/70 outline-none transition-colors hover:bg-white/5 hover:text-white"
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
