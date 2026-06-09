import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"

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
      className="h-full antialiased"
    >
      <body className="min-h-full font-sans">
        {children}
        <script dangerouslySetInnerHTML={{ __html: `window.__KREDO_PROJECT__="kredo"` }} />
        <Script src="/tracker.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
