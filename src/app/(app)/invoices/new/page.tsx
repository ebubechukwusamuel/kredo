import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { InvoiceForm } from "@/components/forms/invoice-form"

export default async function NewInvoicePage(props: {
  searchParams?: Promise<{ clientId?: string; requestId?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const searchParams = await props.searchParams

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true },
  })

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">New Invoice</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create an invoice with line items
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <InvoiceForm
          clients={clients}
          initialClientId={searchParams?.clientId}
          requestId={searchParams?.requestId}
        />
      </div>
    </div>
  )
}
