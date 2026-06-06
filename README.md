# Kredo — Freelancer Operating System

All-in-one platform for freelancers. Proposals, contracts, invoices, time tracking, client portal, expense tracking. Built by a freelancer, for freelancers.

## Why Kredo?

Every freelancer juggles 5+ tools to run their business. Kredo replaces them all with one beautiful, unified experience. It's a product freelancers would pay for — because it saves them money and headaches.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** PostgreSQL
- **ORM:** Prisma 7
- **Auth:** NextAuth.js v5 (credentials + Google OAuth)
- **Payments:** Paystack (NG) + Stripe (Global)
- **Automation:** n8n (proposal follow-ups, invoice reminders, expiry alerts)
- **Deployment:** Vercel

## Project Structure

```
src/
  app/
    (auth)/
      login/
      register/
    (dashboard)/
      dashboard/
      clients/
      projects/
      proposals/
      invoices/
      time/
      expenses/
      settings/
    api/
      auth/
        [...nextauth]/
      clients/
      projects/
      proposals/
      invoices/
      ...
  components/
    ui/           # shadcn/ui components
    forms/        # Form components
    layout/       # Navigation, sidebar, header
  lib/
    db.ts         # Prisma client
    auth.ts       # NextAuth config
  types/
  generated/
    prisma/       # Prisma generated client
prisma/
  schema.prisma   # Database schema
```

## Phase 1 — Core Loop

Create client → Send proposal → Get accepted → Create invoice → Get paid

### Routes
- `/login` / `/register` — Auth
- `/onboarding` — First-time setup
- `/dashboard` — Earnings, recent activity, quick actions
- `/clients` — CRUD + list
- `/proposals` — Create, preview PDF, send, track status
- `/invoices` — Create, preview PDF, send, payment tracking
- `/settings` — Profile, brand, rates, integrations

## Phase 2 — Time & Expenses

- `/time` — Manual entry + timer
- `/expenses` — Log business expenses
- Reporting dashboard

## Phase 3 — Client Portal & Automation

- `/portal` — Client can view proposals, invoices, shared files
- n8n automations
- Contract templates + e-signatures

## Getting Started

```bash
npm install
cp .env.example .env.local  # Configure database URL, auth secrets
npx prisma migrate dev
npm run dev
```

## Brand

- **Fonts:** DM Sans (body), Bricolage Grotesque (headings)
- **Colors:** TBD — will define during branding phase
- **Logo:** TBD
