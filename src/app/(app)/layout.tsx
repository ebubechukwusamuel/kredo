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
      <div className="flex h-screen">
        <div className="no-print">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="no-print">
            <Header />
          </div>
          <main className="flex-1 overflow-auto p-8">{children}</main>
        </div>
      </div>
    </Providers>
  )
}
