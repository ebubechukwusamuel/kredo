import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Plus, Users, Mail, Building2, ArrowRight, Search } from "lucide-react"

export default async function ClientsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { projects: true, invoices: true } },
    },
  })

  return (
    <div className="relative mx-auto max-w-5xl space-y-8 pb-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] right-[5%] h-[350px] w-[350px] rounded-full bg-blue-600/8 blur-[100px]" />
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Users className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/25">Directory</span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white">Clients</h1>
          <p className="mt-1 text-sm text-white/45">The people and businesses you work with.</p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-b from-red-500 to-red-600 px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.45)] hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-24 text-center backdrop-blur-sm">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-white">No clients yet</h2>
          <p className="mt-2 max-w-sm text-sm text-white/45">
            Clients are the foundation of your business. Add your first client to start sending proposals,
            tracking projects, and creating invoices.
          </p>
          <Link
            href="/clients/new"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-red-500 to-red-600 px-6 text-sm font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.45)]"
          >
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.05] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
            >
              {/* Card glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/60" />
              </div>

              <div className="relative mt-4">
                <h3 className="font-heading text-base font-semibold text-white transition-colors group-hover:text-blue-300">
                  {client.name}
                </h3>
                {client.company && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
                    <Building2 className="h-3 w-3" />
                    {client.company}
                  </p>
                )}
                {client.email && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/40">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </p>
                )}
              </div>

              {/* Meta counts */}
              <div className="relative mt-4 flex gap-4 border-t border-white/[0.06] pt-4">
                <span className="text-xs text-white/30">
                  <span className="font-semibold text-white/60">{client._count.projects}</span> projects
                </span>
                <span className="text-xs text-white/30">
                  <span className="font-semibold text-white/60">{client._count.invoices}</span> invoices
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
