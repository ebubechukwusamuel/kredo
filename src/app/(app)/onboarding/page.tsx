"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { completeOnboarding } from "@/app/actions/onboarding"
import { Flame } from "lucide-react"

export default function OnboardingPage() {
  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => completeOnboarding(formData),
    undefined,
  )

  return (
    <div className="page-shell max-w-2xl py-8">
      <div className="app-surface overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 bg-gradient-to-br from-red-500/12 to-orange-500/5 p-6 text-center sm:p-8">
          <div className="brand-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-[0_18px_45px_rgba(239,68,68,0.28)]">
            <Flame className="h-6 w-6 fill-white/15 text-white" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white">
            Welcome to Kredo
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/58">
            Set up your business defaults once. You can update them anytime from settings.
          </p>
        </div>

      <form action={formAction} className="space-y-5 p-6 sm:p-8">
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

        <div className="grid gap-4 sm:grid-cols-2">
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

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Setting up..." : "Get Started"}
        </Button>
      </form>
      </div>
    </div>
  )
}
