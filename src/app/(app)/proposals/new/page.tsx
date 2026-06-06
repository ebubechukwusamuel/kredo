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
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">New Proposal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a proposal for your client
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <ProposalForm clients={clients} />
      </div>
    </div>
  )
}