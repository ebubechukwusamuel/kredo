import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ClientForm } from "@/components/forms/client-form"
import { deleteClient } from "@/app/actions/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {client.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {client.company || client.email || "Client details"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Proposals</p>
          <p className="text-2xl font-semibold">{proposalCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Invoices</p>
          <p className="text-2xl font-semibold">{invoiceCount}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Edit Client</h2>
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

      <form action={deleteClient.bind(null, client.id)}>
        <Button variant="destructive" type="submit">
          Delete Client
        </Button>
      </form>
    </div>
  )
}
