"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createProject } from "@/app/actions/project"

export function ProjectForm({
  clients,
  defaults,
}: {
  clients: { id: string; name: string; company: string | null }[]
  defaults?: {
    clientId?: string
    name?: string
    description?: string | null
    budget?: number | null
    rate?: number | null
    startDate?: Date | null
    deadline?: Date | null
    notes?: string | null
  }
}) {
  const router = useRouter()
  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => createProject(formData),
    undefined,
  )

  const today = new Date().toISOString().split("T")[0]

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <label htmlFor="clientId" className="text-sm font-medium">
          Client <span className="text-destructive">*</span>
        </label>
        <select
          id="clientId"
          name="clientId"
          required
          defaultValue={defaults?.clientId ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select a client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.company ? ` — ${c.company}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Project Name <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaults?.name ?? ""}
          placeholder="Website Redesign"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ""}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Scope of work, deliverables, etc."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="budget" className="text-sm font-medium">
            Budget ($)
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaults?.budget ?? ""}
            placeholder="0.00"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
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
            defaultValue={defaults?.rate ?? ""}
            placeholder="0.00"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="startDate" className="text-sm font-medium">
            Start Date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={
              defaults?.startDate
                ? new Date(defaults.startDate).toISOString().split("T")[0]
                : today
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="deadline" className="text-sm font-medium">
            Deadline
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={
              defaults?.deadline
                ? new Date(defaults.deadline).toISOString().split("T")[0]
                : ""
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={defaults?.notes ?? ""}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create Project"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
