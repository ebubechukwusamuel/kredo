"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { completeOnboarding } from "@/app/actions/onboarding"

export default function OnboardingPage() {
  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => completeOnboarding(formData),
    undefined,
  )

  return (
    <div className="mx-auto max-w-lg space-y-8 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Kredo
        </h1>
        <p className="text-muted-foreground">
          Set up your profile to get started. You can change these anytime.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium">
            Company or Business Name
          </label>
          <input
            id="company"
            name="company"
            type="text"
            placeholder="e.g. Mazion"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Your Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Freelance Designer"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="currency" className="text-sm font-medium">
              Default Currency
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue="USD"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="NGN">NGN — Nigerian Naira</option>
              <option value="CAD">CAD — Canadian Dollar</option>
              <option value="AUD">AUD — Australian Dollar</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="rate" className="text-sm font-medium">
              Hourly Rate ($)
            </label>
            <input
              id="rate"
              name="rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Setting up..." : "Get Started"}
        </Button>
      </form>
    </div>
  )
}
