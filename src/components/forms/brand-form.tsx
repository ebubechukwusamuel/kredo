"use client"

import { useActionState, useState, useRef } from "react"
import { updateBranding } from "@/app/actions/branding"
import { Button } from "@/components/ui/button"

export function BrandForm({
  user,
}: {
  user: {
    brandName: string | null
    brandColor: string
    logoUrl: string | null
    slug: string | null
    bankName: string | null
    bankAccountName: string | null
    bankAccountNumber: string | null
  }
}) {
  const [logoPreview, setLogoPreview] = useState(user.logoUrl || "")
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(user.logoUrl || "")
  const fileRef = useRef<HTMLInputElement>(null)
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      try {
        await updateBranding(formData)
        return { success: true, error: null }
      } catch (e) {
        return { success: false, error: (e as Error).message }
      }
    },
    { success: false, error: null as string | null },
  )

  const previewSlug = `kredo-gray.vercel.app/${user.slug || "your-link"}`

  return (
    <form action={formAction} className="space-y-6">
      {state.success && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          Saved successfully
        </div>
      )}
      {state.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-heading text-base font-semibold">Your Public Page</h3>
        <p className="text-sm text-muted-foreground">
          Share this link with potential clients so they can send you project details.
        </p>
        <div className="rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm">
          {previewSlug}
        </div>
        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">
            Custom link name
          </label>
          <div className="flex items-center gap-1 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
            <span>kredo-gray.vercel.app/</span>
            <input
              id="slug"
              name="slug"
              defaultValue={user.slug ?? ""}
              placeholder="your-name"
              className="flex h-9 flex-1 bg-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-heading text-base font-semibold">Brand</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Logo</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                id="logoUrl"
                name="logoUrl"
                value={logoUrl}
                onChange={(e) => { setLogoUrl(e.target.value); setLogoPreview(e.target.value) }}
                placeholder="https://example.com/logo.png"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploading(true)
                const form = new FormData()
                form.append("file", file)
                try {
                  const res = await fetch("/api/upload", { method: "POST", body: form })
                  const data = await res.json()
                  if (data.url) { setLogoUrl(data.url); setLogoPreview(data.url) }
                } catch { }
                setUploading(false)
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="shrink-0"
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
            {logoPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover"
                onError={() => setLogoPreview("")}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Paste a URL or upload an image (PNG, JPEG, SVG &mdash; max 2MB)
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="brandName" className="text-sm font-medium">
            Brand name
          </label>
          <input
            id="brandName"
            name="brandName"
            defaultValue={user.brandName ?? ""}
            placeholder="Your Studio Name"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="brandColor" className="text-sm font-medium">
            Brand color
          </label>
          <div className="flex items-center gap-3">
            <input
              id="brandColor"
              name="brandColor"
              type="color"
              defaultValue={user.brandColor}
              className="h-10 w-10 cursor-pointer rounded-lg border border-input bg-background p-1"
            />
            <span className="text-sm text-muted-foreground">{user.brandColor}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-heading text-base font-semibold">Bank Account</h3>
        <p className="text-sm text-muted-foreground">
          Your clients will see these details when they need to make a deposit.
        </p>
        <div className="space-y-2">
          <label htmlFor="bankName" className="text-sm font-medium">Bank name</label>
          <input
            id="bankName"
            name="bankName"
            defaultValue={user.bankName ?? ""}
            placeholder="e.g. Chase Bank"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="bankAccountName" className="text-sm font-medium">Account name</label>
          <input
            id="bankAccountName"
            name="bankAccountName"
            defaultValue={user.bankAccountName ?? ""}
            placeholder="John Doe"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="bankAccountNumber" className="text-sm font-medium">Account number</label>
          <input
            id="bankAccountNumber"
            name="bankAccountNumber"
            defaultValue={user.bankAccountNumber ?? ""}
            placeholder="1234567890"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  )
}
