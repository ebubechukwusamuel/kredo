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
      <div className="flex h-screen overflow-hidden bg-[#09090B]">
        <div className="no-print">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <div className="no-print">
            <Header />
          </div>
          <main className="flex-1 overflow-auto">
            {/* Subtle ambient glow in content area */}
            <div className="relative min-h-full">
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse at 70% 0%, rgba(239,68,68,0.04) 0%, transparent 50%), radial-gradient(ellipse at 0% 80%, rgba(251,146,60,0.03) 0%, transparent 50%)",
                }}
              />
              <div className="p-8 animate-fade-in-up">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </Providers>
  )
}
