"use client"

import { deleteTimeEntry } from "@/app/actions/time-entry"
import { Trash2 } from "lucide-react"

interface Entry {
  id: string
  description: string | null
  duration: number
  billable: boolean
  date: Date
  endedAt: Date | null
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function TimeEntryList({
  grouped,
  sortedDays,
  totalSeconds,
}: {
  grouped: Record<string, Entry[]>
  sortedDays: string[]
  totalSeconds: number
}) {
  if (sortedDays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-sm text-muted-foreground">No time entries yet</p>
      </div>
    )
  }

  const totalHours = (totalSeconds / 3600).toFixed(1)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Time Log</h2>
        <p className="text-sm text-muted-foreground">
          {totalHours}h total
        </p>
      </div>

      {sortedDays.map((day) => {
        const entries = grouped[day]
        const daySeconds = entries
          .filter((e) => e.endedAt)
          .reduce((sum, e) => sum + e.duration, 0)

        return (
          <div key={day} className="rounded-lg border">
            <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {new Date(day + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {formatDuration(daySeconds)}
              </p>
            </div>
            <div className="divide-y">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {entry.description || "Untitled"}
                      </p>
                      {!entry.billable && (
                        <span className="text-xs text-muted-foreground">
                          Non-billable
                        </span>
                      )}
                    </div>
                    {!entry.endedAt && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        In progress...
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {entry.endedAt && (
                      <span className="text-sm tabular-nums">
                        {formatDuration(entry.duration)}
                      </span>
                    )}
                    <form
                      action={async () => {
                        await deleteTimeEntry(entry.id)
                      }}
                    >
                      <button
                        type="submit"
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
