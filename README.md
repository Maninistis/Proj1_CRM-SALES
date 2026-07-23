# CRM + Sales Management System

A modern, full-stack **multi-tenant CRM and Sales Management platform** that tracks every customer relationship from the first Lead through to final Delivery. Built for organizations that operate one or more businesses, it gives every team member a role-aware, customizable dashboard on top of a strict, enforced sales pipeline.

The platform standardizes the entire revenue workflow — **Lead → Opportunity → Quotation → Customer → Sales Order → Invoice → Payment → Delivery** — so no step is skipped, no data is re-entered, and every stakeholder sees a single source of truth scoped to their role and their business.

### Design Philosophy

- **Business-first isolation.** Every CRM entity belongs to a `Business`. A user in Business A has zero visibility into Business B. System Admins can switch between businesses or view all of them at once.
- **Role-aware, not feature-aware.** What you see is determined by your role (`Admin`, `Sales Manager`, `Sales Rep`) — dashboards, menus, and data scoping all adapt automatically.
- **Workflow integrity over manual status juggling.** Sales Order and Invoice statuses are *derived* from real events (payments recorded, deliveries acknowledged) — never edited by hand.
- **Per-user personalization.** Each user customizes their own dashboard layout independently; preferences never bleed across users.
- **One source of truth.** Every displayed metric comes from the database. Every document (quotation, invoice, receipt) is generated from live data with consistent branding.

---

## Table of Contents

