import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Timer } from "@/components/forms/timer"
import { TimeEntryList } from "@/components/forms/time-entry-list"
import { Clock, TrendingUp, DollarSign, Activity } from "lucide-react"

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

  const completedEntries = entries.filter((e) => e.endedAt)
  const totalSeconds = completedEntries.reduce((sum, e) => sum + e.duration, 0)
  const billableSeconds = completedEntries
    .filter((e) => e.billable)
    .reduce((sum, e) => sum + e.duration, 0)

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todaySeconds = completedEntries
    .filter((e) => new Date(e.date) >= todayStart)
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
    <div className="relative mx-auto max-w-5xl space-y-8 pb-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[5%] left-[20%] h-[320px] w-[320px] rounded-full bg-red-600/8 blur-[100px]" />
        <div className="absolute top-[40%] right-[5%] h-[200px] w-[200px] rounded-full bg-orange-500/5 blur-[80px]" />
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
              <Clock className="h-3.5 w-3.5 text-red-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/25">Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">Time Tracking</h1>
            {activeTimers.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-xs font-bold text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                {activeTimers.length} active
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-white/45">
            Track billable hours with the live timer or log time manually.
          </p>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-red-500/15 bg-red-500/5 px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-red-400" />
            <p className="text-xs font-semibold text-red-400/70 uppercase tracking-wider">Today</p>
          </div>
          <p className="text-2xl font-bold text-red-400 font-mono">
            {todaySeconds > 0 ? formatDuration(todaySeconds) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-orange-500/15 bg-orange-500/5 px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-orange-400" />
            <p className="text-xs font-semibold text-orange-400/70 uppercase tracking-wider">Billable</p>
          </div>
          <p className="text-2xl font-bold text-orange-400 font-mono">
            {billableSeconds > 0 ? formatDuration(billableSeconds) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-white/40" />
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">All Time</p>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {totalSeconds > 0 ? formatDuration(totalSeconds) : "—"}
          </p>
        </div>
      </div>

      {/* Timer Widget */}
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
            <Clock className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-white">Live Timer</h2>
            <p className="text-xs text-white/40">Start a session for any project</p>
          </div>
        </div>
        <div className="p-6">
          <Timer activeTimers={activeTimers} projects={projects} />
        </div>
      </div>

      {/* Time Entry Log */}
      <div className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-white">Time Log</h2>
        <TimeEntryList
          grouped={grouped}
          sortedDays={sortedDays}
          totalSeconds={totalSeconds}
        />
      </div>
    </div>
  )
}
