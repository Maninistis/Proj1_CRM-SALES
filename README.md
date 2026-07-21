# CRM + Sales Management System

A modern, full-stack CRM and Sales Management platform that tracks every customer relationship from initial Lead through to final Delivery. Built for small-to-medium enterprises (SMEs) with an architecture designed to scale into a multi-business organization platform.

The system standardizes the entire sales workflow — Lead → Opportunity → Quotation → Customer → Sales Order → Invoice → Payment → Delivery — ensuring no step is skipped, no data is re-entered, and every team member knows exactly where each deal stands.

### Goals

- **Organize** customer relationships in a single source of truth
- **Standardize** the sales workflow with enforced business rules
- **Eliminate** manual paperwork through intelligent form pre-fill
- **Track** every customer from first contact to final delivery
- **Generate** professional business documents (quotations, invoices, receipts)
- **Support** multiple employee roles with granular permissions
- **Scale** into a multi-business platform with independent branding

---

## Features

### Dashboard

- Revenue trend chart with interactive tooltips and growth indicators
- KPI cards (total leads, opportunities, pipeline value, monthly revenue)
- Pipeline widget showing deal distribution across all stages
- Quick Actions panel with onboarding checklist for new installations
- Pending invoices and top customers widgets
- Data is scoped to the user's role (Sales Reps see only their own data)
- *more to be added

### Lead Management

- Capture leads with first/last name, company, email, phone, source, and notes
- Status workflow: NEW → CONTACTED → QUALIFIED → CONVERTED / DISQUALIFIED
- Assign leads to Sales Representatives
- Soft-delete with restore capability
- Pipeline scoping: Sales Reps only see leads assigned to or created by them

### Opportunity Management

- Create opportunities from qualified leads
- Track estimated value and expected close date
- Status workflow: OPEN → IN PROGRESS → CLOSED_WON / CLOSED_LOST
- Pre-filled from lead data when converting

### Quotation Management

- Build quotations with multiple line items (description, quantity, unit price, discount %)
- Automatic subtotal, discount, tax, and grand total computation
- Status workflow: DRAFT → READY → SENT → ACCEPTED / REJECTED / EXPIRED
- Print-friendly quotation view at `/quotations/[id]/print`
- PDF download at `/api/quotations/[id]/pdf`
- Quotation acceptance enforces Customer creation before Sales Order conversion
- Quotation document inherits all Document Settings (logo, branding, terms, payment info)

### Customer Management

- Full customer database with billing/shipping addresses and contacts
- Status workflow: NEW → ACTIVE → INACTIVE / BLOCKED
- Credit limit and payment terms tracking
- Linked to originating Lead
- Duplicate email and duplicate lead prevention
- Soft-delete frees the lead for re-creation (no workflow lock)

### Products & Services

- Product catalog with name, description, default price, and category
- Active/inactive toggle
- Used as quick-fill catalog when building quotations and sales orders

### Sales Orders

- Create from accepted quotations with full pre-fill
- Customer validation: must be ACTIVE
- Quotation validation: must be ACCEPTED and not already converted
- Line items with computed totals
- Status workflow: AWAITING_PAYMENT → PARTIALLY_PAID → FULLY_PAID → DELIVERED → COMPLETED (plus CANCELLED as non-lifecycle terminal). Statuses are derived from workflow events (payments, delivery), not edited manually.

### Invoices

- Generate from confirmed Sales Orders
- Customer snapshot (name, email, phone, address) captured at creation
- Status workflow: OPEN → PARTIALLY_PAID → PAID (terminal: OVERDUE, VOIDED). Invoice statuses represent financial state only — never operational fulfillment.
- Paid amount tracking
- PDF generation and print view

### Payments

- Record payments against invoices
- Payment methods: CASH, CHECK, BANK_TRANSFER, CREDIT_CARD
- Conditional validation based on method (CASH = optional reference/proof; others = required)
- Payment proof upload
- Payment history per invoice
- Official Receipt PDF generation

### Delivery Notes

