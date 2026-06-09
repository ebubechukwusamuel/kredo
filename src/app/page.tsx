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
  Briefcase,
  Play,
  Flame,
} from "lucide-react"
import { KredoLogo } from "@/components/kredo-logo"
import { ScrollReveal } from "@/components/scroll-reveal"
import "./landing.css"

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="kredo-landing">
      {/* Glow Effects */}
      <div className="glow-container">
        <div className="glow-red"></div>
        <div className="glow-orange"></div>
      </div>

      {/* Navbar */}
      <nav className="kredo-nav">
        <div className="kredo-nav-left">
          <KredoLogo href="/" tagline={false} className="kredo-nav-logo" />
          <div className="kredo-nav-links">
            <a href="#features" className="kredo-nav-link">
              Features
            </a>
            <a href="#workflow" className="kredo-nav-link">
              Workflow
            </a>
            <Link href="/login" className="kredo-nav-link">
              Pricing
            </Link>
          </div>
        </div>
        <div className="kredo-nav-right">
          <Link href="/login" className="btn-secondary">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Built for independent professionals
          </div>

          <h1 className="hero-title">
            The operating system <br />
            <span className="hero-title-highlight">for your freelance business</span>
          </h1>

          <p className="hero-subtitle">
            Proposals, invoices, time tracking, expenses, and client management - all in one place.
            Kredo helps you run your business like a CEO, not a contractor.
          </p>

          <div className="hero-actions">
            <Link href="/register" className="btn-primary-large">
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-secondary-large">
              Sign In
            </Link>
          </div>
        </div>

        {/* Hero Interactive Preview Dashboard */}
        <div className="hero-preview-wrapper">
          <div className="hero-preview-border">
            <div className="hero-preview-container">
              {/* Sidebar Mock */}
              <div className="preview-sidebar">
                <div className="preview-logo">
                  <div className="brand-gradient flex h-5 w-5 items-center justify-center rounded-md">
                    <Flame className="h-3 w-3 fill-white/15 text-white" />
                  </div>
                  <span>Kredo</span>
                </div>
                <div className="preview-nav-items">
                  <div className="preview-nav-item active"><Users className="h-4 w-4" /> Clients</div>
                  <div className="preview-nav-item"><Briefcase className="h-4 w-4" /> Projects</div>
                  <div className="preview-nav-item"><FileText className="h-4 w-4" /> Proposals</div>
                  <div className="preview-nav-item"><Receipt className="h-4 w-4" /> Invoices</div>
                  <div className="preview-nav-item"><Clock className="h-4 w-4" /> Time Tracking</div>
                  <div className="preview-nav-item"><Wallet className="h-4 w-4" /> Expenses</div>
                </div>
              </div>
              
              {/* Dashboard Content Mock */}
              <div className="preview-content">
                <div className="preview-header">
                  <div>
                    <h3 className="preview-title">Good morning, Jane</h3>
                    <p className="preview-subtitle">Here&apos;s a snapshot of your freelance business.</p>
                  </div>
                  <div className="preview-date">June 2026</div>
                </div>

                <div className="preview-stats-grid">
                  <div className="preview-stat-card">
                    <span className="stat-label">Active Clients</span>
                    <span className="stat-value">12</span>
                    <span className="stat-sub text-emerald-400">+3 this month</span>
                  </div>
                  <div className="preview-stat-card">
                    <span className="stat-label">Open Proposals</span>
                    <span className="stat-value">4</span>
                    <span className="stat-sub text-amber-400">Value: $18.5k</span>
                  </div>
                  <div className="preview-stat-card">
                    <span className="stat-label">Month Revenue</span>
                    <span className="stat-value">$8,450</span>
                    <span className="stat-sub text-emerald-400">100% paid</span>
                  </div>
                  <div className="preview-stat-card">
                    <span className="stat-label">Billable Hours</span>
                    <span className="stat-value">34.5h</span>
                    <span className="stat-sub text-red-400">Unbilled: $1.2k</span>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="preview-bottom-row">
                  {/* Recent Activity */}
                  <div className="preview-panel">
                    <h4 className="panel-title">Recent Invoices</h4>
                    <div className="preview-list">
                      <div className="preview-list-item">
                        <div className="item-info">
                          <span className="item-name">INV-2026-004</span>
                          <span className="item-sub">Acme Corporation</span>
                        </div>
                        <div className="item-meta">
                          <span className="item-amount">$4,500</span>
                          <span className="status-badge paid">Paid</span>
                        </div>
                      </div>
                      <div className="preview-list-item">
                        <div className="item-info">
                          <span className="item-name">INV-2026-003</span>
                          <span className="item-sub">Stark Industries</span>
                        </div>
                        <div className="item-meta">
                          <span className="item-amount">$2,800</span>
                          <span className="status-badge sent">Sent</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick proposal tracker */}
                  <div className="preview-panel">
                    <h4 className="panel-title">Active Proposal</h4>
                    <div className="preview-proposal-card">
                      <div className="proposal-header">
                        <span className="proposal-name">Mobile App Design</span>
                        <span className="status-badge viewed">Viewed 2m ago</span>
                      </div>
                      <p className="proposal-desc">Client: Wayne Enterprises</p>
                      <div className="proposal-footer">
                        <span className="proposal-price">$9,200</span>
                        <div className="proposal-actions">
                          <span className="action-tag">Awaiting Signature</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <ScrollReveal>
        <section id="features" className="features-section-new">
          <div className="section-header">
            <h2 className="section-title">Everything you need to run your business</h2>
            <p className="section-desc">
              Stop juggling spreadsheets, notes apps, and sticky notes. Kredo brings every 
              part of your freelance workflow into one unified place.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="bento-grid-new">
          
          {/* Tile 1: Client Management */}
          <div className="bento-tile-new col-span-2">
            <div className="bento-tile-content">
              <div className="bento-icon-wrapper blue">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="bento-tile-title">Client Management</h3>
              <p className="bento-tile-desc">
                Keep every client relationship organized. Contact info, project history, proposals, and invoices - all in one place.
              </p>
            </div>
            {/* Visual */}
            <div className="bento-visual client-visual">
              <div className="mock-client-card">
                <div className="client-avatar">A</div>
                <div className="client-details">
                  <span className="client-name">Acme Corp</span>
                  <span className="client-email">finance@acme.com</span>
                </div>
                <div className="client-badge">Active</div>
              </div>
              <div className="mock-client-card second">
                <div className="client-avatar orange">S</div>
                <div className="client-details">
                  <span className="client-name">Stark Corp</span>
                  <span className="client-email">pepper@stark.com</span>
                </div>
                <div className="client-badge orange">Active</div>
              </div>
            </div>
          </div>

          {/* Tile 2: Proposals */}
          <div className="bento-tile-new">
            <div className="bento-tile-content">
              <div className="bento-icon-wrapper amber">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="bento-tile-title">Proposals</h3>
              <p className="bento-tile-desc">
                Send professional proposals that get results. Track when clients view them and get notified instantly.
              </p>
            </div>
            {/* Visual */}
            <div className="bento-visual proposal-visual">
              <div className="mock-proposal-pill">
                <div className="proposal-status-glow viewed" />
                <span>Web Redesign Proposal</span>
                <span className="proposal-viewed-time">Viewed</span>
              </div>
            </div>
          </div>

          {/* Tile 3: Invoicing */}
          <div className="bento-tile-new">
            <div className="bento-tile-content">
              <div className="bento-icon-wrapper emerald">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="bento-tile-title">Invoicing</h3>
              <p className="bento-tile-desc">
                Create invoices with line items, tax, and automated tracking. Know exactly who has paid and who is overdue.
              </p>
            </div>
            {/* Visual */}
            <div className="bento-visual invoice-visual">
              <div className="mock-invoice-bill">
                <div className="invoice-header">
                  <span>#INV-0042</span>
                  <span className="status-badge paid">Paid</span>
                </div>
                <div className="invoice-amount">$4,500.00</div>
              </div>
            </div>
          </div>

          {/* Tile 4: Projects & Time Tracking */}
          <div className="bento-tile-new col-span-2">
            <div className="bento-tile-content">
              <div className="bento-icon-wrapper red">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="bento-tile-title">Projects & Time Tracking</h3>
              <p className="bento-tile-desc">
                Link assets, log hours, and track billable time against projects. Get paid for every single minute of your work.
              </p>
            </div>
            {/* Visual */}
            <div className="bento-visual timer-visual">
              <div className="mock-timer-widget">
                <div className="timer-left">
                  <div className="timer-pulse" />
                  <div className="timer-project-info">
                    <span className="timer-project">Mobile App Dev</span>
                    <span className="timer-task">Wireframing</span>
                  </div>
                </div>
                <div className="timer-right">
                  <span className="timer-digits">02:14:45</span>
                  <div className="timer-btn"><Play className="h-3 w-3 fill-white text-white" /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tile 5: Expenses */}
          <div className="bento-tile-new">
            <div className="bento-tile-content">
              <div className="bento-icon-wrapper violet">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="bento-tile-title">Expenses</h3>
              <p className="bento-tile-desc">
                Log business expenses, upload receipts, and set tax-deductible flags. Stay perfectly organized for tax season.
              </p>
            </div>
            {/* Visual */}
            <div className="bento-visual expense-visual">
              <div className="mock-expense-badge">
                <div className="expense-details-row">
                  <span className="expense-name">Vercel Hosting</span>
                  <span className="expense-cost">$20.00</span>
                </div>
                <div className="expense-tags">
                  <span className="expense-tag-pill">Software</span>
                  <span className="expense-tag-pill green">Tax Deductible</span>
                </div>
              </div>
            </div>
          </div>

          </div>
        </section>
      </ScrollReveal>

      {/* How it Works / Workflow Section */}
      <ScrollReveal delay={120}>
        <section id="workflow" className="workflow-section">
        <div className="section-header">
          <h2 className="section-title">How Kredo works</h2>
          <p className="section-desc">
            Three simple steps to go from lead to paid. No fluff, no complexity.
          </p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3 className="step-card-title">Add a Client</h3>
            <p className="step-card-desc">Import or create a client record. It takes 10 seconds.</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3 className="step-card-title">Send a Proposal</h3>
            <p className="step-card-desc">Create a proposal, set your rate, and send it. Know the moment it&apos;s viewed.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3 className="step-card-title">Track & Invoice</h3>
            <p className="step-card-desc">Log time, track expenses, and invoice your client when the work is done. Get paid faster.</p>
          </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal direction="none">
        <section className="cta-section">
          <div className="cta-glow" />
          <div className="cta-glow-2" />
          <h2 className="cta-title">Ready to take control of your freelance business?</h2>
        <p className="cta-subtitle">
          Join independent professionals who use Kredo to manage their business with clarity and confidence.
        </p>
        <div className="cta-actions">
          <Link href="/register" className="btn-primary-large">
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      </ScrollReveal>

      {/* Footer */}
      <footer className="footer-new">
        <div className="footer-content">
          <span>&copy; {new Date().getFullYear()} Kredo. All rights reserved.</span>
          <div className="footer-links">
            <Link href="/login" className="footer-link">Sign in</Link>
            <Link href="/register" className="footer-link">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
