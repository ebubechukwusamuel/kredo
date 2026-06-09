import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProjectForm } from "@/components/forms/project-form"
import { Briefcase } from "lucide-react"

export default async function NewProjectPage() {
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
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
              <Briefcase className="h-3.5 w-3.5 text-orange-300" />
            </span>
            Workspace
          </div>
          <h1 className="page-title mt-3">New Project</h1>
          <p className="page-description">
            Set up the budget, dates, and client context before work begins.
          </p>
        </div>
      </div>
      <div className="form-card">
        <ProjectForm clients={clients} />
      </div>
    </div>
  )
}
