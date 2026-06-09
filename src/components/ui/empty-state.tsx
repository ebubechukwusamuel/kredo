import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel: string
  actionHref: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="app-panel-soft flex flex-col items-center justify-center rounded-2xl border-dashed px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 shadow-[0_16px_40px_rgba(239,68,68,0.12)]">
        <Icon className="h-6 w-6 text-red-400" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-white/55">{description}</p>
      <Link
        href={actionHref}
        className="primary-action mt-6"
      >
        {actionLabel}
      </Link>
    </div>
  )
}
