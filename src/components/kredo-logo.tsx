import Link from "next/link"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

type KredoLogoProps = {
  href?: string
  tagline?: boolean
  className?: string
}

export function KredoLogo({
  href = "/dashboard",
  tagline = true,
  className,
}: KredoLogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-3", className)}>
      <span className="brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-[0_16px_40px_rgba(239,68,68,0.28)]">
        <Flame className="h-4 w-4 fill-white/15 text-white" />
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-lg font-bold tracking-tight text-white">
          Kredo
        </span>
        {tagline && (
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-200/45">
            Freelancer OS
          </span>
        )}
      </span>
    </Link>
  )
}
