import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ExpenseForm } from "@/components/forms/expense-form"

export default async function NewExpensePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Add Expense</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log a new business expense
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <ExpenseForm />
      </div>
    </div>
  )
}
