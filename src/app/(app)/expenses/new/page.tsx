import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ExpenseForm } from "@/components/forms/expense-form"

export default async function NewExpensePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Expense</h1>
        <p className="text-sm text-muted-foreground">
          Log a new business expense
        </p>
      </div>
      <ExpenseForm />
    </div>
  )
}
