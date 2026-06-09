"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Clock,
  Wallet,
  Briefcase,
  Inbox,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { KredoLogo } from "@/components/kredo-logo"

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: Inbox },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/time", label: "Time Tracking", icon: Clock },
  { href: "/expenses", label: "Expenses", icon: Wallet },
]

export function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-0.5">
      <div className="mb-3 flex items-center justify-between px-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/25">
          Main Menu
        </p>
      </div>
      {navItems.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
              active
                ? "border border-red-500/20 bg-gradient-to-r from-red-500/18 via-orange-500/8 to-transparent text-white shadow-[0_12px_30px_rgba(239,68,68,0.1)]"
                : "text-white/52 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-red-500 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse-soft" />
            )}
            <Icon
              className={cn(
                "h-4 w-4 transition-all duration-300",
                active ? "text-orange-300" : "text-white/35 group-hover:text-orange-200 group-hover:scale-110",
              )}
            />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function SettingsLink({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <Link
      href="/settings"
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
        pathname === "/settings"
          ? "border border-white/10 bg-white/10 text-white"
          : "text-white/48 hover:bg-white/[0.06] hover:text-white",
      )}
    >
      <Settings className="h-4 w-4" />
      Settings
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside
      className="sidebar flex h-dvh w-72 flex-col border-r border-white/[0.08] bg-sidebar/95 px-4 py-4 backdrop-blur-xl"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 0% 0%, rgba(239,68,68,0.12) 0%, transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.035), transparent 26%)",
      }}
    >
      <div className="mb-6 px-1">
        <KredoLogo />
      </div>

      <NavigationLinks />

      <div className="mt-5 border-t border-white/[0.08] pt-4">
        <SettingsLink />
        <div className="mt-4 rounded-2xl border border-orange-500/15 bg-gradient-to-br from-red-500/10 to-orange-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-200/55">
            Quick tip
          </p>
          <p className="mt-2 text-sm leading-5 text-white/68">
            Add clients first so proposals, invoices, and projects connect cleanly.
          </p>
        </div>
      </div>
    </aside>
  )
}