- Create from Sales Orders via the "Create Delivery Note" button on SO detail page
- Delivery requires full payment (`requireFullPayment: true`) — validated server-side
- Accepts Sales Orders in PARTIALLY_PAID, FULLY_PAID, or DELIVERED status (per business Delivery Payment Policy)
- Track carrier and tracking number
- Line items derived from Sales Order items with remaining quantity calculation
- Auto-transitions SO status: DN → DELIVERED triggers SO → DELIVERED; DN → ACKNOWLEDGED triggers SO → COMPLETED

### Pipeline Tracking

- Visual pipeline showing all active deals across 8 stages
- Stage completion indicators (Lead, Opportunity, Quotation, Customer, Sales Order, Invoice, Payment, Delivery)
- Payment progress bar: "Received X / Y"
- Search and filter by lead name, stage, or status
- Click any stage to jump to the relevant entity
- Real-time synchronization with database state

### Messaging

- Floating messaging widget accessible from any page
- Unread message badge
- Manager ↔ Employee direct messaging
- Conversation list with latest message preview
- Real-time polling for new messages

### Notifications

- Notification bell with unread count
- Payment received alerts
- Invoice overdue warnings
- New lead assignment notifications
- *to be refined

### User Management

- Create users with role assignment (Admin, Sales Manager, Sales Rep)
- Profile picture upload
- Temporary password with "require change on first login" flag
- Direct manager assignment for Sales Reps
- Soft-deactivate (set to INACTIVE)
- My Profile page for self-service personal info and password changes

### Audit Logs

