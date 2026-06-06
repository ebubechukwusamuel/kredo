"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createExpense } from "@/app/actions/expense"

const categories = [
  "SOFTWARE",
  "OFFICE",
  "TRAVEL",
  "FOOD",
  "EQUIPMENT",
  "SERVICES",
  "EDUCATION",
  "OTHER",
]

export function ExpenseForm() {
  const router = useRouter()
  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => createExpense(formData),
    undefined,
  )

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          Category <span className="text-destructive">*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-destructive">*</span>
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Adobe Creative Cloud Subscription"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Amount ($) <span className="text-destructive">*</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <input
          id="notes"
          name="notes"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Annual subscription, renewed monthly"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="taxDeductible"
          name="taxDeductible"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="taxDeductible" className="text-sm font-medium">
          Tax deductible
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add Expense"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
