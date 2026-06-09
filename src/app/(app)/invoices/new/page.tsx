import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { InvoiceForm } from "@/components/forms/invoice-form"
import { Receipt } from "lucide-react"

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
    <div className="page-shell max-w-4xl page-stack">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
              <Receipt className="h-3.5 w-3.5 text-orange-300" />
            </span>
            Billing
          </div>
          <h1 className="page-title mt-3">New Invoice</h1>
          <p className="page-description">
            Add line items, payment terms, and client details in one clean flow.
          </p>
        </div>
      </div>
      <div className="form-card">
        <InvoiceForm
          clients={clients}
          initialClientId={searchParams?.clientId}
          requestId={searchParams?.requestId}
        />
      </div>
    </div>
  )
}
