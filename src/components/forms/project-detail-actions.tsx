"use client"

import { useState, useActionState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { updateProject, deleteProject } from "@/app/actions/project"
import { Edit3 } from "lucide-react"

export function ProjectDetailActions({
  projectId,
  status,
  clients,
  defaults,
}: {
  projectId: string
  status: string
  clients: { id: string; name: string; company: string | null }[]
  defaults: {
    name: string
    description: string | null
    budget: number | null
    rate: number | null
    startDate: Date | null
    deadline: Date | null
    notes: string | null
  }
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      await updateProject(projectId, formData)
      setEditing(false)
    },
    undefined,
  )

  if (editing) {
    return (
      <form action={formAction} className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Edit Project</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
          <input
            id="edit-name"
            name="name"
            defaultValue={defaults.name}
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="edit-status" className="text-sm font-medium">Status</label>
            <select
              id="edit-status"
              name="status"
              defaultValue={status}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-budget" className="text-sm font-medium">Budget ($)</label>
            <input
              id="edit-budget"
              name="budget"
              type="number"
              step="0.01"
              defaultValue={defaults.budget ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="edit-rate" className="text-sm font-medium">Rate ($/hr)</label>
            <input
              id="edit-rate"
              name="rate"
              type="number"
              step="0.01"
              defaultValue={defaults.rate ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-deadline" className="text-sm font-medium">Deadline</label>
            <input
              id="edit-deadline"
              name="deadline"
              type="date"
              defaultValue={
                defaults.deadline
                  ? new Date(defaults.deadline).toISOString().split("T")[0]
                  : ""
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={pending} size="sm">
            {pending ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              if (confirm("Delete this project?")) {
                await deleteProject(projectId)
              }
            }}
            className="text-destructive"
          >
            Delete
          </Button>
        </div>
      </form>
    )
  }

  return (
    <Button variant="outline" onClick={() => setEditing(true)}>
      <Edit3 className="mr-2 h-4 w-4" />
      Edit Project
    </Button>
  )
}
