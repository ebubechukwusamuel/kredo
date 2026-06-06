import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Plus, Wallet, ArrowRight } from "lucide-react"

const categoryColors: Record<string, string> = {
  SOFTWARE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  EQUIPMENT: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  TRAVEL: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  FOOD: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  OFFICE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  SERVICES: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  EDUCATION: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  OTHER: "bg-muted text-muted-foreground",
}

export default async function ExpensesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [expenses, totals] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    }),
    prisma.expense.aggregate({
      where: { userId: session.user.id },
      _sum: { amount: true },
    }),
    prisma.expense.count({
      where: { userId: session.user.id, taxDeductible: true },
    }),
    prisma.expense.aggregate({
      where: { userId: session.user.id, taxDeductible: true },
      _sum: { amount: true },
    }),
  ])

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track business expenses and stay organized for tax season.
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New expense
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-heading text-xl font-semibold">No expenses yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Track your business expenses so you never miss a write-off. Categorize them and
            mark which ones are tax deductible.
          </p>
          <Link
            href="/expenses/new"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Add your first expense
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {expenses.map((e, i) => (
            <div
              key={e.id}
              className={`flex items-center justify-between px-5 py-4 ${
                i < expenses.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{e.description}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        categoryColors[e.category] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {e.category.charAt(0) + e.category.slice(1).toLowerCase()}
                    </span>
                    {e.taxDeductible && (
                      <span className="text-emerald-600 dark:text-emerald-400">Tax deductible</span>
                    )}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold">
                ${e.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
