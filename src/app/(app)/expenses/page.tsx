import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { DeleteExpenseButton } from "@/components/forms/expense-actions"
import { Plus } from "lucide-react"

const categoryColors: Record<string, string> = {
  SOFTWARE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  OFFICE: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  TRAVEL: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  FOOD: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  EQUIPMENT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  SERVICES: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  EDUCATION: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  OTHER: "bg-muted text-muted-foreground",
}

export default async function ExpensesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  })

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const taxDeductible = expenses
    .filter((e) => e.taxDeductible)
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Track your business expenses
          </p>
        </div>
        <Button asChild>
          <Link href="/expenses/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Expenses
          </p>
          <p className="mt-1 text-2xl font-semibold">${total.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tax Deductible
          </p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            ${taxDeductible.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Count
          </p>
          <p className="mt-1 text-2xl font-semibold">{expenses.length}</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-sm text-muted-foreground">No expenses yet</p>
          <Button asChild className="mt-4">
            <Link href="/expenses/new">Add your first expense</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      categoryColors[expense.category] || categoryColors.OTHER
                    }`}
                  >
                    {expense.category}
                  </span>
                  {expense.taxDeductible && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Tax deductible
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium">{expense.description}</p>
                <p className="text-xs text-muted-foreground">
                  {expense.date.toLocaleDateString()}
                  {expense.notes ? ` — ${expense.notes}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  ${expense.amount.toFixed(2)}
                </span>
                <DeleteExpenseButton id={expense.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
