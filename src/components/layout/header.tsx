"use client"

import { useSession, signOut } from "next-auth/react"
import * as Avatar from "@radix-ui/react-avatar"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { LogOut, User, Settings, ChevronDown } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="app-header flex h-16 items-center justify-end gap-4 border-b border-border bg-background px-6">
      {session?.user && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex items-center gap-3 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-muted">
            <Avatar.Root className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              {session.user.image ? (
                <Avatar.Image src={session.user.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <Avatar.Fallback className="flex h-full w-full items-center justify-center text-xs font-medium text-primary">
                  {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                </Avatar.Fallback>
              )}
            </Avatar.Root>
            <span className="text-sm font-medium text-foreground">
              {session.user.name || session.user.email}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-50 min-w-[180px] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
            >
              <DropdownMenu.Item asChild>
                <Link
                  href="/settings"
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-popover-foreground outline-none transition-colors hover:bg-muted"
                >
                  <Settings className="h-4 w-4" />
                  Preferences
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="mx-2 my-1 border-t border-border" />
              <DropdownMenu.Item
                onClick={() => signOut({ redirectTo: "/login" })}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive outline-none transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </header>
  )
}