- Every CRUD operation logged with previous/new state
- User attribution on every action
- Searchable by entity type or free text
- Scoped for Managers (only their team's actions)

### Document Settings

- Company logo and signature image upload
- Invoice prefix configuration
- Receipt prefix configuration
- Default tax rate
- Terms and conditions text
- Payment instructions
- Used as branding in all generated PDFs

### Business Settings

- Company name, default currency, tax rate, payment terms

### Responsive Design

- Collapsible sidebar with mobile drawer
- Responsive data tables with wrapping pagination
- Adaptive dashboard layout (grid collapses on mobile)
- KPI cards with text truncation
- Touch-friendly controls

---

## Pipeline Workflow

The CRM enforces a strict sequential workflow. Each stage must be completed before the next unlocks.

```
Lead ──→ Opportunity ──→ Quotation ──→ Customer ──→ Sales Order ──→ Invoice ──→ Payment ──→ Delivery
 │           │               │              │              │             │           │
 │           │               │              │              │             │           │
 └─ Convert  └─ Create Quote  └─ Accept     └─ Required    └─ Generate   └─ Record   └─ Requires
    to Opp      from Opp        then           before SO      Invoice       Payment     Full Payment
                                create         conversion
                                Customer
```

### Key Workflow Rules

| Rule | Enforcement |
|---|---|
| Opportunity requires a qualified Lead | Backend + Frontend |
| Quotation requires a CLOSED_WON Opportunity | Backend + Frontend |
| Customer required before Sales Order | Modal dialog + backend validation |
| Sales Order requires ACCEPTED Quotation + ACTIVE Customer | Backend + Frontend |
| Invoice generates from confirmed Sales Order | Backend |
| Payment unlocks when invoice is issued | Backend |
| Delivery requires full payment | Backend (`delivery-policy.ts`) |
| Deleting a Customer frees the workflow for re-creation | Backend (nulls `leadId`) |

### Intelligent Pre-fill

Every transition between stages pre-fills the next form using data from the previous entity:

- **Lead → Opportunity**: Title from company name, assignment carried over
- **Opportunity → Quotation**: Subject, valid-until date, notes
- **Quotation → Customer**: Name, email, phone from originating lead
- **Quotation → Sales Order**: All line items, pricing, discounts, tax rate, customer auto-selected
- **Sales Order → Invoice**: All line items, customer snapshot, pricing
- **Sales Order → Delivery Note**: Line items with quantities

---

## Role-Based Access Control

### System Admin

Full system access. Can manage users, roles, settings, and all business data.

### Sales Manager (Business Administrator)

Manages Sales Representatives and their team's data. Cannot access role management or system-wide configuration.

| Capability | Admin | Manager | Sales Rep |
|---|:---:|:---:|:---:|
| Dashboard & Reports | ✅ | ✅ | ✅ |
| Manage Leads | ✅ | ✅ | ✅ (own only) |
| Manage Opportunities | ✅ | ✅ | ✅ (own only) |
| Manage Quotations | ✅ | ✅ | ✅ (own only) |
| Manage Customers | ✅ | ✅ | ✅ (own only) |
| Manage Sales Orders | ✅ | ✅ | ✅ (own only) |
| Manage Invoices | ✅ | ✅ | ✅ (own only) |
| Manage Payments | ✅ | ✅ | ✅ (own only) |
| Manage Delivery Notes | ✅ | ✅ | ✅ (own only) |
| Create/Edit Sales Reps | ✅ | ✅ | ❌ |
| Change User Roles | ✅ | ❌ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ (team only) | ❌ |
| Edit Settings | ✅ | ✅ | ❌ |
| Delete Records | ✅ | ✅ | ❌ |

### Data Scoping

- **Sales Reps** only see records they created or were assigned (leads, opportunities, quotations, customers, sales orders, invoices, payments, delivery notes)
- **Managers** see all records + manage their team of Sales Reps
- **Admins** see everything
- Scoping is enforced at the repository layer (`scopeUserId`) and verified with `assertOwnership()` on detail pages

---

## Multi-Business Architecture

> **Status: 🚧 Planned / Partially Scaffolded**

The system is architected to support a multi-business model:

- **One login, multiple businesses** — a user authenticates once and can switch between businesses
- **Independent branding** — each business has its own logo, document settings, and prefixes
- **Independent dashboards** — analytics and KPIs are scoped per business
- **Independent employees** — a Sales Rep in Business A has no visibility into Business B
- **Business-scoped documents** — quotation, invoice, and receipt numbers are prefixed per business

The database schema includes `Conversation` and `Message` models with user-pair relations that support business-isolated communication. The core CRM entities (Lead, Customer, SalesOrder, etc.) are currently single-tenant but designed for future business partitioning.

---

## Messaging

A floating messaging widget is available on every dashboard page:

- **Conversation list** — shows all direct message threads
- **Real-time polling** — checks for new messages every few seconds
- **Unread badge** — notification bell shows unread count
- **Manager ↔ Employee** — managers can message their direct reports
- **Business-isolated** — conversations are between authenticated users only

API endpoints: `/api/messages/conversations`, `/api/messages/send`, `/api/messages/unread`, `/api/messages/users`

---

## Document Generation

### Supported Documents

| Document | Generation | PDF |
|---|---|---|
| Quotation | Print view at `/quotations/[id]/print` | `/api/quotations/[id]/pdf` |
| Invoice | Print view at `/invoices/[id]/print` | `/api/invoices/[id]/pdf` |
| Official Receipt | Print view at `/payments/[id]/print` | `/api/payments/[id]/pdf` |
| Delivery Note | Planned | Planned |

### PDF Generation Pipeline

- Uses `puppeteer-core` with headless Chrome (`/usr/bin/google-chrome`)
- Server-side rendering with cookie forwarding for authentication
- Document Settings (logo, signature, terms, prefixes) injected into templates
- Automatic document numbering with configurable prefixes (QUO, INV, OR, etc.)

### Document Settings

Configurable at `/settings/documents`:

- Company logo upload
- Authorized signature image upload
- Invoice number prefix
- Receipt number prefix
- Default tax rate
- Terms and conditions text
- Payment instructions

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.2 | App Router, RSC, Turbopack |
| [React](https://react.dev/) | 19.2 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first styling |
| [base-ui](https://base-ui.com/) (@base-ui/react) | 1.6 | Headless UI primitives (Dialog, Select, Dropdown) |
| [Radix UI](https://www.radix-ui.com/) | — | Label, Slot primitives |
| [Lucide Icons](https://lucide.dev/) | 1.23 | Icon library |
| [Sonner](https://sonner.emilkowal.ski/) | 2.x | Toast notifications |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4 | Theme management |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Next.js Server Actions | — | API layer (no separate REST backend) |
| [Auth.js (NextAuth v5)](https://authjs.dev/) | 5.0.0-beta | JWT-based authentication |
| [bcryptjs](https://github.com/dy/bcryptjs) | 3.x | Password hashing |
| [Zod](https://zod.dev/) | 4.x | Schema validation (client + server) |
| [React Hook Form](https://react-hook-form.com/) | 7.x | Form state management |

### Database

| Technology | Version | Purpose |
|---|---|---|
| [MariaDB](https://mariadb.org/) | 10.x+ | Relational database |
| [Prisma ORM](https://www.prisma.io/) | 7.8 | Schema, migrations, queries |
| [@prisma/adapter-mariadb](https://www.npmjs.com/package/@prisma/adapter-mariadb) | 7.8 | MariaDB driver adapter |

### Tooling

| Technology | Version | Purpose |
|---|---|---|
| [Vitest](https://vitest.dev/) | 4.x | Test runner |
| [ESLint](https://eslint.org/) | 9.x + eslint-config-next | Linting |
| [Prettier](https://prettier.io/) | 3.x | Code formatting |
| [puppeteer-core](https://pptr.dev/) | 25.x | PDF generation |
| [shadcn/ui](https://ui.shadcn.com/) | 4.x | Component CLI/code generator |
| [class-variance-authority](https://cva.style/) | 0.7 | Variant styling |
| [TanStack Table](https://tanstack.com/table) | 8.x | Data tables |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, register)
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── pipeline/             # Pipeline visualization
│   │   ├── leads/                # Lead management (list, new, [id])
│   │   ├── opportunities/        # Opportunity management
│   │   ├── quotations/           # Quotation management + print + PDF download
│   │   ├── customers/            # Customer management
│   │   ├── sales-orders/         # Sales Order management
│   │   ├── sales-invoices/       # Invoice management + print
│   │   ├── payments/             # Payment management + print
│   │   ├── delivery-notes/       # Delivery Note management
│   │   ├── products/             # Product catalog
│   │   ├── users/                # User management (Admin/Manager)
│   │   ├── roles/                # Role management (Admin only)
│   │   ├── audit-logs/           # Audit trail
│   │   ├── settings/             # Business + Document settings
│   │   ├── profile/              # My Profile (self-service)
│   │   └── layout.tsx            # Dashboard layout (sidebar, topbar)
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # Auth.js handler
│   │   ├── invoices/[id]/pdf/    # Invoice PDF generation
│   │   ├── quotations/[id]/pdf/  # Quotation PDF generation
│   │   ├── payments/[id]/pdf/    # Official Receipt PDF generation
│   │   ├── messages/             # Messaging API
│   │   ├── pipeline/             # Pipeline search API
│   │   └── upload/               # File upload (images, payment proofs)
│   └── layout.tsx                # Root layout
│
├── features/                     # Feature modules (domain-driven)
│   ├── lead/                     # Lead domain
│   │   ├── actions/              # Server Actions
│   │   ├── repositories/         # Data access
│   │   ├── schemas/              # Zod validation
│   │   ├── services/             # Business logic
│   │   └── constants.ts          # Status labels, options
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
│   ├── dashboard/
│   ├── pipeline/
│   ├── messaging/
│   ├── audit-log/
│   ├── document-settings/
│   └── setting/
│
├── components/                   # Shared UI components
│   ├── ui/                       # Base UI primitives (button, card, dialog, etc.)
│   ├── forms/                    # Form helpers (money-input, phone-input, etc.)
│   ├── layout/                   # Sidebar, topbar, profile dock
│   ├── data-table/               # Generic data table with pagination
│   ├── pipeline/                 # Pipeline visualization components
│   ├── documents/                # PDF/print document templates
│   └── [feature]/                # Feature-specific components
│
├── lib/                          # Cross-cutting utilities
│   ├── auth/                     # Auth config, permissions, data-scope
│   ├── audit.ts                  # Audit log helper
│   ├── prisma.ts                 # Prisma client singleton
│   ├── errors.ts                 # Error hierarchy (AppError, NotFound, etc.)
│   ├── pagination.ts             # Pagination utilities
│   ├── document-number.ts        # Auto-incrementing document numbers
│   └── workflow/                 # Workflow mappers, delivery policy
│
├── config/                       # Configuration
│   ├── nav.ts                    # Navigation structure + permissions
│   └── env.ts                    # Environment variable validation
│
└── middleware.ts                 # Auth + route permission middleware
```

---

## Installation

### Prerequisites

- **Node.js** 20+
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

# 5. Push the Prisma schema (no migration files — uses db push)
npx prisma db push

# 6. Seed the database with demo data
npx prisma db seed

# 7. Start the development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | MariaDB connection string | `mysql://root:password@localhost:3306/crm_sales` |
| `AUTH_SECRET` | JWT signing secret (min 32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` |

---

## Default Users

After seeding, the following demo accounts are available:

| Role | Email | Password |
|---|---|---|
| System Admin | `admin@crm.local` | `password123` |
| Sales Manager | `carlos.reyes@crm.local` | `password123` |
| Sales Rep | `john.cruz@crm.local` | `password123` |
| Sales Rep | `maria.santos@crm.local` | `password123` |

> Quick Login buttons appear on the login page when `NODE_ENV=development`.

---

## Workflow Automation

The CRM automates data flow between workflow stages so users never re-enter information:

```
Lead                →  Pre-fills Opportunity (title, assignment)
Opportunity         →  Pre-fills Quotation (subject, valid-until, notes)
Quotation Accepted  →  Enforces Customer creation (modal if missing)
Quotation + Customer → Pre-fills Sales Order (items, pricing, customer)
Sales Order         →  Pre-fills Invoice (items, customer snapshot, totals)
Invoice             →  Accepts Payments (tracks paid/partial/overdue)
Full Payment        →  Unlocks Delivery Note creation
```

### Quotation Acceptance Flow

When a quotation is accepted, the system checks whether a Customer record exists for the workflow's lead:

- **Customer exists** → "Convert to Sales Order" available immediately
- **No customer** → Dialog prompts user to create one → navigates to pre-filled form → returns automatically on success → "Convert to Sales Order" becomes available

### Pipeline Synchronization

The pipeline page reflects real-time database state:

- Deleting a Customer resets the Customer stage and locks downstream stages
- No manual refresh or cache clearing required
- Payment stage only marks complete when invoice is fully paid

---

## Security

### Authentication

- Auth.js (NextAuth v5) with JWT strategy
- bcrypt password hashing (12 rounds)
- Middleware enforces route-level permissions on every request
- Session includes `userId`, `roleId`, and `permissions[]`

### Authorization

- **Frontend**: Menu items, buttons, and forms conditionally rendered based on permissions
- **Backend**: Every Server Action and service method calls `requirePermission(session, "resource:action")`
- **Data scoping**: Repository queries filtered by `scopeUserId` for Sales Reps
- **Ownership checks**: `assertOwnership()` on all detail pages

### Permission Enforcement

Permissions follow the format `resource:action` (e.g., `leads:create`). The wildcard `*` grants all permissions (Admin only). The middleware maps URL routes to required permissions via `ROUTE_PERMISSIONS`.

---

## Responsiveness

The CRM is fully responsive across device sizes:

| Breakpoint | Layout |
|---|---|
| Desktop (1280px+) | Full sidebar + multi-column grids |
| Laptop (1024-1279px) | Full sidebar + 2-column grids |
| Tablet (768-1023px) | Collapsible sidebar + responsive tables |
| Mobile (< 768px) | Drawer sidebar + stacked cards + wrapping pagination |

### Mobile Adaptations

- Sidebar collapses to icon-only, expands via drawer
- Data table pagination wraps to multiple lines
- Dashboard KPI cards truncate long text
- Topbar action icons push to the right edge
- Quotation acceptance dialog centers on screen

---

## Current Implementation Status

### Completed

- [x] Authentication (login, register, JWT sessions)
- [x] Dashboard (KPIs, revenue chart, pipeline widget, quick actions)
- [x] Lead Management (CRUD, status workflow, assignment)
- [x] Opportunity Management (CRUD, lead conversion)
- [x] Quotation Management (CRUD, line items, status workflow, acceptance flow)
- [x] Customer Management (CRUD, addresses, contacts, credit limits)
- [x] Products & Services catalog
- [x] Sales Orders (CRUD, quotation conversion, pre-fill)
- [x] Invoices (generation from SO, customer snapshot, print, PDF)
- [x] Payments (recording, proof upload, conditional validation, Official Receipt PDF)
- [x] Delivery Notes (CRUD, full-payment requirement)
- [x] Pipeline Tracking (8-stage visualization, search, stage completion)
- [x] Role-Based Access Control (3 roles, 40+ permissions, data scoping)
- [x] User Management (Admin creates/manages; Managers manage their Reps)
- [x] My Profile (self-service info + password change)
- [x] Audit Logs (scoped per role)
- [x] Document Settings (logo, signature, prefixes, terms)
- [x] PDF Generation (Quotations, Invoices, Official Receipts via puppeteer-core)
- [x] Messaging (floating widget, conversations, unread badge)
- [x] Notifications (bell with unread count)
- [x] Responsive UI (desktop through mobile)
- [x] File Upload (document assets, payment proofs)
- [x] Automatic Document Numbering (QUO, INV, OR, CUST, SO, DN, LEAD)
- [x] Intelligent Form Pre-fill (all 7 workflow transitions)
- [x] Workflow Integrity (Customer required before SO, full payment before Delivery)

### In Progress

- [ ] Multi-Business Architecture (schema scaffolded, single-tenant currently)
- [ ] Advanced Dashboard Analytics (custom date ranges, exportable reports)
- [ ] Delivery Note PDF generation

---

## Roadmap

### Near-Term

- **Advanced Dashboard Analytics** — Custom date ranges, cohort analysis, exportable CSV/PDF reports
- **Delivery Note PDFs** — Extend the puppeteer pipeline to delivery notes
- **Email Integration** — Send quotations and invoices via email with tracking
- **Task Management** — Assign follow-up tasks with due dates and reminders

### Mid-Term

- **Calendar Integration** — Schedule meetings, calls, and follow-ups
- **Customer Portal** — Let customers view their invoices, pay online, and track deliveries
- **Inventory Management** — Track stock levels, auto-deduct on delivery
- **Multi-Business** — Business switcher, independent branding, scoped data
- **Advanced Reporting** — Sales rep performance, conversion funnels, revenue forecasting

### Long-Term

- **Accounting Integration** — Sync with Xero, QuickBooks, or SAP
- **Mobile Application** — Native iOS/Android app for field reps
- **AI Sales Assistant** — Lead scoring, next-best-action recommendations, automated follow-ups
- **API Platform** — Public REST/GraphQL API for third-party integrations
- **Workflow Builder** — Custom pipeline stages and business rules per business

---

## Screenshots

> Screenshots will be added here.

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Pipeline
![Pipeline](docs/screenshots/pipeline.png)

### Lead Management
![Leads](docs/screenshots/leads.png)

### Sales Orders
![Sales Orders](docs/screenshots/sales-orders.png)

### Invoices
![Invoices](docs/screenshots/invoices.png)

### Payments
![Payments](docs/screenshots/payments.png)

### Messaging
![Messaging](docs/screenshots/messaging.png)

### Document Generation
![Invoice PDF](docs/screenshots/invoice-pdf.png)

---

## Contributing

### Coding Standards

- **TypeScript** — Strict mode, no `any`, no `@ts-ignore`
- **Validation** — Zod schemas for all inputs, parsed server-side
- **Architecture** — Feature-driven structure: `actions/`, `repositories/`, `schemas/`, `services/` per domain
- **Error Handling** — Typed errors (`AppError`, `NotFoundError`, `ConflictError`, `ForbiddenError`)
- **Security** — Every server action calls `requirePermission()`; repositories accept `scopeUserId`
- **Components** — Server Components by default; `"use client"` only when needed (forms, interactivity)
- **Styling** — Tailwind utility classes; brand colors: Orange `#DF853A`, Navy `#103447`, Steel Blue `#1A5366`

### Branch Naming

```
feature/<short-description>      # New feature
fix/<short-description>          # Bug fix
refactor/<short-description>     # Code refactoring
docs/<short-description>         # Documentation
```

### Commit Conventions

```
feat: add quotation acceptance modal
fix: prevent customer re-creation after deletion
refactor: scope audit logs for managers
docs: update README with workflow diagram
```

### Pull Request Workflow

1. Create a branch from `main`
2. Implement changes with tests where applicable
3. Ensure `tsc --noEmit` passes with no errors
4. Verify the feature works in the browser
5. Open a PR with a clear description of what changed and why

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Built with [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/), [Tailwind CSS](https://tailwindcss.com/), and [Auth.js](https://authjs.dev/).
