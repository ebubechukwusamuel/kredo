"use client"

import { deleteExpense } from "@/app/actions/expense"
import { Trash2 } from "lucide-react"

export function DeleteExpenseButton({ id }: { id: string }) {
  return (
    <button
      onClick={async () => {
        if (confirm("Delete this expense?")) {
          await deleteExpense(id)
        }
      }}
      className="text-muted-foreground hover:text-destructive transition-colors"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
