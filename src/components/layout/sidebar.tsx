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
  Flame,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: Inbox },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/time", label: "Time Tracking", icon: Clock },
  { href: "/expenses", label: "Expenses", icon: Wallet },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar flex w-64 flex-col border-r border-white/[0.06] bg-[#09090B]" style={{ backgroundImage: "radial-gradient(ellipse at 0% 0%, rgba(239,68,68,0.06) 0%, transparent 60%)" }}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          <Flame className="h-4 w-4 text-white" />
        </div>
        <Link href="/dashboard" className="font-heading text-lg font-bold tracking-tight text-white">
          Kredo
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/25">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-red-500/15 to-orange-500/5 text-white border border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.08)]"
                  : "text-white/45 hover:bg-white/5 hover:text-white/80",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-red-500 to-orange-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-red-400" : "text-white/30 group-hover:text-white/60",
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            pathname === "/settings"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:bg-white/5 hover:text-white/70",
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
