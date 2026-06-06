"use client"

import { useState, useEffect, useActionState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { startTimer, stopTimer, createTimeEntry } from "@/app/actions/time-entry"
import { Play, Square, Plus } from "lucide-react"

export function Timer({
  activeTimers,
  projects,
}: {
  activeTimers: { id: string; description: string | null; startedAt: Date | null }[]
  projects: { id: string; name: string }[]
}) {
  const [showManual, setShowManual] = useState(false)

  return (
    <div className="space-y-4">
      {activeTimers.map((timer) => (
        <ActiveTimer key={timer.id} timer={timer} />
      ))}

      {activeTimers.length === 0 && (
        <div className="rounded-lg border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium mb-3">Start Timer</h3>
              <TimerForm projects={projects} />
            </div>
            <div className="sm:border-l sm:pl-4">
              <h3 className="text-sm font-medium mb-3">
                <button
                  type="button"
                  onClick={() => setShowManual(!showManual)}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Plus className="h-3 w-3" />
                  {showManual ? "Hide" : "Manual Entry"}
                </button>
              </h3>
              {showManual && <ManualEntryForm projects={projects} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActiveTimer({
  timer,
}: {
  timer: { id: string; description: string | null }
}) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    startRef.current = Date.now()
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = Math.floor(elapsed / 3600)
  const minutes = Math.floor((elapsed % 3600) / 60)
  const seconds = elapsed % 60

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{timer.description}</p>
          <p className="text-2xl font-mono font-semibold tabular-nums mt-1">
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>
        </div>
        <form
          action={async () => {
            await stopTimer(timer.id)
          }}
        >
          <Button type="submit" variant="destructive" size="icon">
            <Square className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

function TimerForm({
  projects,
}: {
  projects: { id: string; name: string }[]
}) {
  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => startTimer(formData),
    undefined,
  )

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input
        name="description"
        placeholder="What are you working on?"
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <Button type="submit" size="sm" disabled={pending}>
        <Play className="mr-1 h-3 w-3" />
        Start Timer
      </Button>
    </form>
  )
}

function ManualEntryForm({
  projects,
}: {
  projects: { id: string; name: string }[]
}) {
  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => createTimeEntry(formData),
    undefined,
  )

  const today = new Date().toISOString().split("T")[0]

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input
        name="description"
        placeholder="What did you work on?"
        required
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          name="hours"
          type="number"
          min="0"
          step="0.5"
          placeholder="Hours"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <input
          name="minutes"
          type="number"
          min="0"
          max="59"
          step="5"
          placeholder="Minutes"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          name="date"
          type="date"
          defaultValue={today}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <input
          name="rate"
          type="number"
          step="0.01"
          placeholder="Rate ($/hr)"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        Add Entry
      </Button>
    </form>
  )
}
