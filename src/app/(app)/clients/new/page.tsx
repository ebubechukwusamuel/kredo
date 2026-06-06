import { ClientForm } from "@/components/forms/client-form"

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">New Client</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new client to your roster
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <ClientForm />
      </div>
    </div>
  )
}
