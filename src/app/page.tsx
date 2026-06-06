import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  FileText,
  Receipt,
  Clock,
  Wallet,
  Users,
  LayoutDashboard,
  Briefcase,
  CheckCircle,
  Zap,
  Shield,
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Client Management",
    desc: "Keep every client relationship organized. Contact info, project history, invoices — all in one place.",
  },
  {
    icon: FileText,
    title: "Proposals",
    desc: "Send professional proposals that get results. Track when clients view them and follow up at the right time.",
  },
  {
    icon: Receipt,
    title: "Invoicing",
    desc: "Create invoices with line items, tax, and payment tracking. Know exactly who has paid and who hasn't.",
  },
  {
    icon: Briefcase,
    title: "Projects",
    desc: "Link clients, proposals, invoices, and time entries to projects. See the full picture of every engagement.",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    desc: "Start a timer, log hours, and track billable time against projects. No more guessing how long things took.",
  },
  {
    icon: Wallet,
    title: "Expenses",
    desc: "Log business expenses with categories and tax-deductible flags. Stay organized come tax season.",
  },
]

const steps = [
  {
    num: "01",
    title: "Add a Client",
    desc: "Import or create a client record. It takes 10 seconds.",
  },
  {
    num: "02",
    title: "Send a Proposal",
    desc: "Create a proposal, set your rate, and send it. Know the moment it's viewed.",
  },
  {
    num: "03",
    title: "Track & Invoice",
    desc: "Log time, track expenses, and invoice your client when the work is done. Get paid faster.",
  },
]

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-heading text-xl font-bold tracking-tight">
            Kredo
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,#faf8f5_0%,#f0ece7_50%,#e8e0d8_100%)] dark:bg-[linear-gradient(to_bottom,#121110_0%,#1a1816_50%,#0f0e17_100%)]" />
        <div className="absolute left-1/2 top-1/3 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-background/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Built for independent professionals
          </div>
          <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            The operating system
            <br />
            <span className="text-primary">for your freelance business</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Proposals, invoices, time tracking, expenses, and client management — all in one
            place. Kredo helps you run your business like a CEO, not a contractor.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-all hover:bg-muted"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to run your business
            </h2>
            <p className="mt-4 text-muted-foreground">
              Stop juggling spreadsheets, notes apps, and sticky notes. Kredo brings every
              part of your freelance workflow into one beautiful place.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/40 bg-card py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three simple steps to go from lead to paid. No fluff, no complexity.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-bold text-primary">
                  {s.num}
                </div>
                <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to take control of your freelance business?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join independent professionals who use Kredo to manage their business with
            clarity and confidence.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Kredo. All rights reserved.</span>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Link href="/register" className="transition-colors hover:text-foreground">
              Sign up
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
