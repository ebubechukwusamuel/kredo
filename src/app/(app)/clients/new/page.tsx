import { ClientForm } from "@/components/forms/client-form"

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Client</h1>
        <p className="text-sm text-muted-foreground">
          Add a new client to your roster
        </p>
      </div>
      <ClientForm />
    </div>
  )
}
