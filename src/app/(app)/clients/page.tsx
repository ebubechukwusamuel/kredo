import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function ClientsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your client relationships
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Link>
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-sm text-muted-foreground">No clients yet</p>
          <Button asChild className="mt-4">
            <Link href="/clients/new">Add your first client</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center justify-between border-b px-4 py-3 transition-colors hover:bg-muted/50 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium">{client.name}</p>
                {client.email && (
                  <p className="text-xs text-muted-foreground">
                    {client.email}
                  </p>
                )}
              </div>
              {client.company && (
                <span className="text-xs text-muted-foreground">
                  {client.company}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
