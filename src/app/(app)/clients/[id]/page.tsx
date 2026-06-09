import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ClientForm } from "@/components/forms/client-form"
import { deleteClient } from "@/app/actions/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Receipt, Users } from "lucide-react"

export default async function ClientDetailPage(
  props: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await props.params

  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!client) notFound()

  const [proposalCount, invoiceCount] = await Promise.all([
    prisma.proposal.count({ where: { clientId: id } }),
    prisma.invoice.count({ where: { clientId: id } }),
  ])

  return (
    <div className="page-shell page-stack max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="page-kicker">
            <Users className="h-3.5 w-3.5 text-orange-300" />
            Client Profile
          </div>
          <h1 className="page-title mt-3">
            {client.name}
          </h1>
          <p className="page-description">
            {client.company || client.email || "Client details"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="metric-card">
          <div className="flex items-center gap-2 text-sm text-white/55">
            <FileText className="h-4 w-4 text-orange-300" />
            Proposals
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{proposalCount}</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-2 text-sm text-white/55">
            <Receipt className="h-4 w-4 text-orange-300" />
            Invoices
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{invoiceCount}</p>
        </div>
      </div>

      <div className="form-card">
        <h2 className="mb-5 text-lg font-semibold text-white">Edit Client</h2>
        <ClientForm
          client={{
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            website: client.website,
            address: client.address,
            notes: client.notes,
          }}
        />
      </div>

      <form action={deleteClient.bind(null, client.id)} className="pt-2">
        <Button variant="destructive" type="submit">
          Delete Client
        </Button>
      </form>
    </div>
  )
}
