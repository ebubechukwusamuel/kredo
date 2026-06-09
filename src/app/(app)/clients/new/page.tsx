import { ClientForm } from "@/components/forms/client-form"
import { Users } from "lucide-react"

export default function NewClientPage() {
  return (
    <div className="page-shell max-w-3xl page-stack">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
              <Users className="h-3.5 w-3.5 text-orange-300" />
            </span>
            Client Directory
          </div>
          <h1 className="page-title mt-3">New Client</h1>
          <p className="page-description">
            Capture the client details you will reuse across proposals, projects, and invoices.
          </p>
        </div>
      </div>
      <div className="form-card">
        <ClientForm />
      </div>
    </div>
  )
}
