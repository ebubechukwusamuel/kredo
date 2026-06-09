"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitProjectRequest } from "@/app/actions/requests"
import { CheckCircle } from "lucide-react"

export function PublicIntakeForm({
  slug,
  brandColor,
}: {
  slug: string
  brandColor: string
}) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await submitProjectRequest(slug, formData)
      if (result.success) setSubmitted(true)
    } catch (err) {
      console.error("[INTAKE FORM]", err)
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: brandColor + "20" }}>
          <CheckCircle className="h-7 w-7" style={{ color: brandColor }} />
        </div>
        <h2 className="font-heading text-xl font-semibold">Request sent!</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your project details have been sent. We'll review them and get back to you with a
          proposal shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="clientName" className="text-sm font-medium">
            Your name *
          </label>
          <input
            id="clientName"
            name="clientName"
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
            placeholder="Jane Smith"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="clientEmail" className="text-sm font-medium">
            Your email *
          </label>
          <input
            id="clientEmail"
            name="clientEmail"
            type="email"
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
            placeholder="jane@example.com"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="clientPhone" className="text-sm font-medium">
            Phone number *
          </label>
          <input
            id="clientPhone"
            name="clientPhone"
            type="tel"
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
            placeholder="+1 234 567 8900"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium">
            Company / Organisation
          </label>
          <input
            id="company"
            name="company"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
            placeholder="Acme Inc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="projectName" className="text-sm font-medium">
          Project name *
        </label>
        <input
          id="projectName"
          name="projectName"
          required
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          placeholder="e.g. Website redesign"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Project description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          placeholder="Describe the project in detail — what is it, who is it for, what problem does it solve..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="features" className="text-sm font-medium">
          Specific features / requirements
        </label>
        <textarea
          id="features"
          name="features"
          rows={3}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          placeholder="List any specific features, pages, integrations, or functionality you need..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="referenceUrls" className="text-sm font-medium">
          Reference websites / examples
        </label>
        <textarea
          id="referenceUrls"
          name="referenceUrls"
          rows={2}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          placeholder="Links to websites or designs you like — one per line"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="timeline" className="text-sm font-medium">
          Desired timeline
        </label>
        <input
          id="timeline"
          name="timeline"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          placeholder="e.g. Within 2 weeks, ASAP, By end of month"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg px-6 text-sm font-medium text-white transition-all disabled:opacity-50"
        style={{ backgroundColor: brandColor }}
      >
        {loading ? "Sending..." : "Send request"}
      </button>
    </form>
  )
}
