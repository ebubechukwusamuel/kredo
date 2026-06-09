import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { PublicIntakeForm } from "@/components/forms/public-intake-form"

export default async function PublicPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const user = await prisma.user.findUnique({ where: { slug } })
  if (!user) notFound()

  const brandColor = user.brandColor || "#e85d3a"

  return (
    <div
      className="flex min-h-screen flex-col"
      style={
        {
          "--brand": brandColor,
        } as React.CSSProperties
      }
    >
      <header className="flex h-16 items-center border-b border-border bg-background/80 px-6 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center">
          {user.logoUrl ? (
            <img src={user.logoUrl} alt="" className="h-8" />
          ) : (
            <span
              className="font-heading text-lg font-bold"
              style={{ color: brandColor }}
            >
              {user.brandName || user.name || "Kredo"}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Work with {user.brandName || user.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Tell us about your project and we&apos;ll get back to you with a proposal.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <PublicIntakeForm slug={slug} brandColor={brandColor} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        Powered by Kredo
      </footer>
    </div>
  )
}
