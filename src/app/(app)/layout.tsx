import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Providers } from "@/components/providers"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <Providers>
      <div className="flex h-dvh overflow-hidden bg-transparent">
        <div className="no-print hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <div className="no-print">
            <Header />
          </div>
          <main className="flex-1 overflow-auto">
            <div className="relative min-h-full">
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse at 70% 0%, rgba(239,68,68,0.08) 0%, transparent 48%), radial-gradient(ellipse at 0% 80%, rgba(249,115,22,0.06) 0%, transparent 48%)",
                }}
              />
              <div className="px-4 py-6 animate-fade-in-up sm:px-6 lg:px-8 lg:py-8">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </Providers>
  )
}
