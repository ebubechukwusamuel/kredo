import type { Metadata } from "next"
import { DM_Sans, Bricolage_Grotesque } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
})

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Kredo — The Freelancer OS",
  description:
    "All-in-one platform for freelancers. Proposals, invoices, time tracking, expenses, and client management.",
  openGraph: {
    title: "Kredo — The Freelancer OS",
    description:
      "All-in-one platform for freelancers. Proposals, invoices, time tracking, expenses, and client management.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${bricolageGrotesque.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  )
}
