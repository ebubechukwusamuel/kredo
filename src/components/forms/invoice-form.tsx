"use client"

import { useState, useActionState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createInvoice } from "@/app/actions/invoice"
import { Plus, Trash2 } from "lucide-react"

interface LineItem {
  id: string
  description: string
  quantity: string
  rate: string
}

export function InvoiceForm({
  clients,
  initialClientId,
  requestId,
}: {
  clients: { id: string; name: string; company: string | null }[]
  initialClientId?: string
  requestId?: string
}) {
  const router = useRouter()
  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => createInvoice(formData),
    undefined,
  )

  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: "1", rate: "" },
  ])

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), description: "", quantity: "1", rate: "" },
    ])
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function updateItem(
    id: string,
    field: keyof LineItem,
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    )
  }

  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0
    const rate = parseFloat(item.rate) || 0
    return sum + qty * rate
  }, 0)

  return (
    <form action={formAction} className="space-y-6">
      {requestId && <input type="hidden" name="requestId" value={requestId} />}

      <div className="space-y-2">
        <label htmlFor="clientId" className="text-sm font-medium">
          Client <span className="text-destructive">*</span>
        </label>
          <select
            id="clientId"
            name="clientId"
            required
            defaultValue={initialClientId || ""}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
          <option value="">Select a client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.company ? ` — ${c.company}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Line Items <span className="text-destructive">*</span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Item
          </Button>
        </div>

        <div className="rounded-lg border">
          <div className="hidden grid-cols-12 gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground md:grid">
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1" />
          </div>

          {items.map((item, i) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 border-b p-3 last:border-b-0"
            >
              <div className="col-span-12 md:col-span-5">
                <input
                  name="description"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, "description", e.target.value)
                  }
                  placeholder="Service description"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <input
                  name="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, "quantity", e.target.value)
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors text-right focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <input
                  name="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.rate}
                  onChange={(e) =>
                    updateItem(item.id, "rate", e.target.value)
                  }
                  placeholder="0.00"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors text-right focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="col-span-2 flex items-center justify-end text-sm font-medium">
                ${(parseFloat(item.quantity || "0") * parseFloat(item.rate || "0")).toFixed(2)}
              </div>
              <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-end border-t px-3 py-2">
            <div className="w-48 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Tax (%)</span>
                <input
                  name="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue="0"
                  className="w-20 flex h-7 rounded-md border border-input bg-background px-2 text-right text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="dueDate" className="text-sm font-medium">
            Due Date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="currency" className="text-sm font-medium">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="NGN">NGN — Nigerian Naira</option>
            <option value="CAD">CAD — Canadian Dollar</option>
            <option value="AUD">AUD — Australian Dollar</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Payment instructions, thank you message, etc."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="terms" className="text-sm font-medium">
          Terms & Conditions
        </label>
        <textarea
          id="terms"
          name="terms"
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Payment due within 30 days"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create Invoice"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
