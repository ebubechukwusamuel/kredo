"use client"

import { useSession, signOut } from "next-auth/react"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
      {session?.user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {session.user.name || session.user.email}
          </span>
          <Button variant="ghost" size="icon" asChild>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ redirectTo: "/login" })}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </header>
  )
}
