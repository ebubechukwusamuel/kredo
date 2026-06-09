import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProposalForm } from "@/components/forms/proposal-form"
import { FileText } from "lucide-react"

export default async function NewProposalPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true },
  })

  return (
    <div className="page-shell max-w-3xl page-stack">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
              <FileText className="h-3.5 w-3.5 text-orange-300" />
            </span>
            Sales
          </div>
          <h1 className="page-title mt-3">New Proposal</h1>
          <p className="page-description">
            Build a clear offer with scope, price, and terms your client can act on.
          </p>
        </div>
      </div>
      <div className="form-card">
        <ProposalForm clients={clients} />
      </div>
    </div>
  )
}
