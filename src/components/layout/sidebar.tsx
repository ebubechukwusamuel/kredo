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
    <aside className="sidebar flex w-60 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link
          href="/dashboard"
          className="font-heading text-lg font-bold tracking-tight"
        >
          Kredo
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent/30 px-3 py-2.5">
          <p className="text-xs font-medium text-sidebar-foreground/80">Settings</p>
          <Link
            href="/settings"
            className={cn(
              "mt-1 flex items-center gap-3 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
              pathname === "/settings"
                ? "text-sidebar-accent-foreground"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
            )}
          >
            Preferences
          </Link>
        </div>
      </div>
    </aside>
  )
}
