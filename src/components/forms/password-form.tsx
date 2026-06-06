"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { updatePassword } from "@/app/actions/settings"

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      try {
        await updatePassword(formData)
        return { success: true, error: null }
      } catch (e) {
        return { success: false, error: (e as Error).message }
      }
    },
    { success: false, error: null as string | null },
  )

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      {state.success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400">
          Password updated successfully
        </div>
      )}
      {state.error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          Current Password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <Button type="submit" disabled={pending} variant="outline">
        {pending ? "Updating..." : "Update Password"}
      </Button>
    </form>
  )
}