- [Architecture](#architecture)
- [Role System](#role-system)
- [Business Model & Multi-Tenancy](#business-model--multi-tenancy)
- [CRM Workflow](#crm-workflow)
- [Sales Order Workflow](#sales-order-workflow)
- [Invoice Workflow](#invoice-workflow)
- [Dashboards](#dashboards)
- [Customizable Dashboards](#customizable-dashboards)
- [Team Overview](#team-overview)
- [Pipeline Search](#pipeline-search)
- [Settings](#settings)
- [Document Generation](#document-generation)
- [Security](#security)
- [Production Quality](#production-quality)
- [Features](#features)
- [Roadmap](#roadmap)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Surface](#api-surface)
- [Installation](#installation)
- [Default Users](#default-users)
- [Developer Guide](#developer-guide)
- [License](#license)

---

## Architecture

The application is a single Next.js codebase using the **App Router**, with Server Components by default and Server Actions as the API layer (there is no separate REST backend for CRM operations). The database is **MariaDB**, accessed exclusively through **Prisma**.

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                       │
│   React 19 · Tailwind 4 · base-ui · React Hook Form · Zod    │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS (Server Components / Actions)
┌───────────────────────────▼─────────────────────────────────┐
│                    Next.js 16 (App Router)                    │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Middleware  │  │ Server Actions│  │ Route Handlers (API) │  │
│  │ (auth+RBAC)│  │ (CRM writes) │  │ (PDF, search, msgs)  │  │
│  └────────────┘  └──────────────┘  └──────────────────────┘  │
│         │ requirePermission()   │   Zod schemas parse input   │
│         │ scopeUserId           │   audit.log() on every write│
└─────────┬───────────────────────┬────────────────────────────┘
          │                        │
┌─────────▼────────────────────────▼────────────────────────────┐
│                      Feature Services                          │
│  lead · opportunity · quotation · customer · sales-order      │
│  sales-invoice · payment · delivery-note · product · user     │
│  dashboard · pipeline · messaging · notification · audit-log  │
└───────────────────────────┬───────────────────────────────────┘
                            │ Prisma Client 7 (MariaDB adapter)
┌───────────────────────────▼───────────────────────────────────┐
│                        MariaDB 10.x+                           │
│   Every table carries business_id → tenant isolation           │
└────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router, RSC, Turbopack) | `16.2.10` |
| UI | [React](https://react.dev/) | `19.2.4` |
| Language | [TypeScript](https://www.typescriptlang.org/) (strict) | `^5` |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | `^4` |
| Headless UI | [@base-ui/react](https://base-ui.com/) (Dialog, Select, Dropdown) | `^1.6` |
| Primitives | [@radix-ui/react-label](https://www.radix-ui.com/), [@radix-ui/react-slot](https://www.radix-ui.com/) | — |
| Icons | [lucide-react](https://lucide.dev/) | `^1.23` |
| Toasts | [Sonner](https://sonner.emilkowal.ski/) | `^2.0` |
| Forms | [React Hook Form](https://react-hook-form.com/) + [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | `^7.81` |
| Validation | [Zod](https://zod.dev/) (client + server) | `^4.4.3` |
| Auth | [Auth.js / NextAuth v5](https://authjs.dev/) (JWT strategy) | `5.0.0-beta.31` |
| Passwords | [bcryptjs](https://github.com/dy/bcryptjs) (12 rounds) | `^3.0` |
| Database | [MariaDB](https://mariadb.org/) | `10.6+` |
| ORM | [Prisma](https://www.prisma.io/) + [@prisma/adapter-mariadb](https://www.npmjs.com/package/@prisma/adapter-mariadb) | `^7.8` |
| PDF | [puppeteer-core](https://pptr.dev/) (headless Chrome) | `^25.3` |
| Tables | [@tanstack/react-table](https://tanstack.com/table) | `^8.21` |
| Testing | [Vitest](https://vitest.dev/) | `^4.1` |
| Linting | [ESLint](https://eslint.org/) `9` + eslint-config-next | — |
| Formatting | [Prettier](https://prettier.io/) | `^3.9` |

### Architectural Patterns

- **Feature-driven modules** — each domain (`lead`, `quotation`, `sales-order`, …) is self-contained with `actions/`, `services/`, `repositories/`, `schemas/`, `constants.ts`.
- **Server Actions as the write API** — thin wrappers that call `requirePermission()` then delegate to a service. There is no separate REST backend for CRM data.
- **Repository-layer scoping** — every query accepts a `scopeUserId` so Sales Reps only ever read their own records, enforced at the data-access layer (not the UI).
- **Per-business document numbering** — the `Counter` table uses a composite key `(prefix, businessId)`, so `INV-0001` in Business A is independent of `INV-0001` in Business B.
- **Status derivation** — Sales Order and Invoice statuses are computed from payments and deliveries by `src/lib/workflow/so-status-sync.ts`, never set manually.

---

## Role System

The system defines three roles. The role name is stored verbatim in the `Role` table and seeded from `ROLE_PERMISSIONS` in `src/lib/auth/permissions.ts`.

### System Admin (`Admin`)

Full, unrestricted access. Holds the wildcard permission `*`, which grants every capability. An Admin can:

- Manage users, roles, and all CRM data across **every business** they belong to.
- Switch between businesses or enter **All Businesses** mode (cross-tenant aggregate view).
- View the Executive Dashboard and the All-Businesses Team Overview.
- Configure Edit Company Details (branding, prefixes, delivery policy) per business.

### Sales Manager (`Sales Manager`)

Manages a team of Sales Representatives within a single business. Can:

- Read, create, update, **and delete** all CRM records in their business.
- Create and edit Sales Reps and assign leads/opportunities.
- View Audit Logs scoped to their team's actions.
- Edit business settings.
- See all records (not just their own).

### Sales Representative (`Sales Rep`)

An individual contributor. Can:

- Read, create, and update their **own** records only (leads, opportunities, quotations, customers, sales orders, invoices, payments, delivery notes they created or were assigned).
- **Cannot** delete records, manage users, view audit logs, edit settings, or change roles.
- Sees the Employee Dashboard and their own Pipeline view.

### Permission Matrix

| Capability | Admin | Manager | Sales Rep |
|---|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ |
| Manage CRM records (Leads → Delivery Notes) | ✅ | ✅ | ✅ (own only) |
| **Delete** records | ✅ | ✅ | ❌ |
| Create / edit Sales Reps | ✅ | ✅ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ |
| Change user roles | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ (team only) | ❌ |
| Edit Company Details | ✅ | ✅ | ❌ |
| Switch Businesses / All Businesses mode | ✅ | ❌ | ❌ |

### How Permissions Are Enforced

Permissions use the format `resource:action` (e.g. `leads:create`). The wildcard `*` (Admin only) short-circuits every check.

- **Middleware** (`src/middleware.ts`) maps every URL to a required permission via `ROUTE_PERMISSIONS` and rejects unauthorized routes before they render.
- **Server Actions** call `requirePermission(session, "resource:action")` before any write.
- **Repositories** accept `scopeUserId` so Sales Rep queries are filtered at the database level.
- **Detail pages** call `assertOwnership()` to verify the requester may view a specific record.
- **Session** carries `userId`, `roleId`, `permissions[]`, and `businessId`.

---

## Business Model & Multi-Tenancy

The platform is **fully multi-tenant**. A `Business` is the top-level isolation boundary; every CRM entity, setting, audit log, conversation, notification, and document counter carries a `businessId`.

```
Business
   │
   ├── BusinessUser (many-to-many join) ── User
   │                                          │
   │                                          ├── Role (Admin / Manager / Rep)
   │                                          └── CRM Data they create/own
   │
   └── All CRM entities (Lead, Opportunity, Quotation, Customer,
                         SalesOrder, Invoice, Payment, DeliveryNote,
                         Product, AuditLog, Setting, Counter,
                         Conversation, Notification, DocumentSetting)
```

### Key Concepts

- **One login, many businesses.** A User authenticates once and can belong to multiple businesses via the `BusinessUser` join table. The seeded System Admin belongs to both *Apex Business Solutions* and *Apex Logistics*.
- **Business switching.** A cookie (`businessId`) records the currently active business. The business switcher (`/api/business/switch`) updates it; `getCurrentBusinessId()` reads it on every request.
- **All Businesses mode.** When the cookie value is `"all"` **and** the user is an Admin, the session enters global view (`isGlobalView()`). Aggregate dashboards, cross-business Team Overview, and business comparison tables become available. Non-admin users cannot enter this mode.
- **Business isolation.** Every repository query applies `getBusinessScopeFilter()`, which returns `{ businessId }` for a specific business or `{}` (no filter) only in All Businesses mode. `canAccessBusiness()` verifies membership before any cross-business action.
- **Independent branding.** Each business has its own `DocumentSetting` (logo, company name, address, prefixes, tax rate, terms) and its own `Counter` rows, so document numbering and branding never collide.

---

## CRM Workflow

The CRM enforces a strict sequential pipeline. Each stage unlocks only when the previous one is complete.

```
Lead ──▶ Opportunity ──▶ Quotation ──▶ Customer ──▶ Sales Order ──▶ Invoice ──▶ Payment ──▶ Delivery
 │           │              │              │              │             │           │
 │ Convert    │ Create from  │ Accept,      │ Required     │ Generate    │ Record    │ Requires
 │ to Opp     │ CLOSED_WON   │ then create  │ before SO    │ Invoice     │ Payment   │ full/part
 │            │ Opportunity  │ Customer     │ conversion   │ from SO     │ against   │ payment
 │            │              │              │              │             │ invoice   │ (policy)
```

### Stage Purposes

| Stage | Purpose |
|---|---|
| **Lead** | Capture an early contact (person + company). Statuses: `NEW` → `CONTACTED` → `QUALIFIED` (or `DISQUALIFIED`). |
| **Opportunity** | A qualified deal with estimated value and expected close date. Stages: `PROSPECTING` → `QUALIFICATION` → `NEEDS_ANALYSIS` → `VALUE_PROPOSITION` → `NEGOTIATION`. Statuses: `OPEN` → `CLOSED_WON` / `CLOSED_LOST`. |
| **Quotation** | A priced proposal with line items, discounts, and tax. Statuses: `DRAFT` → `READY` → `SENT` → `ACCEPTED` / `REJECTED` / `EXPIRED`. |
| **Customer** | A real account (created from an accepted quotation's lead) with billing/shipping addresses, contacts, credit limit, and payment terms. Statuses: `NEW` → `ACTIVE` → `INACTIVE` / `BLOCKED`. |
| **Sales Order** | A confirmed order. See [Sales Order Workflow](#sales-order-workflow). |
| **Invoice** | A billable invoice generated from a Sales Order. See [Invoice Workflow](#invoice-workflow). |
| **Payment** | Money received against an invoice (CASH, BANK_TRANSFER, CHECK, CREDIT_CARD, GCASH, OTHER). |
| **Delivery** | Physical fulfilment via a Delivery Note. Requires payment per the business's Delivery Payment Policy. |

### Intelligent Pre-Fill

Every stage transition pre-fills the next form so data is never re-entered:

- **Lead → Opportunity**: title from company name, assignment carried over.
- **Opportunity → Quotation**: subject, valid-until date, notes.
- **Quotation → Customer**: name, email, phone from the originating lead.
- **Quotation → Sales Order**: all line items, pricing, discounts, tax rate, customer auto-selected.
- **Sales Order → Invoice**: all line items, customer snapshot, pricing.
- **Sales Order → Delivery Note**: line items with remaining quantities.

### Workflow Rules

| Rule | Enforcement |
|---|---|
| Opportunity requires a qualified Lead | Backend + Frontend |
| Quotation requires a `CLOSED_WON` Opportunity | Backend + Frontend |
| Customer required before Sales Order conversion | Modal + backend |
| Sales Order requires `ACCEPTED` Quotation + `ACTIVE` Customer | Backend + Frontend |
| Invoice generated from a confirmed Sales Order | Backend |
| Payment allowed only on `OPEN` / `PARTIALLY_PAID` / `OVERDUE` invoices | Backend |
| Delivery requires payment per business Delivery Payment Policy | Backend (`delivery-policy.ts`) |
| Deleting a Customer frees the lead for re-creation (nulls `leadId`) | Backend |

---

## Sales Order Workflow

A Sales Order's status is **derived** from financial events (payments) and operational events (deliveries) — it is never edited manually. The only manual transition is cancellation.

```
AWAITING_PAYMENT ──▶ PARTIALLY_PAID ──▶ FULLY_PAID ──▶ DELIVERED ──▶ COMPLETED
     │                    │                  │              │
     └───────────────────┴──────────────────┴──────────────┴──▶ CANCELLED (manual, terminal)
```

| Status | Meaning | How it's reached |
|---|---|---|
| `AWAITING_PAYMENT` | No payments recorded yet | Default on creation |
| `PARTIALLY_PAID` | Some payment received, balance remains | `syncSalesOrderFromInvoice()` after a payment |
| `FULLY_PAID` | Invoice fully paid | `syncSalesOrderFromInvoice()` when `paidAmount ≥ grandTotal` |
| `DELIVERED` | All line items fully delivered | `syncSalesOrderFromDelivery()` when all items have `deliveredQuantity ≥ quantity` |
| `COMPLETED` | All delivery notes acknowledged | `syncSalesOrderFromDelivery()` when all DNs are `ACKNOWLEDGED` |
| `CANCELLED` | Cancelled (terminal) | Manual action; cascades: voids unpaid invoice, cancels active delivery notes |

> **Forward-only:** once a Sales Order reaches `DELIVERED` or `COMPLETED`, the financial sync becomes a no-op — operational progress cannot be rolled back by editing payments.

**Sync logic:** `src/lib/workflow/so-status-sync.ts`
- `syncSalesOrderFromInvoice()` — called after every payment create/delete/restore.
- `syncSalesOrderFromDelivery()` — called after every delivery-note create/transition/soft-delete/restore.

---

## Invoice Workflow

Invoice status represents **financial state only** — never operational fulfilment.

```
                ┌──▶ PAID (terminal)
                │
OPEN ──▶ PARTIALLY_PAID ──┤
  │          ▲             │
  │          │             └──▶ VOIDED (terminal)
  └──▶ OVERDUE ────────────┘
```

| Status | Meaning |
|---|---|
| `OPEN` | Issued, no payment yet |
| `PARTIALLY_PAID` | Some payment received, balance remains |
| `PAID` | Fully paid (terminal) |
| `OVERDUE` | Past due date (may still receive payments → `PARTIALLY_PAID` / `PAID`) |
| `VOIDED` | Cancelled (terminal; `paidAmount` still tracked but status frozen) |

### How Payments Update Invoice State

`recalculateInvoiceBalance()` (in `payment.service.ts`) runs after every payment create/soft-delete/restore:

- `totalPaid ≥ grandTotal` → **PAID**
- `totalPaid > 0` → **PARTIALLY_PAID**
- Already `OVERDUE` → stays **OVERDUE** (unless fully paid)
- Otherwise → **OPEN**
- **VOIDED** is terminal: only `paidAmount` updates, status never changes.

### How Invoice Completion Affects Sales Orders

Every payment also triggers `syncSalesOrderFromInvoice(salesOrderId)`, so the Sales Order's financial status tracks the invoice in lock-step (see [Sales Order Workflow](#sales-order-workflow)).

---

## Dashboards

The dashboard a user sees is determined by `resolveDashboardContext()` (`src/features/dashboard/services/dashboard-prefs.service.ts`), which inspects permissions and the active `businessId`:

| Context | Who sees it | Focus |
|---|---|---|
| **Employee Dashboard** | Sales Reps | Personal, actionable work — own leads, own pipeline, own tasks |
| **Manager Dashboard** | Sales Manager (specific business) | Team performance, queue, revenue trend, immediate attention |
| **Business Dashboard** | System Admin (specific business) | Single-business operational view — KPIs, pipeline, team activity |
| **Executive Dashboard** | System Admin in All Businesses mode | Cross-business aggregates — comparison table, per-business performance, organization-wide work queue |

### What Each Dashboard Shows

- **Employee** — KPI summary (uncontacted leads, active opportunities, awaiting payment, revenue), personal sales pipeline, revenue trend, Getting Started onboarding checklist, recent customers, quick actions, team activity, top customers, immediate attention.
- **Manager** — Team KPIs, manager's sales pipeline, revenue trend, Getting Started, current work queue, monthly performance, immediate attention, recent activity.
- **Business (Admin)** — Organization-wide KPIs, sales pipeline, revenue trend, current work queue, recent activity, business overview, quick actions.
- **Executive (Admin, All Businesses)** — Organization KPIs, per-business performance breakdown, executive work queue by business, revenue trend, recent activity across all businesses, cross-business needs-attention list, side-by-side business comparison.

Every metric is computed live from the database, scoped to the user's role and business. Dashboards prioritize **current actionable work** over cumulative historical ownership.

---

## Customizable Dashboards

Every user can personalize their own dashboard layout. Customization is **per-user** and stored independently — changing your layout never affects anyone else.

### Capabilities

- **Show / Hide widgets** — toggle any widget on or off.
- **Drag & Drop reorder** — HTML5 drag-and-drop on the Customize page; up/down buttons as a fallback.
- **Reset to Default** — restore the catalog's default order and visibility in one click.
- **Responsive auto-layout** — widgets flow into a dense CSS grid; hidden widgets leave no gaps; full-width widgets span both columns on large screens.
- **Getting Started auto-dismiss** — the onboarding checklist shows a completion state ("🎉 You're all set!") when all tasks are done, with a "Hide this widget" button. Hidden widgets can be re-enabled from the Customize page.
- **Representative widget previews** — the Customize page renders faithful miniature replicas of each widget (real colors, icons, typography) so users can identify widgets without reading titles.

### How It's Stored

Preferences live in the `Setting` table with key `dashboard_pref_{userId}_{context}` and a composite `(key, businessId)` uniqueness constraint. The stored shape is `{ order: string[], hidden: string[] }`. On load, preferences are **reconciled** against the current widget catalog — new widgets are appended, removed widgets are pruned, so stored layouts never go stale.

### Where to Customize

- Click **"Customize"** beside the date filter on any dashboard, or visit `/dashboard/customize`.
- Save Layout returns you to `/dashboard` with your changes applied immediately.

---

## Team Overview

The **Team Overview** page (`/team`) shows the manager → rep hierarchy. Access requires the `users:read` permission.

| Viewer | What they see |
|---|---|
| **Manager** | `ManagerTeamOverview` — their direct reports with per-rep detail (assigned leads, opportunities, queue, revenue). |
| **System Admin (specific business)** | `AdminTeamOverview` — the full organization hierarchy for that business. |
| **System Admin (All Businesses)** | `BusinessTeamCards` — every business with its managers and reps; click a card to switch context. |

```
Manager
   │
   ├── Sales Representative  (leads, opportunities, queue, revenue)
   ├── Sales Representative
   └── Sales Representative
```

Available actions include drilling into a rep's pipeline (`/pipeline?assigneeId=…`) and viewing their record ownership.

---

## Pipeline Search

The **Pipeline** page (`/pipeline`) is a customer-and-lead lookup that visualizes the full workflow journey of any record.

### Capabilities

- **Customer / Lead lookup** — search by `leadId` or `customerId` to see that record's complete journey across all 8 stages.
- **Cross-stage visualization** — `PipelineSummary`, `PipelineProgress`, `WorkflowGrid`, and `WorkflowTimeline` show which stages are complete and what remains.
- **Assignee view** — `?assigneeId=…` lists every lead and customer assigned to a team member (used from Team Overview).
- **Business isolation** — searches are scoped to the active business via `getBusinessScopeFilter()`.
- **Live sync** — `PipelineLiveSync` and `PipelineRemember` keep the view in sync with database state without manual refresh.

### The 8 Stages

Lead → Opportunity → Quotation → Customer → Sales Order → Invoice → Payment → Delivery

A stage is "complete" when its entity exists and meets the stage's success criterion (e.g. Payment stage completes only when the invoice is fully paid).

---

## Settings

Settings are consolidated under a single page: **Edit Company Details** (`/settings/company`). The legacy separate Document Settings page (`/settings/documents`) redirects here.

`/settings` itself redirects to `/settings/company`.

### Edit Company Details centralizes

- **Company Information** — company name, logo, description.
- **Contact Information** — address (line 1/2, city, province, ZIP, country), phone, mobile, email, website, social links (Facebook, LinkedIn, Instagram), primary contact.
- **Business Preferences** — currency, tax rate, payment terms days, date format, timezone, decimal places, paper size, orientation.
- **Document Configuration** — prefixes (Invoice `INV`, Quotation `Q`, Sales Order `SO`, Delivery `DN`, Payment `PAY`, Official Receipt `OR`), starting number, terms & conditions text, payment instructions, footer content, signature image + name + position.
- **Delivery Payment Policy** — `requireFullPayment` (default on), `allowPartial`, `minPercentage`. Controls whether delivery requires full payment or allows partial.

> All settings are **per-business** (each business has its own `DocumentSetting` row).

### Other Administration Pages

- **Users** (`/users`) — create/manage users, assign roles and managers, soft-deactivate. Admin-only for role changes; Managers manage their reps.
- **Audit Logs** (`/audit-logs`) — searchable trail of every CRUD operation with previous/new state. Managers see only their team's actions; Admins see all.
- **My Profile** (`/profile`) — self-service personal info and password changes.

---

## Document Generation

### Supported Documents

| Document | Print View | PDF | Prefix |
|---|---|---|---|
| **Quotation** | `/quotations/[id]/print` | `/api/quotations/[id]/pdf` | `Q` |
| **Invoice** | `/sales-invoices/[id]/print` | `/api/invoices/[id]/pdf` | `INV` |
| **Official Receipt** (Payment) | `/payments/[id]/print` | `/api/payments/[id]/pdf` | `PAY` / `OR` |
| **Sales Order** | — | — | `SO` |
| **Delivery Note** | — | — | `DN` |

> Print views live under a dedicated `(print)` route group. Sales Order and Delivery Note do **not** currently have print/PDF generation.

### PDF Pipeline

1. The print view is a server-rendered React page under `src/app/(print)/`.
2. The PDF API route (`/api/.../pdf`) launches **puppeteer-core** with headless Chrome, navigates to the print page (`?auto=1`), forwards the auth cookie, and prints to PDF.
3. Document Settings (logo, signature, terms, prefixes) are injected from the active business's `DocumentSetting`.
4. Document numbers are auto-incremented **per business** via the `Counter` table (composite key `(prefix, businessId)`), formatted `{PREFIX}-0000`.

### Document Number Prefixes

| Entity | Prefix | Example |
|---|---|---|
| Lead | `LEAD` | `LEAD-0001` |
| Opportunity | `OPP` | `OPP-0001` |
| Quotation | `QUO` (display) / `Q` (configurable) | `QUO-0001` |
| Customer | `CUST` | `CUST-0001` |
| Sales Order | `SO` | `SO-0001` |
| Invoice | `INV` | `INV-0001` |
| Payment | `PAY` | `PAY-0001` |
| Delivery Note | `DN` | `DN-0001` |

---

## Security

### Authentication

- **Auth.js (NextAuth v5)** with JWT strategy.
- **bcryptjs** password hashing (12 rounds).
- **Middleware** enforces authentication and route-level permissions on every request.
- Sessions carry `userId`, `roleId`, `permissions[]`, and `businessId`.

### Authorization

- **Frontend** — menu items, buttons, and forms are conditionally rendered from `permissions[]`.
- **Backend** — every Server Action and service calls `requirePermission(session, "resource:action")`.
- **Data scoping** — repository queries filter by `scopeUserId` for Sales Reps.
- **Ownership checks** — `assertOwnership()` on all detail pages.
- **Route permissions** — `ROUTE_PERMISSIONS` maps every URL to a required permission.

### Business Isolation

- **Every entity carries `businessId`** — leads, opportunities, quotations, customers, sales orders, invoices, payments, delivery notes, products, audit logs, settings, counters, conversations, notifications, and document settings.
- **Membership checks** — `canAccessBusiness(userId, businessId)` verifies `BusinessUser` membership before any cross-business action.
- **All Businesses mode is Admin-only** — `isGlobalView()` requires both the `*` permission and `businessId === "all"`.

### Scoped Subsystems

- **Business-scoped search** — the search API and pipeline apply `getBusinessScopeFilter()`.
- **Business-scoped notifications** — `Notification.businessId` ensures users only see alerts for their active business.
- **Business-scoped messaging** — `Conversation.businessId` isolates threads per business.
- **Print/PDF authorization** — PDF routes forward the auth cookie and respect the same permission + ownership checks as the rest of the app; a user cannot generate a document for a business or record they cannot access.

---

## Production Quality

The platform has passed a multi-wave production-readiness audit. Key improvements shipped:

- **Business isolation** — verified end-to-end across every entity, search, notification, conversation, and document counter.
- **Dashboard metric normalization** — every KPI is computed from live database state, scoped by role and business; no hardcoded metrics.
- **Workflow integrity** — Sales Order and Invoice statuses are derived from events, not edited; cancellation cascades correctly void unpaid invoices and cancel active delivery notes.
- **Notification correctness** — overdue, due-soon, and expiring-quotation notifications are business-scoped and timed correctly.
- **Role-based dashboards** — four distinct dashboard contexts ensure each role sees actionable, appropriately-scoped work.
- **Responsive design** — collapsible sidebar with mobile drawer, responsive data tables, adaptive dashboard grids, touch-friendly controls, and cross-device compatibility from mobile through desktop.
- **Performance** — N+1 query optimizations, indexed foreign keys and `businessId` columns on every table, and Prisma `select` scoping on read-heavy paths.

---

## Features

### CRM Core

- **Lead Management** — capture, status workflow (`NEW`/`CONTACTED`/`QUALIFIED`/`DISQUALIFIED`), assignment, soft-delete with restore, sources (WEBSITE, REFERRAL, COLD_CALL, EVENT, OTHER).
- **Opportunity Management** — 5-stage pipeline, estimated value, expected close date, win/loss tracking.
- **Quotation Management** — multi-line-item quotations, automatic subtotal/discount/tax/grand-total, print view + PDF, acceptance flow enforcing Customer creation.
- **Customer Management** — full database with billing/shipping addresses and contacts, credit limits, payment terms, duplicate prevention, soft-delete that frees the lead.
- **Products & Services** — catalog with categories (Software, Service, Consulting), active/inactive toggle, quick-fill into quotations and sales orders.
- **Sales Orders** — quotation conversion with full pre-fill, event-derived status, cancellation cascade.
- **Invoices** — generated from Sales Orders with customer snapshot, payment-derived status, print view + PDF.
- **Payments** — six methods (CASH, BANK_TRANSFER, CHECK, CREDIT_CARD, GCASH, OTHER), conditional validation, proof upload, Official Receipt PDF.
- **Delivery Notes** — status workflow (`DRAFT`/`DISPATCHED`/`DELIVERED`/`ACKNOWLEDGED`/`CANCELLED`), carrier + tracking, quantity tracking, SO status sync.

### Platform

- **Pipeline Search** — 8-stage visualization, customer/lead lookup, assignee view, live sync.
- **Customizable Dashboards** — per-user layouts, drag-and-drop, show/hide, reset, faithful widget previews.
- **Team Overview** — manager/admin/all-businesses hierarchy views.
- **Messenger** — floating widget, business-scoped conversations, unread badge, group support.
- **Notifications** — invoice overdue/due-soon, quotation expiring, event-driven alerts; business-scoped.
- **Audit Logs** — every CRUD operation with previous/new state, user attribution, searchable, role-scoped.
- **User Management** — role assignment, manager linkage, profile pictures, temporary passwords, soft-deactivate.
- **Role-Based Access Control** — 3 roles, granular `resource:action` permissions, wildcard for Admin.
- **Multi-Tenancy** — per-business data isolation, business switching, All Businesses mode.
- **Document Generation** — Quotation, Invoice, and Official Receipt PDFs with per-business branding and numbering.
- **Global Search** — cross-entity search (`/api/search`), business-scoped.
- **File Upload** — document assets and payment proofs.
- **Responsive UI** — mobile through desktop.

---

## Roadmap

### Completed

- Multi-tenant Business architecture (full isolation, switching, All Businesses mode)
- Role-based dashboards (Employee, Manager, Business, Executive)
- Per-user customizable dashboards
- Complete CRM workflow (Lead → Delivery) with status derivation
- Team Overview (manager / admin / all-businesses)
- Pipeline Search with cross-stage visualization
- Audit Logs (role-scoped)
- Messenger (business-scoped)
- Notifications (business-scoped)
- PDF generation (Quotation, Invoice, Official Receipt)
- Per-business document numbering and branding

### In Progress / Planned

- **Advanced Dashboard Analytics** — custom date ranges, cohort analysis, exportable CSV/PDF reports.
- **Sales Order PDF** — extend the puppeteer pipeline to Sales Orders.
- **Delivery Note PDF** — extend the puppeteer pipeline to Delivery Notes.
- **Task Management** — assign follow-up tasks with due dates and reminders.

### Future Enhancements

- **Subscription & Billing** — plan packages, usage metering, invoicing.
- **API Access** — public REST/GraphQL API for third-party integrations.
- **AI Features** — lead scoring, next-best-action recommendations, automated follow-ups.
- **Email Integrations** — send quotations and invoices via email with tracking.
- **Calendar Integrations** — schedule meetings, calls, and follow-ups.
- **Mobile Application** — native iOS/Android app for field reps.
- **Customer Portal** — let customers view invoices, pay online, and track deliveries.
- **Inventory Management** — track stock levels, auto-deduct on delivery.
- **Accounting Integration** — sync with Xero, QuickBooks, or SAP.

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login, register
│   ├── (dashboard)/              # Protected CRM routes
│   │   ├── dashboard/            # Dashboards + /customize
│   │   ├── pipeline/             # Pipeline Search
│   │   ├── team/                 # Team Overview
│   │   ├── leads/                # Lead management
│   │   ├── opportunities/        # Opportunity management
│   │   ├── quotations/           # Quotation management
│   │   ├── customers/            # Customer management
│   │   ├── sales-orders/         # Sales Order management
│   │   ├── sales-invoices/       # Invoice management
│   │   ├── payments/             # Payment management
│   │   ├── delivery-notes/       # Delivery Note management
│   │   ├── products/             # Product catalog
│   │   ├── users/                # User management
│   │   ├── roles/                # Role management (Admin)
│   │   ├── audit-logs/           # Audit trail
│   │   ├── settings/             # /company (Edit Company Details)
│   │   └── profile/              # My Profile
│   ├── (print)/                  # Print-only routes (Quotation, Invoice, Payment)
│   ├── api/                      # API routes (PDF, search, messages, notifications, business)
│   └── layout.tsx                # Root layout
│
├── features/                     # Feature modules (domain-driven)
│   ├── lead/                     # actions/ services/ repositories/ schemas/ constants.ts
│   ├── opportunity/              # (same structure)
│   ├── quotation/
│   ├── customer/
│   ├── sales-order/
│   ├── sales-invoice/
│   ├── payment/
│   ├── delivery-note/
│   ├── product/
│   ├── user/
│   ├── role/
│   ├── dashboard/                # widgets, catalogs, dashboard services
│   ├── pipeline/                 # pipeline search services + components
│   ├── messaging/
│   ├── notification/
│   ├── audit-log/
│   ├── document-settings/
│   ├── setting/
│   └── search/                   # global cross-entity search
│
├── components/                   # Shared UI
│   ├── ui/                       # Base primitives (button, card, dialog, …)
│   ├── forms/                    # money-input, phone-input, etc.
│   ├── layout/                   # Sidebar, topbar, business switcher
│   ├── data-table/               # Generic paginated data table
│   ├── documents/                # PDF/print templates
│   ├── dashboard/                # Dashboard widgets + grid
│   ├── team/                     # Team Overview components
│   └── pipeline/                 # Pipeline visualization components
│
├── lib/                          # Cross-cutting utilities
│   ├── auth/                     # auth.config, permissions, data-scope, business, owner-check
│   ├── workflow/                 # so-status-sync, delivery-policy, mappers
│   ├── audit.ts                  # Audit log helper
│   ├── notify.ts                 # Notification helper
│   ├── prisma.ts                 # Prisma client singleton
│   ├── errors.ts                 # AppError, NotFoundError, ConflictError, ForbiddenError
│   ├── pagination.ts
│   └── document-number.ts        # Per-business auto-incrementing numbering
│
├── config/                       # nav.ts, env.ts
└── middleware.ts                 # Auth + route permission middleware
```

---

## Database Schema

The schema lives in `prisma/schema.prisma` and uses `prisma db push` (no migration files). The MariaDB driver adapter is configured in `src/lib/prisma.ts`.

### Core Models

| Model | Purpose | Business-scoped? |
|---|---|---|
| `Business` | Top-level tenant | — (is the tenant) |
| `BusinessUser` | Many-to-many User ↔ Business membership | — (join) |
| `User` | Authenticated user with role + manager linkage | — |
| `Role` / `Permission` / `RolePermission` | RBAC definitions | — |
| `Lead` | Early contact | ✅ |
| `Opportunity` | Qualified deal | ✅ |
| `Quotation` / `QuotationItem` | Priced proposal | ✅ |
| `Customer` / `CustomerContact` / `CustomerAddress` | Account | ✅ |
| `SalesOrder` / `SalesOrderItem` | Confirmed order | ✅ |
| `SalesInvoice` / `SalesInvoiceItem` | Billable invoice | ✅ |
| `Payment` | Money received | ✅ |
| `DeliveryNote` / `DeliveryNoteItem` | Fulfilment | ✅ |
| `Product` | Catalog item | ✅ |
| `DocumentSetting` | Per-business branding + prefixes | ✅ |
| `Setting` | Key/value config (incl. dashboard prefs, delivery policy) | ✅ |
| `Counter` | Per-business document numbering | ✅ |
| `AuditLog` | Operation trail | ✅ |
| `Conversation` / `ConversationParticipant` / `Message` | Messaging | ✅ |
| `Notification` | User alerts | ✅ |
| `Account` / `Session` / `VerificationToken` | Auth.js adapter | — |

### Key Relationships

- **User → Role** (many-to-one), **User → manager** (self-relation `UserManager`), **User → directReports**.
- **User ↔ Business** (many-to-many via `BusinessUser`).
- **Lead → Opportunity → Quotation → Customer → SalesOrder → Invoice → Payment** (the workflow chain).
- **SalesOrder → DeliveryNote** (one-to-many; partial deliveries supported).
- **SalesOrder ↔ Quotation** (one-to-one; `quotationId` unique).
- **SalesInvoice ↔ SalesOrder** (one-to-one; `salesOrderId` unique).
- **Every CRM entity → Business** via `businessId` (indexed).

---

## API Surface

The CRM write API is exposed via **Server Actions** (not REST). The following **Route Handlers** exist for features that need a HTTP endpoint:

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/[...nextauth]` | Auth.js handler |
| `GET /api/quotations/[id]/pdf` | Quotation PDF |
| `GET /api/invoices/[id]/pdf` | Invoice PDF |
| `GET /api/payments/[id]/pdf` | Official Receipt PDF |
| `GET /api/search` | Global cross-entity search (business-scoped) |
| `GET /api/pipeline/search` | Pipeline record lookup |
| `GET /api/businesses` | List businesses for current user |
| `POST /api/businesses/create` | Create a new business |
| `POST /api/business/switch` | Switch active business (sets cookie) |
| `GET /api/notifications` | List notifications |
| `GET /api/notifications/unread` | Unread count |
| `PATCH /api/notifications/[id]` | Mark as read |
| `GET /api/messages/conversations` | List conversations |
| `POST /api/messages/send` | Send message |
| `GET /api/messages/unread` | Unread message count |
| `GET /api/messages/users` | Messageable users |
| `GET/POST /api/messages/groups` | Group conversations |
| `POST /api/upload/document-asset` | Upload logo/signature |
| `POST /api/upload/payment-proof` | Upload payment proof |

---

## Installation

### Prerequisites

- **Node.js** 20+
- **pnpm** (lockfile committed)
- **MariaDB** 10.6+ (or MySQL 8+)
- **Google Chrome** (for PDF generation via puppeteer-core)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/crm-sales.git
cd crm-sales

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and auth secret

# 4. Create the database
mysql -u root -p -e "CREATE DATABASE crm_sales;"

# 5. Push the Prisma schema (uses db push — no migration files)
pnpm db:push

# 6. Seed demo data
pnpm db:seed

# 7. Start the development server
pnpm dev
```

The application runs at `http://localhost:3000`.

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | MariaDB connection string | `mysql://root:password@localhost:3306/crm_sales` |
| `AUTH_SECRET` | JWT signing secret (min 32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` |

### Useful Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm format` | Format with Prettier |

---

## Default Users

After seeding, these demo accounts are available (password: `password123`):

| Name | Email | Role | Businesses |
|---|---|---|---|
| System Admin | `admin@crm.local` | Admin | Apex Business Solutions, Apex Logistics |
| Carlos Reyes | `carlos.reyes@crm.local` | Sales Manager | Apex Business Solutions |
| John Cruz | `john.cruz@crm.local` | Sales Rep | Apex Business Solutions |
| Maria Santos | `maria.santos@crm.local` | Sales Rep | Apex Business Solutions |

**Seeded businesses:** *Apex Business Solutions* (primary) and *Apex Logistics* (Admin-only demo business).

> Quick Login buttons appear on the login page when `NODE_ENV=development`.

---

## Developer Guide

### Coding Standards

- **TypeScript strict** — no `any`, no `@ts-ignore`, no `@ts-expect-error`.
- **Parse, don't validate** — Zod schemas parse all inputs server-side; types are inferred from schemas.
- **Feature-driven structure** — each domain has `actions/`, `services/`, `repositories/`, `schemas/`, `constants.ts`. Server Actions are thin wrappers that call `requirePermission()` then delegate to a service.
- **Typed errors** — `AppError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `ValidationError` (in `src/lib/errors.ts`).
- **Server Components by default** — use `"use client"` only for forms and interactivity.
- **Tailwind utility classes** — brand palette: Orange `#DF853A`, Navy `#103447`, Steel Blue `#1A5366`.

### Business Isolation Expectations

- Every new entity **must** carry a `businessId` (indexed). Set it from `getCurrentBusinessId()`.
- Every repository query **must** apply `getBusinessScopeFilter()` unless it intentionally crosses businesses (Admin-only).
- Every Server Action **must** call `requirePermission()` before writing.
- Every cross-business action **must** verify `canAccessBusiness(userId, businessId)`.

### Role-Aware Development

- Gate UI with `hasPermission(permissions, "resource:action")`.
- Gate routes via `ROUTE_PERMISSIONS` (middleware reads this automatically).
- Scope repository reads with `scopeUserId` for Sales Reps.
- Assert ownership on detail pages with `assertOwnership()`.

### Dashboard Widget Architecture

- **Widget catalog** — `src/features/dashboard/widget-catalog.tsx` defines every widget: `id`, `name`, `description`, `span` (`full` / `half`), default order per context, and a faithful preview renderer for the Customize page.
- **Four contexts** — `employee`, `manager`, `admin-business`, `admin-executive` (resolved by `resolveDashboardContext()`).
- **Preferences** — stored per-user per-context in `Setting` as `dashboard_pref_{userId}_{context}`; reconciled against the catalog on load.
- **Grid** — `DashboardWidgetGrid` renders visible widgets in a dense CSS grid; hidden widgets leave no gaps.

### Branch & Commit Conventions

```
feature/<short-description>      # New feature
fix/<short-description>          # Bug fix
refactor/<short-description>     # Refactor
docs/<short-description>         # Documentation
```

```
feat: add quotation acceptance modal
fix: scope audit logs for managers
refactor: consolidate settings into edit company details
docs: rewrite README for current architecture
```

### Pull Request Workflow

1. Branch from `main`.
2. Implement with tests where applicable.
3. Ensure `pnpm lint` and `tsc --noEmit` pass clean.
4. Verify the feature in the browser.
5. Open a PR describing what changed and why.

---

## License

This project is licensed under the MIT License.

---

_Built with [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/), [Tailwind CSS](https://tailwindcss.com/), [MariaDB](https://mariadb.org/), and [Auth.js](https://authjs.dev/)._
