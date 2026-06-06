import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProposalForm } from "@/components/forms/proposal-form"

export default async function NewProposalPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Proposal</h1>
        <p className="text-sm text-muted-foreground">
          Create a proposal for your client
        </p>
      </div>
      <ProposalForm clients={clients} />
    </div>
  )
}
