import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Inbox, ArrowRight, Mail, Clock } from "lucide-react"

const statusConfig: Record<string, { label: string; dot: string; className: string }> = {
  PENDING:      { label: "New",          dot: "bg-amber-400 animate-pulse", className: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  REVIEWED:     { label: "Reviewed",     dot: "bg-blue-400",    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  INVOICE_SENT: { label: "Invoice Sent", dot: "bg-violet-400",  className: "bg-violet-500/10 text-violet-400 border border-violet-500/20" },
  DEPOSIT_PAID: { label: "Deposit Paid", dot: "bg-emerald-400", className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  IN_PROGRESS:  { label: "In Progress",  dot: "bg-cyan-400",    className: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" },
  DELIVERED:    { label: "Delivered",    dot: "bg-indigo-400",  className: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" },
  COMPLETED:    { label: "Completed",    dot: "bg-white/30",    className: "bg-white/5 text-white/40 border border-white/10" },
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
}

export default async function RequestsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const requests = await prisma.projectRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const pendingCount = requests.filter((r) => r.status === "PENDING").length
  const inProgressCount = requests.filter((r) => r.status === "IN_PROGRESS").length

  return (
    <div className="relative mx-auto max-w-5xl space-y-8 pb-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-[30%] h-[300px] w-[300px] rounded-full bg-amber-600/6 blur-[100px]" />
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Inbox className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/25">Inbox</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">Requests</h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {pendingCount} new
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-white/45">Project requests from your clients.</p>
        </div>
      </div>

      {/* Stats */}
      {requests.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: requests.length, color: "text-white" },
            { label: "Pending Review", value: pendingCount, color: "text-amber-400" },
            { label: "In Progress", value: inProgressCount, color: "text-cyan-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-24 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <Inbox className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-white">No requests yet</h2>
          <p className="mt-2 max-w-sm text-sm text-white/45">
            Share your public link with potential clients. When they fill out the project form,
            their request will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm">
          <div className="border-b border-white/[0.06] px-6 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">
              {requests.length} Request{requests.length !== 1 ? "s" : ""}
            </span>
          </div>

          {requests.map((r, i) => {
            const s = statusConfig[r.status] || statusConfig.PENDING
            return (
              <Link
                key={r.id}
                href={`/requests/${r.id}`}
                className={`group flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.04] ${
                  i < requests.length - 1 ? "border-b border-white/[0.06]" : ""
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <Inbox className="h-4.5 w-4.5 text-amber-400/70" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{r.projectName}</p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {r.clientEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(r.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${s.className}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-white/60" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
