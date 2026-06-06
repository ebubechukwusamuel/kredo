import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Timer } from "@/components/forms/timer"
import { TimeEntryList } from "@/components/forms/time-entry-list"
import { Clock } from "lucide-react"
import Link from "next/link"

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default async function TimePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const entries = await prisma.timeEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  })

  const activeTimers = entries.filter((e) => !e.endedAt)

  const totalSeconds = entries
    .filter((e) => e.endedAt)
    .reduce((sum, e) => sum + e.duration, 0)

  const grouped = entries.reduce(
    (acc, entry) => {
      const key = entry.date.toISOString().split("T")[0]
      if (!acc[key]) acc[key] = []
      acc[key].push(entry)
      return acc
    },
    {} as Record<string, typeof entries>,
  )

  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Time Tracking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track billable hours with the timer or log time manually.
        </p>
      </div>

      <Timer activeTimers={activeTimers} projects={projects} />

      <TimeEntryList
        grouped={grouped}
        sortedDays={sortedDays}
        formatDuration={formatDuration}
        totalSeconds={totalSeconds}
      />
    </div>
  )
}
