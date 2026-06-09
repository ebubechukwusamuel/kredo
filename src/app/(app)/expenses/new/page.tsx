import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ExpenseForm } from "@/components/forms/expense-form"
import { Wallet } from "lucide-react"

export default async function NewExpensePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="page-shell max-w-3xl page-stack">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
              <Wallet className="h-3.5 w-3.5 text-orange-300" />
            </span>
            Finance
          </div>
          <h1 className="page-title mt-3">Add Expense</h1>
          <p className="page-description">
            Log purchases while the details are fresh, then mark deductible items for tax season.
          </p>
        </div>
      </div>
      <div className="form-card">
        <ExpenseForm />
      </div>
    </div>
  )
}
