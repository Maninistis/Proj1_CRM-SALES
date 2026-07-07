# crm-sales-architecture - Work Plan

## TL;DR (For humans)

**What you'll get:** A complete architecture blueprint and 47-task implementation roadmap for a production CRM + Sales Management System, running on localhost. The blueprint covers 18 design areas — architecture, domain models with explicit state machines, database design with ERD, API contracts, UI architecture, authentication, testing, security, scalability, and more. The 47 tasks are organized into 12 phases (Setup → Auth → System → CRM: Lead/Opportunity/Quotation/Customer → Sales: Order/Delivery/Invoice/Payment → Dashboard), each with exact file paths, acceptance criteria, and test scenarios that an AI coding agent can execute in isolation. Reporting and Deployment phases are documented but deferred until after senior review.

**Why this approach:** Feature-based layered architecture — each business domain is a self-contained module with its own UI, API, service, repository, and validation layers. This lets builder agents work on one feature without touching unrelated files, minimizes merge conflicts, and mirrors how a real ERP is structured. The CRM module completes before Sales begins, so no phase ever goes back to modify a completed model. Auth.js v5 and Docker self-hosted were chosen as foundational decisions because they're hard to reverse and affect every subsequent choice.

**What it will NOT do:** No implementation code, Prisma schema, or React components — this is a plan document only. No multi-tenancy, Redis, advanced rate limiting, OAuth, MFA, React Query, or cursor pagination in the initial build — all documented as future enhancements. No Result<T>/Either pattern — conventional exception handling is used throughout. No deployment, reporting, or E2E tests in the initial build — deferred per user decision until after senior review.

**Effort:** Large — 12 phases, 47 implementation tasks, each with references + acceptance + QA + commit.
**Risk:** Medium — state machine complexity across 8 entities and auto-status logic in the Sales chain (DeliveryNote → Invoice → Payment → SalesOrder completion) are the main drivers.
**Decisions to sanity-check:** Auth.js v5 with JWT strategy (not database sessions). Docker self-hosted (not Vercel). Conventional exceptions with try/catch (not Result<T>). Offset pagination (not cursor). Manual soft-delete filtering (no Prisma query extensions). cuid primary keys + human-readable document numbers. No tenantId in initial schema.

Your next move: Review the plan below. When satisfied, run `/start-work` to begin execution, or ask for a high-accuracy review first.

---

> TL;DR (machine): Large effort, Medium risk, 47 todos across 12 phases (Phases 13-14 deferred), CRM+Sales ERP architecture blueprint with Auth.js v5 + Prisma/MariaDB + Next.js 15 App Router. Localhost-only development.

## Scope
### Must have
- A comprehensive architecture blueprint covering all 18 specified sections, written as a single decision-complete plan document.
- Feature-based folder structure with layered architecture (Route Handler / Server Action -> Service -> Repository -> Prisma).
- Explicit lifecycle state machines with allowed transitions for all 8 business entities (Lead, Opportunity, Quotation, Customer, SalesOrder, DeliveryNote, SalesInvoice, Payment).
- Four diagrams in ASCII/Markdown: ERD, module dependency graph, request flow diagram, folder structure tree.
- 14-phase implementation roadmap with 40-60 decision-complete todos, each carrying references, agent-executable acceptance criteria, happy+failure QA scenarios, and a commit line.
- Auth.js v5 with Prisma adapter, JWT strategy, RBAC via Role-Permission M2M.
- Docker self-hosted deployment (Node.js runtime, standard Prisma connection pool, docker-compose).
- cuid() primary keys + human-readable document numbers for business documents (LEAD-0001, QUO-0001, SO-0001, DN-0001, INV-0001, PAY-0001).
- createdAt + updatedAt on all domain tables; deletedAt soft-delete where appropriate (manual filtering, NO Prisma query extensions); createdById only where it has business value.
- Zod schemas shared between React Hook Form (client) and Server Actions / Route Handlers (server).
- Conventional exception handling (try/catch + throw + error.tsx boundaries) in the service layer.
- Offset pagination initially; cursor pagination documented as a future scalability improvement.
- ERP scalability migration paths documented (Inventory, Purchasing, Accounting, Warehouses, Multi-company, REST API, Mobile, Microservices).

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NO implementation code (no React components, no Prisma schema, no API handlers, no service/repository bodies).
- NO tenantId or multi-tenancy fields in the initial schema design; multi-tenancy is documented as a future enhancement only.
- NO Redis, no advanced rate limiting, no message queues in the initial architecture; deferred to future enhancements.
- NO Result<T> / Either pattern for error handling; use conventional exceptions (throw + try/catch).
- NO automatic Prisma query extensions or middleware for soft-delete filtering; soft delete is manual (explicit where clauses or scoped repository methods).
- NO cursor-based pagination in the initial build; offset pagination only.
- NO OAuth providers or MFA in the initial auth design; credentials provider only, OAuth/MFA documented as future extensions.
- NO React Query / TanStack Query in the initial state management; Server Components + Server Actions + revalidatePath only.
- NO monorepo (Turborepo, Nx); single Next.js application.
- NO GraphQL; REST Route Handlers + Server Actions only.
- NO more than 60 implementation todos; the plan must stay in the 40-60 range.
- NO deployment (Dockerfile, docker-compose, production build) in the initial build — deferred per user decision. The project runs on localhost (`pnpm dev`) only.
- NO Reporting module (Phase 13) in the initial build — deferred per user decision. Will be added after senior review.
- NO E2E testing (Playwright) in the initial build — deferred per user decision. Unit + integration tests (Vitest) only.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after + framework = Vitest (unit + integration), MSW (API mocking). Playwright E2E deferred per user decision.
- Evidence: .omo/evidence/task-<N>-crm-sales-architecture.<ext>
- Every implementation todo specifies happy-path + failure-path QA scenarios with the exact tool and invocation. The executor runs the QA and writes evidence to the path above.
- State machine correctness is verified by unit tests asserting that disallowed transitions throw and allowed transitions persist.
- API contracts are verified by integration tests that call the Route Handler / Server Action and assert the response shape and status.
- E2E tests cover one full workflow per module: Lead->Opportunity->Quotation->Customer (CRM), Customer->SalesOrder->DeliveryNote->SalesInvoice->Payment (Sales).

## Execution strategy
### Parallel execution waves
> Target 5-8 todos per wave. Fewer than 3 (except the final) means under-splitting.

The 14 phases map to execution waves. Within each phase, the service layer, repository layer, and UI layer can be parallelized once the Prisma model and Zod schema are in place. The dependency matrix below defines the exact ordering.

**Wave mapping (12 waves, 47 todos total):**

| Wave | Phase | Todos | Description |
| --- | --- | --- | --- |
| 1 | Phase 1: Project Setup | 1-4 | Next.js 15 scaffold, Prisma+MariaDB config, shadcn/ui, ESLint/Prettier/Vitest |
| 2 | Phase 2: Auth Foundation | 5-8 | Auth.js v5, Prisma adapter schema, RBAC middleware, login/register pages |
| 3 | Phase 3: System Module | 9-12 | Users CRUD, Roles+Permissions, AuditLog, Settings, shared layout (sidebar, nav, dashboard shell) |
| 4 | Phase 4: CRM Lead | 13-16 | Lead model, schema, service+repository, Lead list+form pages |
| 5 | Phase 5: CRM Opportunity | 17-20 | Opportunity model (FK to Lead), Lead->Opportunity conversion, list+form pages |
| 6 | Phase 6: CRM Quotation | 21-24 | Quotation model (FK to Opportunity), line items, totals calculation, list+form pages |
| 7 | Phase 7: CRM Customer | 25-28 | Customer model, contacts+addresses, list+form pages |
| 8 | Phase 8: Sales Order | 29-32 | SalesOrder model (FK to Customer), Quotation->SalesOrder conversion, line items, auto-status |
| 9 | Phase 9: Delivery Note | 33-36 | DeliveryNote model (FK to SalesOrder), partial delivery, qty validation |
| 10 | Phase 10: Sales Invoice | 37-40 | SalesInvoice model (FK to SalesOrder), due date calc, paidAmount tracking |
| 11 | Phase 11: Payment | 41-44 | Payment model (FK to SalesInvoice), invoice reconciliation, SO completion |
| 12 | Phase 12: Dashboard | 45-47 | KPI cards, recent activity feed, pipeline summary charts |
| — | Phase 13: Reporting | DEFERRED | Deferred per user decision — add after senior review |
| — | Phase 14: Deployment | DEFERRED | Deferred per user decision — localhost only for now |

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 (Next.js scaffold) | - | 2, 3, 4 | - |
| 2 (Prisma+MariaDB) | 1 | 5, 9, 13 | 3, 4 |
| 3 (shadcn/ui setup) | 1 | 7, 8, 12, 13 | 2, 4 |
| 4 (ESLint/Vitest) | 1 | all test-dependent todos | 2, 3 |
| 5 (Auth.js schema) | 2 | 6, 7, 8, 9 | - |
| 6 (RBAC middleware) | 5 | 9, 13, 17... | 7, 8 |
| 7 (login/register) | 5, 3 | 9 | 6, 8 |
| 8 (session/audit hook) | 5 | 9 | 6, 7 |
| 9 (Users CRUD) | 6, 8, 5 | 13, 17... | 10, 11, 12 |
| 10 (Roles+Permissions) | 6, 5 | 13, 17... | 9, 11, 12 |
| 11 (AuditLog) | 7, 5 | 13, 17... | 9, 10, 12 |
| 12 (Settings + Layout) | 3, 6 | 13, 17... | 9, 10, 11 |
| 13 (Lead model+schema) | 9, 10, 12 | 14, 15, 16 | - |
| 14 (Lead service+repo) | 13 | 15, 16 | - |
| 15 (Lead API+actions) | 14 | 16 | - |
| 16 (Lead UI pages) | 15, 3 | 17 | - |
| 17-20 (Opportunity) | 16 | 21-24 | - |
| 21-24 (Quotation) | 20 | 25-28 | - |
| 25-28 (Customer) | 24 | 29-32 | - |
| 29-32 (SalesOrder) | 28 | 33-36 | - |
| 33-36 (DeliveryNote) | 32 | 37-40 | - |
| 37-40 (SalesInvoice) | 36 | 41-44 | - |
| 41-44 (Payment) | 40 | 45-47 | - |
| 45-47 (Dashboard) | 44, 12 | - | - |

## Architecture Blueprint

This section is the authoritative architecture document. Builder agents reference it for every decision. It covers all 18 specified design areas.

---

### 1. Project Architecture

#### 1.1 Overall architecture

A **single Next.js 15 App Router application** with a strict **layered, feature-based architecture**. Each business domain (Lead, Opportunity, Quotation, etc.) is a self-contained feature module with its own UI, API, service, repository, and validation layers. Cross-cutting concerns (auth, layout, shared UI, utilities) live outside the feature modules.

**Layering contract (every request flows top-down, never skipping a layer):**

```
┌─────────────────────────────────────────────────────────┐
│                    UI LAYER                              │
│  Server Components (data fetch) / Client Components     │
│  (forms, tables, interactivity)                         │
├─────────────────────────────────────────────────────────┤
│              API LAYER (entry points)                    │
│  Server Actions (form mutations) / Route Handlers       │
│  (REST endpoints, webhooks)                             │
├─────────────────────────────────────────────────────────┤
│              VALIDATION LAYER                            │
│  Zod schemas (shared client + server)                   │
├─────────────────────────────────────────────────────────┤
│              SERVICE LAYER                               │
│  Business logic, state machine transitions,             │
│  cross-domain orchestration, authorization checks       │
├─────────────────────────────────────────────────────────┤
│              REPOSITORY LAYER                            │
│  Prisma data access, soft-delete filtering,             │
│  pagination, querying                                    │
├─────────────────────────────────────────────────────────┤
│              DATABASE LAYER                              │
│  Prisma ORM → MariaDB                                   │
└─────────────────────────────────────────────────────────┘
```

**Why this architecture:**
- **Feature-based over type-based**: co-locating all files for a domain (Lead schema, Lead service, Lead repository, Lead UI) means a builder agent can work on one feature without touching unrelated files. This minimizes merge conflicts and cognitive load.
- **Layered separation**: the service layer owns business rules and state transitions; the repository layer owns data access; the validation layer owns input shape. This makes each layer independently testable and swappable.
- **Server-first**: Next.js 15 Server Components fetch data directly through the service layer (no client-side fetching for initial render), reducing JavaScript shipped to the browser.
- **Conventional exceptions**: services throw typed errors; Server Actions and Route Handlers catch them and return appropriate HTTP/error responses. This is idiomatic JavaScript/TypeScript and avoids the ceremony of Result<T> wrappers.

#### 1.2 Folder structure

```
Proj1_CRM-SALES/
├── prisma/
│   ├── schema.prisma                 # Single schema file, organized by domain sections
│   ├── seed.ts                       # Seed data (roles, permissions, admin user, settings)
│   └── migrations/                   # Prisma migration history
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (login, register, forgot-password)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/              # Authenticated route group
│   │   │   ├── layout.tsx            # Dashboard shell (sidebar + topbar + content)
│   │   │   ├── dashboard/page.tsx    # Main dashboard
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx          # Lead list
│   │   │   │   ├── new/page.tsx      # New lead form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Lead detail
│   │   │   │       └── edit/page.tsx # Lead edit
│   │   │   ├── opportunities/        # Same pattern as leads
│   │   │   ├── quotations/
│   │   │   ├── customers/
│   │   │   ├── sales-orders/
│   │   │   ├── delivery-notes/
│   │   │   ├── sales-invoices/
│   │   │   ├── payments/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── settings/
│   │   │   └── reports/
│   │   ├── api/                      # Route Handlers (REST endpoints)
│   │   │   ├── leads/route.ts        # GET (list), POST (create)
│   │   │   ├── leads/[id]/route.ts   # GET, PUT, DELETE
│   │   │   └── ... (same pattern per domain)
│   │   ├── error.tsx                 # Root error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   ├── loading.tsx               # Root loading skeleton
│   │   └── layout.tsx                # Root layout (html, body, providers)
│   ├── features/                     # Feature modules (business logic + types + schemas)
│   │   ├── lead/
│   │   │   ├── schemas/              # Zod schemas (lead-create.ts, lead-update.ts, lead-query.ts)
│   │   │   ├── services/             # lead.service.ts (business logic, state transitions)
│   │   │   ├── repositories/         # lead.repository.ts (Prisma queries, soft-delete filter)
│   │   │   ├── types.ts              # Domain types, enums, state machine definitions
│   │   │   └── constants.ts          # Status labels, colors, config
│   │   ├── opportunity/              # Same internal structure
│   │   ├── quotation/
│   │   ├── customer/
│   │   ├── sales-order/
│   │   ├── delivery-note/
│   │   ├── sales-invoice/
│   │   ├── payment/
│   │   ├── user/
│   │   ├── role/
│   │   ├── audit-log/
│   │   ├── notification/
│   │   └── setting/
│   ├── components/                   # Shared UI components (not domain-specific)
│   │   ├── ui/                       # shadcn/ui primitives (button, input, dialog, etc.)
│   │   ├── layout/                   # sidebar.tsx, topbar.tsx, breadcrumb.tsx
│   │   ├── data-table/               # Reusable TanStack Table wrapper
│   │   ├── forms/                    # Reusable form components (form-field, select-field)
│   │   ├── status-badge.tsx          # Status badge system (maps status → color + label)
│   │   ├── empty-state.tsx           # Reusable empty state
│   │   ├── error-boundary.tsx        # Reusable error display
│   │   └── page-header.tsx           # Page title + actions wrapper
│   ├── lib/                          # Cross-cutting utilities and infrastructure
│   │   ├── auth/                     # Auth.js v5 config (auth.ts, auth.config.ts)
│   │   │   ├── auth.config.ts        # Auth.js configuration (providers, callbacks)
│   │   │   ├── auth.ts               # Exported handlers, signIn, signOut
│   │   │   ├── middleware.ts         # Next.js middleware (authN + coarse authZ)
│   │   │   └── permissions.ts        # Permission definitions and checker functions
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── errors/                   # Error classes (AppError, NotFoundError, ValidationError, etc.)
│   │   ├── utils.ts                  # cn(), formatDate(), formatCurrency(), etc.
│   │   ├── document-number.ts        # Document number generator (LEAD-0001, QUO-0001, etc.)
│   │   ├── pagination.ts             # Offset pagination helper (page, pageSize, total, totalPages)
│   │   └── audit.ts                  # Audit log helper
│   ├── hooks/                        # Shared React hooks (use-debounce, use-url-state, etc.)
│   ├── config/                       # App configuration (nav items, env vars, site config)
│   │   ├── nav.ts                    # Sidebar navigation config
│   │   ├── site.ts                   # Site metadata
│   │   └── env.ts                    # Validated environment variables (Zod)
│   ├── types/                        # Global TypeScript types (api.ts, common.ts)
│   └── middleware.ts                 # Root Next.js middleware (wraps auth middleware)
├── tests/                            # E2E tests (Playwright)
│   ├── e2e/
│   │   ├── crm-workflow.spec.ts      # Lead → Opportunity → Quotation → Customer
│   │   └── sales-workflow.spec.ts    # Customer → SO → DN → Invoice → Payment
│   └── playwright.config.ts
├── docker-compose.yml                # MariaDB + app + (optional) Redis
├── Dockerfile                        # Multi-stage Node.js build
├── .env.example                      # Template environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── vitest.config.ts
```

**Key decisions:**
- `src/app/` holds only routing, pages, and API entry points. Business logic lives in `src/features/`.
- `src/components/ui/` holds shadcn/ui primitives. Domain-specific components (LeadForm, OpportunityTable) live in `src/app/(dashboard)/<domain>/` or are co-located as needed.
- Each feature module has the same internal structure (`schemas/`, `services/`, `repositories/`, `types.ts`, `constants.ts`), so a builder agent always knows where to look.
- Tests are co-located: `src/features/lead/services/lead.service.test.ts`.

#### 1.3 Frontend architecture

- **Server Components (default)**: all list pages, detail pages, and dashboard fetch data server-side through the service layer. No client-side fetching for initial render.
- **Client Components (only for interactivity)**: forms (React Hook Form), data tables (TanStack Table with sorting/filtering), dialogs, dropdowns.
- **URL state for tables**: page, sort, filter, search are URL search params (`?page=2&sort=createdAt:desc&status=active`). This makes table state shareable, bookmarkable, and survives revalidation.
- **Server Actions for mutations**: form submissions call Server Actions that validate (Zod), call the service layer, and `revalidatePath` on success.

#### 1.4 Backend architecture

- **Server Actions**: the primary mutation path for form-driven operations (create lead, update opportunity, convert quotation). Each Server Action validates input with Zod, checks permissions, calls the service layer, and revalidates the relevant path.
- **Route Handlers**: used for REST API endpoints that external clients or webhooks might call, and for operations not tied to a form (e.g., `GET /api/leads` for a data table that needs a standalone endpoint). Route Handlers also validate with Zod, check permissions, and call the service layer.
- **Both paths converge on the service layer**: the same `leadService.create()` is called whether the entry point is a Server Action or a Route Handler, ensuring consistent business logic.

#### 1.5 Service layer

- Owns business logic: state machine transitions, cross-domain conversions (Lead→Opportunity, Quotation→SalesOrder), calculation logic (invoice totals, payment allocation).
- Performs authorization checks (permission verification beyond middleware).
- Throws typed errors: `NotFoundError`, `ValidationError`, `ConflictError`, `ForbiddenError`, `AppError`. These are caught by the API layer (Server Action or Route Handler) and converted to appropriate responses.
- Does NOT import Prisma directly. It calls the repository layer for all data access.

#### 1.6 Repository layer

- Owns all Prisma queries. The service layer never touches `prisma` directly.
- Handles soft-delete filtering: every query method explicitly includes `WHERE deletedAt IS NULL` (no automatic middleware/extensions). This is intentional — the user opted for manual filtering to keep query behavior explicit and debuggable.
- Handles pagination: `findMany` with `skip` and `take` for offset pagination.
- Handles relations: `include` / `select` for eager loading related data.
- Returns plain Prisma types (or mapped domain types if transformation is needed).

#### 1.7 Validation layer

- Zod schemas defined per feature in `src/features/<domain>/schemas/`.
- Three schema types per domain: `<domain>-create.ts` (POST), `<domain>-update.ts` (PATCH/PUT), `<domain>-query.ts` (GET query params for filtering/sorting/pagination).
- Schemas are shared: imported by both client-side React Hook Form and server-side Server Actions / Route Handlers.
- Prisma validation is a backstop, not the primary validation layer. Zod catches issues before Prisma is called.

#### 1.8 Utility layer

- `src/lib/utils.ts`: `cn()` (className merge), `formatDate()`, `formatCurrency()`, `formatPhoneNumber()`, `slugify()`.
- `src/lib/document-number.ts`: generates sequential human-readable document numbers (`LEAD-0001`, `QUO-0001`, `SO-0001`, `DN-0001`, `INV-0001`, `PAY-0001`). Uses a counter table or `findMax` + atomic increment.
- `src/lib/pagination.ts`: offset pagination helper that takes `page` and `pageSize`, returns `{ data, page, pageSize, total, totalPages }`.
- `src/lib/errors/`: typed error classes that the service layer throws.

#### 1.9 Database layer

- Prisma ORM with MariaDB provider (`provider = "mysql"` in schema.prisma — MariaDB is wire-compatible with MySQL for Prisma).
- Single Prisma client singleton in `src/lib/prisma.ts` (prevents connection exhaustion in development).
- `schema.prisma` is organized by domain with comment separators (`// === LEAD ===`).
- Migrations are version-controlled and reviewed before applying.

---

### 2. Domain Model

Each domain is described with: responsibilities, ownership, lifecycle (state machine), dependencies, and business rules.

#### 2.1 CRM Domains

##### 2.1.1 Lead

- **Responsibilities**: capture potential sales contacts (person or organization), track source and initial interest, qualify/disqualify.
- **Ownership**: CRM module. Assigned to a sales rep (`assignedToId` → User).
- **Lifecycle (state machine)**:

```
                    ┌──────────┐
         create     │  NEW     │
               └───►│          │
                    └────┬─────┘
                         │ contact
                         ▼
                    ┌──────────┐
                    │ CONTACTED│
                    └────┬─────┘
                         │ qualify
                         ▼
                    ┌──────────┐         convert        ┌──────────┐
                    │QUALIFIED │ ──────────────────────►│OPPORTUNITY│
                    │          │   (creates Opportunity) │ (exits)  │
                    └────┬─────┘                         └──────────┘
                         │ disqualify
                         ▼
                    ┌──────────┐
                    │DISQUALIFIED│
                    └──────────┘
```

| From | To | Trigger | Side effect |
|---|---|---|---|
| NEW | CONTACTED | First contact attempt logged | — |
| NEW | QUALIFIED | Marked qualified without contact | — |
| CONTACTED | QUALIFIED | Qualification criteria met | — |
| CONTACTED | DISQUALIFIED | Not viable | — |
| NEW | DISQUALIFIED | Not viable | — |
| QUALIFIED | (convert) | Convert to Opportunity | Creates Opportunity with FK to Lead; Lead remains in QUALIFIED state |
| Any | Any (re-open) | Admin override | Audit logged |

- **Dependencies**: User (assignedTo), User (createdBy). No FK to other domains.
- **Business rules**: a Lead can only be converted to an Opportunity if status is QUALIFIED. A Lead can have only one converted Opportunity. Disqualified leads are retained for reporting (soft-deleted never; just status change). Document number: `LEAD-0001`.

##### 2.1.2 Opportunity

- **Responsibilities**: represent a qualified sales pursuit with estimated value, expected close date, and stage tracking.
- **Ownership**: CRM module. Linked to originating Lead (`leadId`). Assigned to a sales rep.
- **Lifecycle (state machine)**:

```
┌──────────┐    progress   ┌──────────┐    progress   ┌──────────┐
|PROSPECTING│ ───────────► │QUALIFICATION│ ──────────►│NEEDS_ANALYSIS│
└────┬─────┘               └────┬──────┘              └─────┬──────┘
     │                          │                            │
     │ close-lost               │ close-lost                 │ close-lost
     ▼                          ▼                            ▼
┌──────────┐               ┌──────────┐                ┌──────────┐
│CLOSED_LOST│              │CLOSED_LOST│               │CLOSED_LOST│
└──────────┘               └──────────┘                └──────────┘
                                                                │ progress
                                                                ▼
                                              ┌──────────┐    progress   ┌──────────┐
                                              │VALUE_PROP│ ──────────► │NEGOTIATION│
                                              └────┬─────┘              └─────┬─────┘
                                                   │ close-lost               │ close-won
                                                   ▼                          ▼
                                              ┌──────────┐              ┌──────────┐
                                              │CLOSED_LOST│              │CLOSED_WON│
                                              └──────────┘              └─────┬────┘
                                                                               │ convert
                                                                               ▼
                                                                        ┌──────────┐
                                                                        │QUOTATION │
                                                                        │ (exits)  │
                                                                        └──────────┘
```

| From | To | Trigger | Side effect |
|---|---|---|---|
| PROSPECTING | QUALIFICATION | Stage advance | — |
| QUALIFICATION | NEEDS_ANALYSIS | Stage advance | — |
| NEEDS_ANALYSIS | VALUE_PROPOSITION | Stage advance | — |
| VALUE_PROPOSITION | NEGOTIATION | Stage advance | — |
| NEGOTIATION | CLOSED_WON | Won | Enables Quotation creation |
| NEGOTIATION | CLOSED_LOST | Lost | Reason recorded |
| Any active stage | CLOSED_LOST | Lost | Reason recorded |
| CLOSED_LOST | PROSPECTING (re-open) | Admin override | Audit logged |

- **Dependencies**: Lead (leadId, required), User (assignedTo). Quotation depends on Opportunity (an Opportunity must be CLOSED_WON before a Quotation can be created).
- **Business rules**: estimated value and expected close date are required. Stage can only advance forward (except re-open). An Opportunity must be CLOSED_WON to generate a Quotation. Document number: `OPP-0001`.

##### 2.1.3 Quotation

- **Responsibilities**: formal pricing document sent to a prospect/customer. Contains line items (product/service, qty, unit price, discount). Has a validity period.
- **Ownership**: CRM module. Linked to originating Opportunity (`opportunityId`).
- **Lifecycle (state machine)**:

```
┌────────┐   add items   ┌────────┐   send      ┌────────┐
│ DRAFT  │ ────────────► │ READY  │ ──────────► │  SENT  │
└───┬────┘               └───┬────┘              └───┬────┘
    │                        │                       │
    │ (edit)                 │ (edit back)           │ accept
    ▼                        ▼                       ▼
┌────────┐               ┌────────┐              ┌────────┐
│ DRAFT  │               │ DRAFT  │              │ACCEPTED│
└────────┘               └────────┘              └───┬────┘
                                                     │ convert
                                                     ▼
                                              ┌──────────┐
                                              │SALES_ORDER│
                                              │ (exits)   │
                                              └──────────┘
     │ reject (from SENT)         │ expire (from SENT)
     ▼                            ▼
┌────────┐                    ┌────────┐
│REJECTED│                    │ EXPIRED│
└────────┘                    └────────┘
```

| From | To | Trigger | Side effect |
|---|---|---|---|
| DRAFT | READY | Items added, marked ready | — |
| READY | DRAFT | Edit needed | — |
| READY | SENT | Send to customer | Sent date recorded |
| DRAFT | SENT | Quick send | Sent date recorded |
| SENT | ACCEPTED | Customer accepts | Acceptance date recorded; enables SalesOrder creation |
| SENT | REJECTED | Customer rejects | Reason recorded |
| SENT | EXPIRED | Validity period passed | Auto-expire via scheduled job or on-read check |
| REJECTED | DRAFT | Revise | — |
| EXPIRED | DRAFT | Revise (extend validity) | — |
| ACCEPTED | (convert) | Convert to Sales Order | Creates SalesOrder with FK to Quotation |

- **Dependencies**: Opportunity (opportunityId, required — must be CLOSED_WON). Customer (customerId, optional — a Quotation may be sent to a prospect that is not yet a Customer; Customer is created on acceptance if not exists).
- **Business rules**: line items are required (at least one). Total is computed (sum of line item totals after discount). Validity date is required (default 30 days). A Quotation can only be converted to a SalesOrder if ACCEPTED. Document number: `QUO-0001`. Versioning: if a quotation is revised after being sent, a new version is created (`QUO-0001-V2`).

##### 2.1.4 Customer

- **Responsibilities**: represent an entity that has purchased or is purchasing. Contains billing address, shipping address, contact info, credit terms.
- **Ownership**: CRM module (created), but shared with Sales module (consumed by SalesOrder, DeliveryNote, SalesInvoice, Payment).
- **Lifecycle (state machine)**:

```
┌────────┐   verify      ┌────────┐   first sale   ┌────────┐
│  NEW   │ ────────────► │ACTIVE  │ ─────────────► │ACTIVE  │
└────────┘               └───┬────┘   (no change)   └───┬────┘
                             │ deactivate                │ block
                             ▼                           ▼
                        ┌────────┐                  ┌────────┐
                        │INACTIVE│                  │ BLOCKED│
                        └───┬────┘                  └───┬────┘
                            │ re-activate                │ unblock
                            ▼                            ▼
                        ┌────────┐                  ┌────────┐
                        │ACTIVE  │                  │ACTIVE  │
                        └────────┘                  └────────┘
```

| From | To | Trigger | Side effect |
|---|---|---|---|
| NEW | ACTIVE | Verification complete | — |
| ACTIVE | INACTIVE | Manual deactivation | No new SalesOrders allowed |
| INACTIVE | ACTIVE | Re-activation | — |
| ACTIVE | BLOCKED | Credit hold / dispute | No new SalesOrders, DeliveryNotes, Invoices allowed |
| BLOCKED | ACTIVE | Resolve issue | — |

- **Dependencies**: Can originate from a Lead→Opportunity→Quotation flow or be created manually. May have multiple Contacts, Addresses. Referenced by SalesOrder, SalesInvoice, Payment.
- **Business rules**: a Customer must be ACTIVE to create a SalesOrder. A BLOCKED Customer blocks all downstream Sales operations. Customer code: `CUST-0001` (auto-generated). Email and/or phone is required. Unique constraint on email (if provided).

#### 2.2 Sales Domains

##### 2.2.1 Sales Order

- **Responsibilities**: formal order from a customer to purchase goods/services. Contains line items, payment terms, delivery terms. The central document that drives DeliveryNote, SalesInvoice, and Payment.
- **Ownership**: Sales module. Linked to Customer (`customerId`) and optionally to Quotation (`quotationId`).
- **Lifecycle (state machine)**:

```
┌────────┐  submit     ┌─────────┐  confirm    ┌────────┐
│ DRAFT  │ ──────────► │ PENDING │ ──────────► │CONFIRMED│
└───┬────┘             └────┬────┘             └────┬────┘
    │ cancel                 │ cancel                 │ start fulfillment
    ▼                        ▼                        ▼
┌────────┐             ┌────────┐             ┌──────────┐
│CANCELLED│            │CANCELLED│            │FULFILLING │
└────────┘             └────────┘             └────┬─────┘
                                                    │ all items delivered
                                                    ▼
                                              ┌──────────┐
                                              │ DELIVERED │
                                              └────┬─────┘
                                                   │ invoice
                                                   ▼
                                              ┌──────────┐
                                              │ INVOICED  │
                                              └────┬─────┘
                                                   │ full payment
                                                   ▼
                                              ┌──────────┐
                                              │ COMPLETED │
                                              └──────────┘
```

| From | To | Trigger | Side effect |
|---|---|---|---|
| DRAFT | PENDING | Submit for approval | — |
| PENDING | CONFIRMED | Approve | Enables DeliveryNote creation |
| PENDING | DRAFT | Reject (needs revision) | — |
| PENDING | CANCELLED | Cancel | Reason recorded |
| CONFIRMED | FULFILLING | First DeliveryNote created | — |
| FULFILLING | DELIVERED | All line items fully delivered | Auto-checked on DeliveryNote creation |
| DELIVERED | INVOICED | SalesInvoice created | — |
| INVOICED | COMPLETED | Full payment received | Auto-checked on Payment recording |
| Any active | CANCELLED | Cancel (admin) | Only if no deliveries/invoices |

- **Dependencies**: Customer (customerId, required — must be ACTIVE). Quotation (quotationId, optional — must be ACCEPTED if provided). Generates DeliveryNote, SalesInvoice.
- **Business rules**: line items required. Total computed. Can only create DeliveryNote if CONFIRMED or FULFILLING. Can only create SalesInvoice if DELIVERED (or partial invoice if FULFILLING — configurable). Status transitions are automatic based on downstream document creation (FULFILLING when first DN created, DELIVERED when all items delivered, INVOICED when invoice created, COMPLETED when fully paid). Document number: `SO-0001`.

##### 2.2.2 Delivery Note

- **Responsibilities**: document goods delivered to the customer. Can be partial (multiple DNs per SalesOrder). Tracks delivery date, carrier, tracking number.
- **Ownership**: Sales module. Linked to SalesOrder (`salesOrderId`). Contains DeliveryNoteItem (references SalesOrderItem, qty delivered).
- **Lifecycle (state machine)**:

```
┌────────┐  dispatch   ┌──────────┐  deliver    ┌──────────┐
│ DRAFT  │ ──────────► │DISPATCHED│ ──────────► │DELIVERED │
└───┬────┘             └────┬─────┘             └────┬─────┘
    │ cancel                 │ cancel                  │ acknowledge
    ▼                        ▼                         ▼
┌────────┐             ┌────────┐               ┌──────────┐
│CANCELLED│            │CANCELLED│              │ACKNOWLEDGED│
└────────┘             └────────┘               └──────────┘
```

| From | To | Trigger | Side effect |
|---|---|---|---|
| DRAFT | DISPATCHED | Dispatch (send out) | Dispatch date recorded |
| DISPATCHED | DELIVERED | Mark delivered | Delivery date recorded; updates SalesOrderItem delivered qty |
| DELIVERED | ACKNOWLEDGED | Customer confirms receipt | — |
| DRAFT | CANCELLED | Cancel | — |
| DISPATCHED | CANCELLED | Cancel (return to warehouse) | — |

- **Dependencies**: SalesOrder (salesOrderId, required — must be CONFIRMED or FULFILLING). References SalesOrderItem for each line.
- **Business rules**: delivered qty per line cannot exceed ordered qty minus already-delivered qty. Creating a DN transitions the SalesOrder to FULFILLING (if CONFIRMED). When all SalesOrderItems are fully delivered, SalesOrder auto-transitions to DELIVERED. Document number: `DN-0001`.

##### 2.2.3 Sales Invoice

- **Responsibilities**: request payment from the customer. Contains invoice line items (may mirror SalesOrder items or DeliveryNote items). Has due date, payment terms. Tracks paid amount.
- **Ownership**: Sales module. Linked to SalesOrder (`salesOrderId`) and/or DeliveryNote (`deliveryNoteId`).
- **Lifecycle (state machine)**:

```
┌────────┐  issue      ┌────────┐  partial pay   ┌──────────┐
│ DRAFT  │ ──────────► │  OPEN  │ ─────────────► │PARTIALLY │
└───┬────┘             └───┬────┘                │  PAID    │
    │ void                  │                     └────┬─────┘
    ▼                       │ full payment             │ full payment
┌────────┐                  ▼                          ▼
│ VOIDED │             ┌────────┐                ┌────────┐
└────────┘             │  PAID  │                │  PAID  │
                       └───┬────┘                └────────┘
                           │ overdue (past due)
                           ▼
                       ┌────────┐
                       │OVERDUE │
                       └────────┘
```

| From | To | Trigger | Side effect |
|---|---|---|---|
| DRAFT | OPEN | Issue invoice | Issue date recorded; due date computed |
| OPEN | PARTIALLY_PAID | Partial payment recorded | paidAmount updated |
| PARTIALLY_PAID | PAID | Full payment received | paidAmount = total; SalesOrder payment check |
| OPEN | PAID | Full payment in one go | Same as above |
| OPEN | OVERDUE | Past due date (checked on-read or via job) | — |
| OVERDUE | PARTIALLY_PAID | Partial payment | — |
| OVERDUE | PAID | Full payment | — |
| DRAFT | VOIDED | Void | — |

- **Dependencies**: SalesOrder (salesOrderId, required — must be DELIVERED or FULFILLING for partial invoicing). Customer (customerId, via SalesOrder). Payment references SalesInvoice.
- **Business rules**: invoice total = sum of line items after tax and discount. paidAmount is cumulative (sum of linked Payments). Status auto-transitions to PAID when paidAmount >= total. Due date computed from issue date + payment terms (e.g., Net 30). Document number: `INV-0001`.

##### 2.2.4 Payment

- **Responsibilities**: record a payment received from a customer against one or more invoices. Tracks payment method, amount, reference number, date.
- **Ownership**: Sales module. Linked to SalesInvoice (`salesInvoiceId`). Linked to Customer (`customerId`).
- **Lifecycle (state machine)**:

```
┌────────┐  record    ┌──────────┐  reconcile   ┌──────────┐
│PENDING │ ─────────► │RECEIVED  │ ───────────► │RECONCILED│
└───┬────┘            └────┬─────┘              └──────────┘
    │ cancel                │ fail
    ▼                       ▼
┌────────┐              ┌────────┐
│CANCELLED│             │ FAILED │
└────────┘              └────┬───┘
                             │ retry
                             ▼
                        ┌────────┐
                        │PENDING │
                        └────────┘
```

| From | To | Trigger | Side effect |
|---|---|---|---|
| PENDING | RECEIVED | Payment confirmed | Updates SalesInvoice paidAmount; checks if invoice fully paid |
| PENDING | CANCELLED | Cancel | — |
| PENDING | FAILED | Payment fails (e.g., bounce) | — |
| FAILED | PENDING | Retry | — |
| RECEIVED | RECONCILED | Reconciled in accounting | — |

- **Dependencies**: SalesInvoice (salesInvoiceId, required — must be OPEN or PARTIALLY_PAID or OVERDUE). Customer (customerId, via Invoice).
- **Business rules**: payment amount cannot exceed invoice remaining balance (total - paidAmount). A single payment can be allocated across multiple invoices (M2M via PaymentAllocation — documented in DB design but initial implementation supports single-invoice payments). Payment method: CASH, BANK_TRANSFER, CHECK, CREDIT_CARD, OTHER. Document number: `PAY-0001`.

#### 2.3 System Domains

##### 2.3.1 User
- **Responsibilities**: represent an authenticated system user (employee/staff). Contains name, email, password hash, role assignment, status.
- **Ownership**: System module. Referenced by all domains (`createdById`, `assignedToId`).
- **Lifecycle**: ACTIVE → INACTIVE → (optionally) ACTIVE. No hard delete (deactivate only). Auth.js manages sessions.
- **Dependencies**: Role (roleId). Department (optional, future).
- **Business rules**: email must be unique. Password hashed via bcrypt (12 rounds). A user must be ACTIVE to log in. Last login timestamp tracked.

##### 2.3.2 Role
- **Responsibilities**: group of permissions assigned to users. E.g., Admin, Sales Manager, Sales Rep, Accountant.
- **Dependencies**: Permission (M2M via RolePermission).
- **Business rules**: a Role has many Permissions. A User has one Role (initial simplicity; can extend to M2M later). System roles (Admin, Sales Manager, Sales Rep, Accountant) are seeded.

##### 2.3.3 Permission
- **Responsibilities**: atomic action right. Format: `resource:action` (e.g., `leads:create`, `quotations:approve`, `sales-orders:read`).
- **Dependencies**: Role (M2M via RolePermission).
- **Business rules**: permissions are predefined in `src/lib/auth/permissions.ts` as a const array. The seed inserts them into the DB. Middleware and Server Actions check permissions via a `hasPermission(user, "leads:create")` helper.

##### 2.3.4 AuditLog
- **Responsibilities**: record every significant state change (create, update, delete, state transition) across all domains.
- **Ownership**: System module. Written by the service layer (every state-changing service method calls `audit.log()`).
- **Fields**: entity type, entity ID, action (CREATE/UPDATE/DELETE/TRANSITION), previous state, new state, userId, timestamp, metadata (JSON).
- **Business rules**: append-only (never updated or deleted). No soft delete. Indexed on (entityType, entityId) for querying entity history, and on userId for user activity.

##### 2.3.5 Notification
- **Responsibilities**: in-app notifications for users (e.g., "Lead assigned to you", "Invoice overdue", "Quotation accepted").
- **Ownership**: System module. Created by service layer on significant events.
- **Fields**: userId, type, title, message, read (boolean), entityType, entityId (for linking), createdAt.
- **Business rules**: a notification belongs to one user. Marked as read when user clicks. Unread count shown in topbar.

##### 2.3.6 Setting
- **Responsibilities**: store application-level configuration (company name, default currency, tax rate, document number prefixes, payment terms defaults).
- **Ownership**: System module. Key-value store with typed values.
- **Fields**: key (unique), value (string), category, updatedAt, updatedById.
- **Business rules**: settings are editable by Admin only. Cached in memory on read (revalidated on update). Used by document number generator, invoice due date calculator, etc.

---

### 3. Database Design

#### 3.1 Conventions

- **Primary keys**: `id String @id @default(cuid())` on every model.
- **Document numbers**: separate `documentNo String @unique` column on business documents (Lead, Opportunity, Quotation, Customer, SalesOrder, DeliveryNote, SalesInvoice, Payment). Generated by `src/lib/document-number.ts` using a prefix + zero-padded sequence.
- **Timestamps**: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` on ALL models.
- **Soft delete**: `deletedAt DateTime?` on domain models where appropriate (Lead, Opportunity, Quotation, Customer, SalesOrder, DeliveryNote, SalesInvoice, Payment, Customer Contact, Customer Address). NOT on system models (User, Role, Permission, AuditLog, Notification, Setting). Filtering is MANUAL: every repository query explicitly adds `where: { deletedAt: null }`.
- **Audit columns**: `createdById String?` (FK to User) only on models where it has business value: Lead, Opportunity, Quotation, Customer, SalesOrder, DeliveryNote, SalesInvoice, Payment. NOT on join tables, AuditLog (has its own userId), Notification, Setting (has updatedById instead).
- **Naming**: Prisma models use PascalCase (e.g., `SalesOrder`). DB tables mapped to snake_case via `@@map("sales_orders")`. Fields are camelCase in Prisma, mapped to snake_case via `@map`.
- **No tenantId**: the initial schema has no multi-tenancy fields. Multi-tenancy is documented as a future enhancement (Section 15.7).

#### 3.2 Model catalog

| Model | Purpose | Soft Delete | Audit (createdById) | Document No |
|---|---|---|---|---|
| User | Authenticated user | No (deactivate) | No | No |
| Role | Permission group | No | No | No |
| Permission | Atomic right | No | No | No |
| RolePermission | M2M join (Role↔Permission) | No | No | No |
| AuditLog | Change record | No (append-only) | No (own userId) | No |
| Notification | In-app notification | No | No | No |
| Setting | App config key-value | No | No (updatedById) | No |
| Lead | CRM lead | Yes | Yes | LEAD-0001 |
| Opportunity | CRM opportunity | Yes | Yes | OPP-0001 |
| Quotation | CRM quotation | Yes | Yes | QUO-0001 |
| QuotationItem | Quotation line item | Yes (cascade) | No | No |
| Customer | Customer entity | Yes | Yes | CUST-0001 |
| CustomerContact | Customer contact person | Yes (cascade) | No | No |
| CustomerAddress | Customer address | Yes (cascade) | No | No |
| SalesOrder | Sales order | Yes | Yes | SO-0001 |
| SalesOrderItem | Sales order line item | Yes (cascade) | No | No |
| DeliveryNote | Delivery document | Yes | Yes | DN-0001 |
| DeliveryNoteItem | Delivery line item | Yes (cascade) | No | No |
| SalesInvoice | Invoice document | Yes | Yes | INV-0001 |
| SalesInvoiceItem | Invoice line item | Yes (cascade) | No | No |
| Payment | Payment record | Yes | Yes | PAY-0001 |
| Counter | Document number sequence | No | No | No |

#### 3.3 Model definitions (field-level detail)

##### User
```
id              String   @id @default(cuid())
email           String   @unique
name            String
passwordHash    String
roleRoleId      String   @map("role_id")     -- FK to Role (initially 1:1)
status          String   @default("ACTIVE")   -- ACTIVE | INACTIVE
lastLoginAt     DateTime?
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt

@@map("users")
@@index([roleRoleId])
```
- **Indexes**: `roleRoleId` for querying users by role.
- **Unique**: `email`.

##### Role
```
id              String   @id @default(cuid())
name            String   @unique             -- e.g., "Admin", "Sales Rep"
description     String?
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt

@@map("roles")
```
- **Unique**: `name`.

##### Permission
```
id              String   @id @default(cuid())
code            String   @unique             -- e.g., "leads:create"
description     String?
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt

@@map("permissions")
```
- **Unique**: `code`.

##### RolePermission (M2M)
```
id              String   @id @default(cuid())
roleId          String   @map("role_id")
permissionId    String   @map("permission_id")
createdAt       DateTime @default(now())

@@map("role_permissions")
@@unique([roleId, permissionId])
@@index([roleId])
@@index([permissionId])
```
- **Unique**: composite `[roleId, permissionId]` (prevents duplicates).
- **Indexes**: both FK columns.

##### AuditLog
```
id              String   @id @default(cuid())
entityType      String                       -- "Lead", "Opportunity", etc.
entityId        String
action          String                       -- CREATE | UPDATE | DELETE | TRANSITION
previousState   Json?
newState        Json?
userId          String   @map("user_id")
metadata        Json?
createdAt       DateTime @default(now())

@@map("audit_logs")
@@index([entityType, entityId])
@@index([userId])
@@index([createdAt])
```
- **No soft delete, no updatedAt** (append-only).
- **Indexes**: composite `[entityType, entityId]` for entity history, `userId` for user activity, `createdAt` for time-range queries.

##### Notification
```
id              String   @id @default(cuid())
userId          String   @map("user_id")
type            String                       -- "LEAD_ASSIGNED", "INVOICE_OVERDUE", etc.
title           String
message         String
read            Boolean  @default(false)
entityType      String?
entityId        String?
createdAt       DateTime @default(now())

@@map("notifications")
@@index([userId, read])
@@index([createdAt])
```

##### Setting
```
id              String   @id @default(cuid())
key             String   @unique
value           String
category        String                       -- "general", "document_numbers", "tax", etc.
updatedById     String?  @map("updated_by_id")
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt

@@map("settings")
```
- **Unique**: `key`.

##### Lead
```
id              String   @id @default(cuid())
documentNo      String   @unique             -- LEAD-0001
firstName       String
lastName        String
email           String?
phone           String?
company         String?
jobTitle        String?
source          String                       -- WEBSITE | REFERRAL | COLD_CALL | EVENT | OTHER
status          String   @default("NEW")     -- NEW | CONTACTED | QUALIFIED | DISQUALIFIED
assignedToId    String?  @map("assigned_to_id")
createdById     String?  @map("created_by_id")
notes           String? @db.Text
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("leads")
@@index([status])
@@index([assignedToId])
@@index([createdById])
@@index([deletedAt])
@@index([createdAt])
```
- **Indexes**: `status` (filter by pipeline stage), `assignedToId` (my leads), `deletedAt` (soft delete filter), `createdAt` (sorting).

##### Opportunity
```
id              String   @id @default(cuid())
documentNo      String   @unique             -- OPP-0001
leadId          String   @map("lead_id")
title           String
description     String? @db.Text
estimatedValue  Decimal  @db.Decimal(12,2)
expectedCloseDate DateTime
stage           String   @default("PROSPECTING")
status          String   @default("OPEN")    -- OPEN | CLOSED_WON | CLOSED_LOST
lossReason      String?
assignedToId    String?  @map("assigned_to_id")
createdById     String?  @map("created_by_id")
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("opportunities")
@@index([leadId])
@@index([stage])
@@index([status])
@@index([assignedToId])
@@index([deletedAt])
```
- **FK**: `leadId` → Lead (required, cascade restrict — cannot delete a Lead with Opportunities, must soft-delete Opportunity first).

##### Quotation
```
id              String   @id @default(cuid())
documentNo      String   @unique             -- QUO-0001
opportunityId   String   @map("opportunity_id")
customerId      String?  @map("customer_id")  -- optional (prospect quote)
status          String   @default("DRAFT")    -- DRAFT | READY | SENT | ACCEPTED | REJECTED | EXPIRED
subject         String
validUntil      DateTime
subtotal        Decimal  @db.Decimal(12,2)
discountTotal   Decimal  @default(0) @db.Decimal(12,2)
taxTotal        Decimal  @default(0) @db.Decimal(12,2)
grandTotal      Decimal  @db.Decimal(12,2)
sentAt          DateTime?
acceptedAt      DateTime?
notes           String? @db.Text
createdById     String?  @map("created_by_id")
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("quotations")
@@index([opportunityId])
@@index([customerId])
@@index([status])
@@index([deletedAt])
```

##### QuotationItem
```
id              String   @id @default(cuid())
quotationId     String   @map("quotation_id")
description     String
quantity        Decimal  @db.Decimal(10,2)
unitPrice       Decimal  @db.Decimal(12,2)
discountPercent Decimal  @default(0) @db.Decimal(5,2)
lineTotal       Decimal  @db.Decimal(12,2)
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("quotation_items")
@@index([quotationId])
```

##### Customer
```
id              String   @id @default(cuid())
documentNo      String   @unique             -- CUST-0001
name            String
email           String?
phone           String?
taxId           String?                       -- VAT/GST number
website         String?
status          String   @default("NEW")     -- NEW | ACTIVE | INACTIVE | BLOCKED
creditLimit     Decimal? @db.Decimal(12,2)
paymentTerms    Int      @default(30)          -- Net X days
createdById     String?  @map("created_by_id")
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("customers")
@@index([status])
@@index([deletedAt])
@@index([email])
```

##### CustomerContact
```
id              String   @id @default(cuid())
customerId      String   @map("customer_id")
name            String
email           String?
phone           String?
jobTitle        String?
isPrimary       Boolean  @default(false)
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("customer_contacts")
@@index([customerId])
```

##### CustomerAddress
```
id              String   @id @default(cuid())
customerId      String   @map("customer_id")
type            String                       -- BILLING | SHIPPING
line1           String
line2           String?
city            String
state           String?
postalCode      String?
country         String   @default("US")
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("customer_addresses")
@@index([customerId])
@@index([type])
```

##### SalesOrder
```
id              String   @id @default(cuid())
documentNo      String   @unique             -- SO-0001
customerId      String   @map("customer_id")
quotationId     String?  @map("quotation_id")
status          String   @default("DRAFT")   -- DRAFT|PENDING|CONFIRMED|FULFILLING|DELIVERED|INVOICED|COMPLETED|CANCELLED
orderDate       DateTime
expectedDeliveryDate DateTime?
subtotal        Decimal  @db.Decimal(12,2)
discountTotal   Decimal  @default(0) @db.Decimal(12,2)
taxTotal        Decimal  @default(0) @db.Decimal(12,2)
grandTotal      Decimal  @db.Decimal(12,2)
notes           String? @db.Text
createdById     String?  @map("created_by_id")
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("sales_orders")
@@index([customerId])
@@index([quotationId])
@@index([status])
@@index([deletedAt])
```

##### SalesOrderItem
```
id              String   @id @default(cuid())
salesOrderId    String   @map("sales_order_id")
description     String
quantity        Decimal  @db.Decimal(10,2)
unitPrice       Decimal  @db.Decimal(12,2)
discountPercent Decimal  @default(0) @db.Decimal(5,2)
lineTotal       Decimal  @db.Decimal(12,2)
deliveredQuantity Decimal @default(0) @db.Decimal(10,2)
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("sales_order_items")
@@index([salesOrderId])
```

##### DeliveryNote
```
id              String   @id @default(cuid())
documentNo      String   @unique             -- DN-0001
salesOrderId    String   @map("sales_order_id")
status          String   @default("DRAFT")   -- DRAFT|DISPATCHED|DELIVERED|ACKNOWLEDGED|CANCELLED
deliveryDate    DateTime?
carrier         String?
trackingNumber  String?
notes           String? @db.Text
createdById     String?  @map("created_by_id")
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("delivery_notes")
@@index([salesOrderId])
@@index([status])
@@index([deletedAt])
```

##### DeliveryNoteItem
```
id              String   @id @default(cuid())
deliveryNoteId  String   @map("delivery_note_id")
salesOrderItemId String  @map("sales_order_item_id")
description     String
quantity        Decimal  @db.Decimal(10,2)    -- qty in this delivery
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("delivery_note_items")
@@index([deliveryNoteId])
@@index([salesOrderItemId])
```

##### SalesInvoice
```
id              String   @id @default(cuid())
documentNo      String   @unique             -- INV-0001
salesOrderId    String   @map("sales_order_id")
customerId      String   @map("customer_id")
status          String   @default("DRAFT")   -- DRAFT|OPEN|PARTIALLY_PAID|PAID|OVERDUE|VOIDED
issueDate       DateTime
dueDate         DateTime
subtotal        Decimal  @db.Decimal(12,2)
discountTotal   Decimal  @default(0) @db.Decimal(12,2)
taxTotal        Decimal  @default(0) @db.Decimal(12,2)
grandTotal      Decimal  @db.Decimal(12,2)
paidAmount      Decimal  @default(0) @db.Decimal(12,2)
notes           String? @db.Text
createdById     String?  @map("created_by_id")
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("sales_invoices")
@@index([salesOrderId])
@@index([customerId])
@@index([status])
@@index([dueDate])
@@index([deletedAt])
```

##### SalesInvoiceItem
```
id              String   @id @default(cuid())
salesInvoiceId  String   @map("sales_invoice_id")
description     String
quantity        Decimal  @db.Decimal(10,2)
unitPrice       Decimal  @db.Decimal(12,2)
discountPercent Decimal  @default(0) @db.Decimal(5,2)
lineTotal       Decimal  @db.Decimal(12,2)
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("sales_invoice_items")
@@index([salesInvoiceId])
```

##### Payment
```
id              String   @id @default(cuid())
documentNo      String   @unique             -- PAY-0001
salesInvoiceId  String   @map("sales_invoice_id")
customerId      String   @map("customer_id")
amount          Decimal  @db.Decimal(12,2)
paymentMethod   String                       -- CASH|BANK_TRANSFER|CHECK|CREDIT_CARD|OTHER
referenceNumber String?
paymentDate     DateTime
status          String   @default("PENDING") -- PENDING|RECEIVED|FAILED|CANCELLED|RECONCILED
notes           String? @db.Text
createdById     String?  @map("created_by_id")
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt
deletedAt       DateTime?

@@map("payments")
@@index([salesInvoiceId])
@@index([customerId])
@@index([status])
@@index([paymentDate])
@@index([deletedAt])
```

##### Counter (document number sequence)
```
id              String   @id @default(cuid())
prefix          String   @unique             -- "LEAD", "OPP", "QUO", "SO", "DN", "INV", "PAY", "CUST"
sequence        Int      @default(0)
createdAt       DateTime @default(now())
updatedAt       DateTime @updatedAt

@@map("counters")
```
- Used by `src/lib/document-number.ts` to generate sequential document numbers atomically (increment + format).

#### 3.4 ERD (Entity Relationship Diagram)

```
┌──────────┐     ┌──────────────────┐     ┌──────────────┐
│  Role    │1───*│ RolePermission   │*───1│  Permission  │
└────┬─────┘     └──────────────────┘     └──────────────┘
     │1
     │
     │*
┌──────────┐     ┌──────────────────┐
│  User    │1───*│   AuditLog       │ (userId)
└────┬─────┘     └──────────────────┘
     │1
     │* (notifications)
     │
┌──────────┐
│Notification│
└──────────┘

┌──────────┐               ┌──────────────┐
│  Lead    │1─────────────*│ Opportunity  │
│          │               └──────┬───────┘
└──────────┘                      │1
                                  │*
                           ┌──────────────┐          ┌──────────────┐
                           │  Quotation   │1────────*│QuotationItem │
                           └──────┬───────┘          └──────────────┘
                                  │1 (optional customerId)
                                  │
                           ┌──────────────┐
                           │   Customer   │1───────*│CustomerContact│
                           │              │1───────*│CustomerAddress│
                           └──────┬───────┘
                                  │1
                                  │*
                           ┌──────────────┐          ┌────────────────┐
                           │  SalesOrder  │1────────*│SalesOrderItem  │
                           │              │1         └────────────────┘
                           └──────┬───────┘
                              │1  │1
                    ┌──────────┘  └──────────┐
                    │*                       │*
          ┌──────────────────┐      ┌──────────────────┐
          │  DeliveryNote    │1────*│DeliveryNoteItem  │
          └──────────────────┘      └──────────────────┘
                    │* (DN references SOItem)
                    │
          ┌──────────────────┐      ┌──────────────────┐
          │  SalesInvoice    │1────*│SalesInvoiceItem  │
          └──────┬───────────┘      └──────────────────┘
                 │1
                 │*
          ┌──────────────────┐
          │     Payment      │
          └──────────────────┘

  Quotation ──(quotationId)──► SalesOrder (optional FK)
  Customer ──(customerId)──► SalesOrder, SalesInvoice, Payment (required FK)
  SalesOrder ──(salesOrderId)──► DeliveryNote, SalesInvoice (required FK)
  SalesInvoice ──(salesInvoiceId)──► Payment (required FK)
```

#### 3.5 Normalization decisions

- **3NF achieved**: all non-key attributes depend only on the primary key, not on other non-key attributes. No transitive dependencies.
- **Line items are separate entities** (QuotationItem, SalesOrderItem, etc.) rather than JSON arrays — this enables querying (e.g., "which products were delivered?"), indexing, and referential integrity.
- **Customer contacts and addresses are separate** (1:N) rather than embedded — enables multiple contacts/addresses per customer and individual management.
- **Decimal for money**: all monetary fields use `Decimal @db.Decimal(12,2)` (or `Decimal(10,2)` for quantities) to avoid floating-point errors. Prisma returns these as `Decimal` objects (Prisma.Decimal), which are safe for arithmetic.
- **Counter table** for document numbering: avoids race conditions with `MAX(documentNo)` approaches. An atomic `update` + `increment` on the Counter table returns the new sequence, which is then formatted.

#### 3.6 Many-to-many relationships

- **Role ↔ Permission**: via `RolePermission` join table. This is the only M2M in the initial schema.
- **Future M2M (documented, not implemented)**: Payment ↔ SalesInvoice (for multi-invoice payment allocation via `PaymentAllocation` join table). Initial implementation: Payment has a single `salesInvoiceId` FK (1:N — one invoice has many payments).

#### 3.7 Foreign key dependencies

| Child Model | Parent Model | FK Field | Required? | Cascade |
|---|---|---|---|---|
| Opportunity | Lead | leadId | Yes | Restrict (cannot hard-delete Lead with Opportunities) |
| Quotation | Opportunity | opportunityId | Yes | Restrict |
| Quotation | Customer | customerId | No | Set null (customer may be created after quote) |
| QuotationItem | Quotation | quotationId | Yes | Cascade (delete items when quotation deleted) |
| CustomerContact | Customer | customerId | Yes | Cascade |
| CustomerAddress | Customer | customerId | Yes | Cascade |
| SalesOrder | Customer | customerId | Yes | Restrict |
| SalesOrder | Quotation | quotationId | No | Set null |
| SalesOrderItem | SalesOrder | salesOrderId | Yes | Cascade |
| DeliveryNote | SalesOrder | salesOrderId | Yes | Restrict |
| DeliveryNoteItem | DeliveryNote | deliveryNoteId | Yes | Cascade |
| DeliveryNoteItem | SalesOrderItem | salesOrderItemId | Yes | Restrict |
| SalesInvoice | SalesOrder | salesOrderId | Yes | Restrict |
| SalesInvoice | Customer | customerId | Yes | Restrict |
| SalesInvoiceItem | SalesInvoice | salesInvoiceId | Yes | Cascade |
| Payment | SalesInvoice | salesInvoiceId | Yes | Restrict |
| Payment | Customer | customerId | Yes | Restrict |
| RolePermission | Role | roleId | Yes | Cascade |
| RolePermission | Permission | permissionId | Yes | Cascade |
| AuditLog | User | userId | Yes | Restrict (never delete audit records) |
| Notification | User | userId | Yes | Cascade |
| Setting | User | updatedById | No | Set null |

---

### 4. Feature Dependencies

#### 4.1 Dependency graph

```
                    ┌──────────────────┐
                    │  Project Setup   │
                    │  (Phase 1)       │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Authentication  │
                    │  (Phase 2)       │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  System Module   │
                    │  Users, Roles,   │
                    │  AuditLog,       │
                    │  Settings, Layout│
                    │  (Phase 3)       │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  CRM MODULE      │
                    │                  │
          ┌─────────┤  Lead (Phase 4)  ├──────────┐
          │         └────────┬─────────┘          │
          │                  │                    │
          │         ┌────────▼─────────┐          │
          │         │ Opportunity      │          │
          │         │ (Phase 5)        │          │
          │         └────────┬─────────┘          │
          │                  │                    │
          │         ┌────────▼─────────┐          │
          │         │ Quotation        │          │
          │         │ (Phase 6)        │          │
          │         └────────┬─────────┘          │
          │                  │                    │
          │         ┌────────▼─────────┐          │
          │         │ Customer         │          │
          │         │ (Phase 7)        │          │
          │         └────────┬─────────┘          │
          │                  │                    │
          └──────────────────┼────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  SALES MODULE    │
                    │                  │
          ┌─────────┤ Sales Order      ├──────────┐
          │         │ (Phase 8)        │          │
          │         └────────┬─────────┘          │
          │                  │                    │
          │         ┌────────▼─────────┐          │
          │         │ Delivery Note    │          │
          │         │ (Phase 9)        │          │
          │         └────────┬─────────┘          │
          │                  │                    │
          │         ┌────────▼─────────┐          │
          │         │ Sales Invoice    │          │
          │         │ (Phase 10)       │          │
          │         └────────┬─────────┘          │
          │                  │                    │
          │         ┌────────▼─────────┐          │
          │         │ Payment          │          │
          │         │ (Phase 11)       │          │
          │         └────────┬─────────┘          │
          └──────────────────┼────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Dashboard       │
                    │  (Phase 12)      │
                    │                  │
                    │  Reporting       │
                    │  (Phase 13)      │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Deployment      │
                    │  (Phase 14)      │
                    └──────────────────┘
```

#### 4.2 Request flow diagram

```
                    ┌─────────────────────┐
                    │   Browser (Client)   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Next.js Middleware   │
                    │  (authN + authZ)      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐ ┌──────▼───────┐ ┌──────▼───────┐
    │ Server Component│ │Server Action │ │Route Handler │
    │ (data fetch)    │ │(form mutation)│ │(REST API)   │
    └─────────┬──────┘ └──────┬───────┘ └──────┬───────┘
              │                │                │
              │     ┌──────────▼──────────┐     │
              │     │   Zod Validation     │◄────┘
              │     └──────────┬──────────┘
              │                │
              │     ┌──────────▼──────────┐
              │     │  Permission Check    │
              │     └──────────┬──────────┘
              │                │
              │     ┌──────────▼──────────┐
              └────►│   Service Layer      │
                    │  (business logic,    │
                    │   state machines,    │
                    │   audit logging)     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Repository Layer    │
                    │  (Prisma queries,    │
                    │   soft-delete filter)│
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Prisma ORM          │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  MariaDB             │
                    └─────────────────────┘
```

**On mutation success:**
```
Service Layer ──► revalidatePath("/(dashboard)/leads") ──► Server Component re-renders ──► Client sees updated data
```

**On mutation error:**
```
Service Layer ──throws──► Server Action catches ──► returns { error: "..." } ──► Client form displays error ──► Toast notification
```

#### 4.3 Why this order minimizes rework

1. **Setup → Auth**: you cannot protect routes or identify who created a record without auth. Building auth first means every subsequent model can include `createdById` and every route can check permissions from day one. Retrofitting auth is extremely expensive (every route, every Server Action, every model).

2. **Auth → System Module**: Users and Roles are prerequisites for auth (Auth.js needs a User model; RBAC needs Role + Permission). The System Module also establishes the shared layout (sidebar, navigation, dashboard shell) that all CRM and Sales pages use. Building the layout here means every subsequent feature page drops into a ready shell.

3. **System → CRM Lead**: Lead is the entry point of the CRM pipeline. It has no dependency on other CRM entities. It validates the full stack (model → schema → service → repository → API → UI → permissions → audit) with the simplest domain.

4. **Lead → Opportunity**: Opportunity requires a Lead FK. The Lead→Opportunity conversion is the first cross-domain workflow. Building Lead first means the conversion logic is additive, not retrofitted.

5. **Opportunity → Quotation**: Quotation requires an Opportunity FK (must be CLOSED_WON). The Opportunity→Quotation flow is the second conversion. Line items are introduced here (reusable pattern for SalesOrder, DeliveryNote, Invoice items).

6. **Quotation → Customer**: Customer is placed here (not earlier) because in the CRM flow, a Customer is often created when a Quotation is accepted. The Customer model is shared with Sales, so it must exist before Sales Order.

7. **Customer → Sales Order**: Sales Order requires a Customer (must be ACTIVE). This is the bridge between CRM and Sales.

8. **Sales Order → Delivery Note → Invoice → Payment**: each depends on the previous. DeliveryNote updates SalesOrderItem delivered qty. Invoice depends on delivered items. Payment depends on Invoice. This chain is strictly sequential.

9. **Sales → Dashboard/Reporting**: dashboards and reports aggregate data from all entities. Building them last means all data sources exist.

10. **Dashboard/Reporting → Deployment**: deployment is the final step; it packages the complete application.

**Key principle: each phase's models are only referenced by later phases, never by earlier ones. This means no phase needs to go back and modify a completed model.**

---

### 5. Implementation Roadmap

Each phase below specifies: objectives, deliverables, Prisma models, API routes, Server Actions, React components, pages, reusable components, validation schemas, services, repositories, estimated complexity, risks, testing requirements, and acceptance criteria.

#### Phase 1: Project Setup (Wave 1, Todos T1-T4)

- **Objectives**: scaffold the Next.js 15 application with all tooling configured and working.
- **Deliverables**: running dev server, Prisma connected to MariaDB, shadcn/ui installed, ESLint/Prettier/Vitest configured, base layout.
- **Prisma models**: none (schema.prisma exists but empty).
- **API routes**: none.
- **Server Actions**: none.
- **React components**: `RootLayout`, placeholder `HomePage`.
- **Pages**: `/` (redirects to `/dashboard` or `/login`).
- **Reusable components**: none.
- **Validation schemas**: `src/config/env.ts` (env var validation).
- **Services**: none.
- **Repositories**: none.
- **Complexity**: Low.
- **Risks**: Prisma + MariaDB connection string format differences; shadcn/ui Tailwind v4 compatibility.
- **Testing**: Vitest runs with a sample test; `pnpm test` exits 0.
- **Acceptance criteria**: `pnpm dev` starts without errors; `pnpm build` succeeds; `prisma db push` connects to MariaDB; ESLint reports zero errors; Vitest runs.

#### Phase 2: Authentication (Wave 2, Todos T5-T8)

- **Objectives**: implement Auth.js v5 with credentials provider, RBAC middleware, login/register pages.
- **Deliverables**: working login/register, protected routes redirect to `/login`, middleware checks session + permission.
- **Prisma models**: User, Role, Permission, RolePermission (Auth.js adapter models: Account, Session, VerificationToken).
- **API routes**: `POST /api/auth/[...nextauth]` (Auth.js handler).
- **Server Actions**: `loginAction`, `registerAction`, `logoutAction`.
- **React components**: `LoginForm`, `RegisterForm`.
- **Pages**: `/login`, `/register`.
- **Reusable components**: `ProtectedLayout` (route group layout).
- **Validation schemas**: `login-schema.ts`, `register-schema.ts`.
- **Services**: `auth.service.ts` (register, verify credentials).
- **Repositories**: `user.repository.ts` (findByEmail, create).
- **Complexity**: Medium.
- **Risks**: Auth.js v5 configuration for App Router; JWT vs DB session tradeoff; edge middleware compatibility.
- **Testing**: unit test credential verification; integration test login flow; E2E test redirect to login.
- **Acceptance criteria**: user can register, log in, log out; unauthenticated requests redirect to `/login`; middleware blocks users without required permission; session persists across page navigations.

#### Phase 3: System Module (Wave 3, Todos T9-T12)

- **Objectives**: implement Users CRUD, Roles+Permissions management, AuditLog, Settings, and the shared dashboard layout (sidebar, topbar, navigation).
- **Deliverables**: full Users management page, Roles management, Settings page, audit log viewer, dashboard shell with navigation.
- **Prisma models**: AuditLog, Notification, Setting, Counter.
- **API routes**: `GET/POST /api/users`, `GET/PUT/DELETE /api/users/[id]`, `GET/POST /api/roles`, `GET /api/permissions`, `GET/POST /api/settings`, `GET /api/audit-logs`.
- **Server Actions**: `createUserAction`, `updateUserAction`, `deleteUserAction`, `createRoleAction`, `updateRoleAction`, `updateSettingsAction`.
- **React components**: `UserTable`, `UserForm`, `RoleTable`, `RoleForm`, `SettingsForm`, `AuditLogTable`, `Sidebar`, `Topbar`, `Breadcrumb`, `NotificationDropdown`.
- **Pages**: `/users`, `/users/new`, `/users/[id]/edit`, `/roles`, `/roles/new`, `/roles/[id]/edit`, `/settings`, `/audit-logs`.
- **Reusable components**: `DataTable` (TanStack Table wrapper), `StatusBadge`, `PageHeader`, `EmptyState`, `FormTextField`, `FormSelectField`, `ConfirmDialog`.
- **Validation schemas**: `user-create.ts`, `user-update.ts`, `user-query.ts`, `role-create.ts`, `role-update.ts`, `setting-update.ts`, `audit-log-query.ts`.
- **Services**: `user.service.ts`, `role.service.ts`, `setting.service.ts`, `audit.service.ts`, `notification.service.ts`.
- **Repositories**: `user.repository.ts` (extended), `role.repository.ts`, `permission.repository.ts`, `setting.repository.ts`, `audit-log.repository.ts`, `notification.repository.ts`.
- **Complexity**: Medium-High (lots of shared infrastructure established here).
- **Risks**: reusable components must be flexible enough for all future features; permission system must be granular but simple.
- **Testing**: unit tests for permission checker; integration tests for Users CRUD; E2E test for user management.
- **Acceptance criteria**: Admin can create/edit/deactivate users; Admin can create roles and assign permissions; Settings are editable and persisted; AuditLog records all changes; sidebar navigation works; notification dropdown shows unread count.

#### Phase 4: CRM Lead (Wave 4, Todos T13-T16)

- **Objectives**: implement the Lead domain end-to-end (model, schema, service with state machine, repository, API, UI).
- **Deliverables**: Lead list with table (filter, sort, paginate, search), Lead create/edit forms, Lead detail page with status transitions.
- **Prisma models**: Lead, Counter (LEAD prefix).
- **API routes**: `GET/POST /api/leads`, `GET/PUT/DELETE /api/leads/[id]`, `POST /api/leads/[id]/transition` (state machine).
- **Server Actions**: `createLeadAction`, `updateLeadAction`, `deleteLeadAction`, `transitionLeadAction`.
- **React components**: `LeadTable`, `LeadForm`, `LeadDetail`, `LeadStatusBadge`, `LeadTransitionButton`.
- **Pages**: `/leads`, `/leads/new`, `/leads/[id]`, `/leads/[id]/edit`.
- **Reusable components**: (uses DataTable, StatusBadge, PageHeader from Phase 3).
- **Validation schemas**: `lead-create.ts`, `lead-update.ts`, `lead-query.ts`, `lead-transition.ts`.
- **Services**: `lead.service.ts` (CRUD + state machine + conversion to Opportunity stub).
- **Repositories**: `lead.repository.ts`.
- **Complexity**: Medium (first full domain — establishes the pattern).
- **Risks**: state machine must reject invalid transitions; document number generation must be atomic.
- **Testing**: unit tests for state machine (all valid + invalid transitions); integration tests for CRUD; E2E test for lead creation and status change.
- **Acceptance criteria**: Lead list paginates, sorts, filters by status, searches by name/email; Lead form validates with Zod; state transitions only allow valid paths; document number auto-generated; audit log records creation and transitions.

#### Phase 5: CRM Opportunity (Wave 5, Todos T17-T20)

- **Objectives**: implement Opportunity with Lead→Opportunity conversion, stage tracking, close won/lost.
- **Deliverables**: Opportunity list, form, detail page with stage pipeline view; Lead detail page gains "Convert to Opportunity" button.
- **Prisma models**: Opportunity, Counter (OPP prefix).
- **API routes**: `GET/POST /api/opportunities`, `GET/PUT/DELETE /api/opportunities/[id]`, `POST /api/opportunities/[id]/transition`, `POST /api/leads/[id]/convert`.
- **Server Actions**: `createOpportunityAction`, `updateOpportunityAction`, `transitionOpportunityAction`, `convertLeadAction`.
- **React components**: `OpportunityTable`, `OpportunityForm`, `OpportunityDetail`, `OpportunityPipeline` (kanban-style stage view), `OpportunityStageBadge`.
- **Pages**: `/opportunities`, `/opportunities/new`, `/opportunities/[id]`, `/opportunities/[id]/edit`.
- **Validation schemas**: `opportunity-create.ts`, `opportunity-update.ts`, `opportunity-query.ts`, `opportunity-transition.ts`, `lead-convert.ts`.
- **Services**: `opportunity.service.ts` (CRUD + state machine + Lead conversion).
- **Repositories**: `opportunity.repository.ts`.
- **Complexity**: Medium.
- **Risks**: conversion must validate Lead is QUALIFIED; stage pipeline UI may be complex.
- **Testing**: unit tests for conversion logic and state machine; integration tests for CRUD; E2E test for Lead→Opportunity flow.
- **Acceptance criteria**: Lead can be converted to Opportunity (only if QUALIFIED); Opportunity stages advance correctly; pipeline view shows opportunities by stage; closing won/lost works; audit log records conversions and stage changes.

#### Phase 6: CRM Quotation (Wave 6, Todos T21-T24)

- **Objectives**: implement Quotation with line items, totals calculation, status flow (draft→sent→accepted), PDF placeholder.
- **Deliverables**: Quotation list, form with dynamic line items, detail page with totals and status transitions.
- **Prisma models**: Quotation, QuotationItem, Counter (QUO prefix).
- **API routes**: `GET/POST /api/quotations`, `GET/PUT/DELETE /api/quotations/[id]`, `POST /api/quotations/[id]/transition`, `POST /api/quotations/[id]/items`, `PUT/DELETE /api/quotations/[id]/items/[itemId]`.
- **Server Actions**: `createQuotationAction`, `updateQuotationAction`, `transitionQuotationAction`, `addQuotationItemAction`, `updateQuotationItemAction`, `removeQuotationItemAction`.
- **React components**: `QuotationTable`, `QuotationForm`, `QuotationItemEditor` (dynamic line items with add/remove), `QuotationDetail`, `QuotationTotals` (subtotal, discount, tax, grand total).
- **Pages**: `/quotations`, `/quotations/new`, `/quotations/[id]`, `/quotations/[id]/edit`.
- **Validation schemas**: `quotation-create.ts`, `quotation-update.ts`, `quotation-query.ts`, `quotation-transition.ts`, `quotation-item-create.ts`, `quotation-item-update.ts`.
- **Services**: `quotation.service.ts` (CRUD + state machine + totals calculation + line item management).
- **Repositories**: `quotation.repository.ts`, `quotation-item.repository.ts`.
- **Complexity**: Medium-High (first entity with line items and calculated totals).
- **Risks**: totals must recalculate on line item changes; line item CRUD must be transactional with quotation; dynamic form for line items is complex.
- **Testing**: unit tests for totals calculation; unit tests for state machine; integration tests for line item CRUD; E2E test for quotation creation with items.
- **Acceptance criteria**: Quotation form supports dynamic line items (add/remove); totals auto-calculate (subtotal, discount, tax, grand total); status transitions work; validity date enforced; audit log records all changes.

#### Phase 7: CRM Customer (Wave 7, Todos T25-T28)

- **Objectives**: implement Customer with contacts, addresses, and optional creation from Quotation acceptance.
- **Deliverables**: Customer list, form with contact/address management, detail page showing purchase history.
- **Prisma models**: Customer, CustomerContact, CustomerAddress, Counter (CUST prefix).
- **API routes**: `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/[id]`, `POST /api/customers/[id]/contacts`, `PUT/DELETE /api/customers/[id]/contacts/[contactId]`, `POST /api/customers/[id]/addresses`, `PUT/DELETE /api/customers/[id]/addresses/[addressId]`.
- **Server Actions**: `createCustomerAction`, `updateCustomerAction`, `deleteCustomerAction`, `createContactAction`, `updateContactAction`, `deleteContactAction`, `createAddressAction`, `updateAddressAction`, `deleteAddressAction`.
- **React components**: `CustomerTable`, `CustomerForm`, `ContactList` (inline editable), `AddressList` (inline editable), `CustomerDetail` (with tabs: info, contacts, addresses, history).
- **Pages**: `/customers`, `/customers/new`, `/customers/[id]`, `/customers/[id]/edit`.
- **Validation schemas**: `customer-create.ts`, `customer-update.ts`, `customer-query.ts`, `contact-create.ts`, `contact-update.ts`, `address-create.ts`, `address-update.ts`.
- **Services**: `customer.service.ts` (CRUD + status management + contact/address management).
- **Repositories**: `customer.repository.ts`, `customer-contact.repository.ts`, `customer-address.repository.ts`.
- **Complexity**: Medium.
- **Risks**: inline contact/address editing requires careful state management; customer status blocks downstream Sales operations.
- **Testing**: unit tests for status transitions; integration tests for contact/address CRUD; E2E test for customer creation with contacts.
- **Acceptance criteria**: Customer form supports multiple contacts and addresses; primary contact enforced (one per customer); status transitions work; BLOCKED customer cannot create SalesOrders (enforced in SalesOrder service); audit log records changes.

#### Phase 8: Sales Order (Wave 8, Todos T29-T32)

- **Objectives**: implement SalesOrder with line items, Quotation→SalesOrder conversion, and automatic status transitions driven by downstream documents.
- **Deliverables**: SalesOrder list, form with line items, detail page showing delivery/invoice/payment status.
- **Prisma models**: SalesOrder, SalesOrderItem, Counter (SO prefix).
- **API routes**: `GET/POST /api/sales-orders`, `GET/PUT/DELETE /api/sales-orders/[id]`, `POST /api/sales-orders/[id]/transition`, `POST /api/quotations/[id]/convert`.
- **Server Actions**: `createSalesOrderAction`, `updateSalesOrderAction`, `transitionSalesOrderAction`, `convertQuotationAction`.
- **React components**: `SalesOrderTable`, `SalesOrderForm`, `SalesOrderItemEditor`, `SalesOrderDetail` (with delivery/invoice status summary).
- **Pages**: `/sales-orders`, `/sales-orders/new`, `/sales-orders/[id]`, `/sales-orders/[id]/edit`.
- **Validation schemas**: `sales-order-create.ts`, `sales-order-update.ts`, `sales-order-query.ts`, `sales-order-transition.ts`, `quotation-convert.ts`.
- **Services**: `sales-order.service.ts` (CRUD + state machine + Quotation conversion + auto-status from DN/Invoice/Payment).
- **Repositories**: `sales-order.repository.ts`, `sales-order-item.repository.ts`.
- **Complexity**: High (auto-status transitions, Quotation conversion with line item copy).
- **Risks**: auto-status logic must be idempotent; Quotation conversion must copy line items correctly; delivered qty tracking on items.
- **Testing**: unit tests for auto-status logic (FULFILLING when first DN, DELIVERED when all delivered, etc.); unit tests for Quotation conversion; integration tests for CRUD; E2E test for Quotation→SalesOrder flow.
- **Acceptance criteria**: SalesOrder can be created manually or from an ACCEPTED Quotation; line items copy correctly from Quotation; status transitions correctly based on downstream documents; deliveredQuantity tracked per item; audit log records all changes.

#### Phase 9: Delivery Note (Wave 9, Todos T33-T36)

- **Objectives**: implement DeliveryNote with line items, partial delivery support, and SalesOrderItem delivered qty updates.
- **Deliverables**: DeliveryNote list, form, detail page; SalesOrder detail shows delivery progress.
- **Prisma models**: DeliveryNote, DeliveryNoteItem, Counter (DN prefix).
- **API routes**: `GET/POST /api/delivery-notes`, `GET/PUT/DELETE /api/delivery-notes/[id]`, `POST /api/delivery-notes/[id]/transition`.
- **Server Actions**: `createDeliveryNoteAction`, `updateDeliveryNoteAction`, `transitionDeliveryNoteAction`.
- **React components**: `DeliveryNoteTable`, `DeliveryNoteForm`, `DeliveryNoteItemEditor` (shows SalesOrderItem remaining qty), `DeliveryNoteDetail`.
- **Pages**: `/delivery-notes`, `/delivery-notes/new`, `/delivery-notes/[id]`, `/delivery-notes/[id]/edit`.
- **Validation schemas**: `delivery-note-create.ts`, `delivery-note-update.ts`, `delivery-note-query.ts`, `delivery-note-transition.ts`.
- **Services**: `delivery-note.service.ts` (CRUD + state machine + delivered qty update + SalesOrder auto-status).
- **Repositories**: `delivery-note.repository.ts`, `delivery-note-item.repository.ts`.
- **Complexity**: High (partial delivery validation, cross-entity qty updates).
- **Risks**: delivered qty must not exceed ordered qty; transactional update of SalesOrderItem.deliveredQuantity; auto-transition of SalesOrder to DELIVERED.
- **Testing**: unit tests for delivered qty validation (exceeds ordered → error); unit tests for SalesOrder auto-status; integration tests for CRUD; E2E test for SalesOrder→DeliveryNote flow (partial + full delivery).
- **Acceptance criteria**: DeliveryNote can only be created for CONFIRMED/FULFILLING SalesOrders; line item qty cannot exceed remaining ordered qty; deliveredQuantity updated on SalesOrderItem; SalesOrder auto-transitions to FULFILLING then DELIVERED; audit log records changes.

#### Phase 10: Sales Invoice (Wave 10, Todos T37-T40)

- **Objectives**: implement SalesInvoice with line items, due date calculation, paidAmount tracking, and auto-status from Payments.
- **Deliverables**: SalesInvoice list, form, detail page showing payment status.
- **Prisma models**: SalesInvoice, SalesInvoiceItem, Counter (INV prefix).
- **API routes**: `GET/POST /api/sales-invoices`, `GET/PUT/DELETE /api/sales-invoices/[id]`, `POST /api/sales-invoices/[id]/transition`.
- **Server Actions**: `createSalesInvoiceAction`, `updateSalesInvoiceAction`, `transitionSalesInvoiceAction`.
- **React components**: `SalesInvoiceTable`, `SalesInvoiceForm`, `SalesInvoiceItemEditor`, `SalesInvoiceDetail` (with payment status summary).
- **Pages**: `/sales-invoices`, `/sales-invoices/new`, `/sales-invoices/[id]`, `/sales-invoices/[id]/edit`.
- **Validation schemas**: `sales-invoice-create.ts`, `sales-invoice-update.ts`, `sales-invoice-query.ts`, `sales-invoice-transition.ts`.
- **Services**: `sales-invoice.service.ts` (CRUD + state machine + due date calc + paidAmount update + SalesOrder auto-status).
- **Repositories**: `sales-invoice.repository.ts`, `sales-invoice-item.repository.ts`.
- **Complexity**: High (paidAmount tracking, overdue detection, auto-status).
- **Risks**: paidAmount must be recalculated when Payment is added/removed; overdue status requires date comparison; SalesOrder auto-transition to INVOICED.
- **Testing**: unit tests for due date calculation; unit tests for paidAmount update; unit tests for overdue detection; integration tests for CRUD; E2E test for SalesOrder→Invoice flow.
- **Acceptance criteria**: Invoice can only be created for DELIVERED/FULFILLING SalesOrders; due date computed from issue date + customer payment terms; paidAmount tracks cumulative payments; status auto-transitions to PARTIALLY_PAID/PAID; SalesOrder auto-transitions to INVOICED; audit log records changes.

#### Phase 11: Payment (Wave 11, Todos T41-T44)

- **Objectives**: implement Payment recording, invoice paidAmount update, and SalesOrder completion check.
- **Deliverables**: Payment list, form, detail page; Invoice detail shows payment history.
- **Prisma models**: Payment, Counter (PAY prefix).
- **API routes**: `GET/POST /api/payments`, `GET/PUT/DELETE /api/payments/[id]`, `POST /api/payments/[id]/transition`.
- **Server Actions**: `createPaymentAction`, `updatePaymentAction`, `transitionPaymentAction`.
- **React components**: `PaymentTable`, `PaymentForm`, `PaymentDetail`.
- **Pages**: `/payments`, `/payments/new`, `/payments/[id]`, `/payments/[id]/edit`.
- **Validation schemas**: `payment-create.ts`, `payment-update.ts`, `payment-query.ts`, `payment-transition.ts`.
- **Services**: `payment.service.ts` (CRUD + state machine + invoice paidAmount update + SalesOrder completion check).
- **Repositories**: `payment.repository.ts`.
- **Complexity**: Medium-High (payment allocation, invoice status update, SalesOrder completion).
- **Risks**: payment amount cannot exceed remaining invoice balance; transactional update of invoice paidAmount and status; SalesOrder auto-transition to COMPLETED.
- **Testing**: unit tests for balance validation; unit tests for invoice status update; unit tests for SalesOrder completion; integration tests for CRUD; E2E test for Invoice→Payment flow.
- **Acceptance criteria**: Payment can only be created for OPEN/PARTIALLY_PAID/OVERDUE invoices; amount cannot exceed remaining balance; invoice paidAmount and status update correctly; SalesOrder auto-transitions to COMPLETED when fully paid; audit log records changes.

#### Phase 12: Dashboard (Wave 12, Todos T45-T47)

- **Objectives**: implement the main dashboard with KPI cards, recent activity, and pipeline summary.
- **Deliverables**: Dashboard page with KPI cards (total leads, open opportunities, pending orders, overdue invoices), recent activity feed (latest audit logs), sales pipeline summary (opportunities by stage).
- **Prisma models**: none (reads existing models).
- **API routes**: `GET /api/dashboard/kpis`, `GET /api/dashboard/activity`, `GET /api/dashboard/pipeline`.
- **Server Actions**: none (read-only).
- **React components**: `KpiCard`, `ActivityFeed`, `PipelineSummary` (bar chart or funnel), `DashboardLayout`.
- **Pages**: `/dashboard`.
- **Validation schemas**: none.
- **Services**: `dashboard.service.ts` (aggregation queries).
- **Repositories**: uses existing repositories with new aggregation methods.
- **Complexity**: Medium (aggregation queries, chart rendering).
- **Risks**: aggregation queries may be slow without proper indexes; chart library compatibility.
- **Testing**: unit tests for KPI calculations; integration tests for dashboard data; E2E test for dashboard rendering.
- **Acceptance criteria**: dashboard loads in under 1s; KPI cards show correct counts; activity feed shows latest 20 changes; pipeline summary shows opportunity counts by stage; data is real-time (revalidated on each visit).

#### Phase 13: Reporting — DEFERRED (design documented for future implementation)

> **Deferred per user decision.** Not part of the initial build. Will be added after senior review.

- **Objectives**: implement three core reports: lead source report, sales pipeline report, revenue report.
- **Deliverables**: Reports page with tabbed views for each report, date range filter, and data table/chart.
- **Prisma models**: none (reads existing models).
- **API routes**: `GET /api/reports/lead-sources`, `GET /api/reports/sales-pipeline`, `GET /api/reports/revenue`.
- **Server Actions**: none (read-only).
- **React components**: `ReportTabs`, `LeadSourceReport`, `SalesPipelineReport`, `RevenueReport`, `DateRangePicker`.
- **Pages**: `/reports`.
- **Validation schemas**: `report-query.ts` (date range, filters).
- **Services**: `report.service.ts`.
- **Repositories**: uses existing repositories with new aggregation methods.
- **Complexity**: Medium (aggregation queries, date filtering).
- **Risks**: complex aggregation queries; date range handling across timezones.
- **Testing**: unit tests for report calculations; integration tests for date filtering; E2E test for report viewing.
- **Acceptance criteria**: reports filter by date range; lead source report shows lead counts by source; sales pipeline report shows opportunity values by stage; revenue report shows invoiced vs collected amounts by month; data is accurate.

#### Phase 14: Deployment — DEFERRED (design documented for future implementation)

> **Deferred per user decision.** Not part of the initial build. The project runs on localhost (`pnpm dev`) only. Docker deployment will be added after senior review.

- **Objectives**: containerize the application with Docker and docker-compose for production deployment.
- **Deliverables**: multi-stage Dockerfile, docker-compose.yml (app + MariaDB), `.env.example`, production build verification.
- **Prisma models**: none.
- **API routes**: none.
- **Server Actions**: none.
- **React components**: none.
- **Pages**: none.
- **Validation schemas**: none.
- **Services**: none.
- **Repositories**: none.
- **Complexity**: Low-Medium.
- **Risks**: Prisma migration in Docker entrypoint; environment variable management; MariaDB initialization.
- **Testing**: `docker-compose up` starts all services; `docker-compose exec app pnpm build` succeeds; health check endpoint responds.
- **Acceptance criteria**: `docker-compose up` starts MariaDB + app; app connects to MariaDB; `prisma migrate deploy` runs on startup; production build succeeds; app is accessible on configured port.

---

### 6. API Design

Every API endpoint follows the same contract: Zod validation on input, permission check, service layer call, typed error handling, and a consistent response shape.

#### 6.1 Response envelope

**Success (Route Handler):** `{ "data": <T>, "meta": { "page": 1, "pageSize": 20, "total": 100, "totalPages": 5 } }` — for list responses. `{ "data": <T> }` — for single-item responses (no meta).

**Success (Server Action):** `{ "success": true, "data": <T> }`

**Error (both):** `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`

Error codes: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409 — invalid state transition), `INTERNAL_ERROR` (500).

#### 6.2 Endpoint catalog

Each domain follows the same RESTful pattern. Shown once for Lead; all others follow identically.

| Method | Path | Purpose | Permission | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/api/leads` | List leads (paginated, filtered, sorted) | `leads:read` | Query: `?page=1&pageSize=20&sort=createdAt:desc&status=NEW&search=john` | `{ data: Lead[], meta: PaginationMeta }` |
| POST | `/api/leads` | Create a lead | `leads:create` | `{ firstName, lastName, email?, phone?, company?, jobTitle?, source?, assignedToId?, notes? }` | `{ data: Lead }` |
| GET | `/api/leads/[id]` | Get a single lead | `leads:read` | — | `{ data: Lead }` |
| PUT | `/api/leads/[id]` | Update a lead | `leads:update` | Same as POST (partial) | `{ data: Lead }` |
| DELETE | `/api/leads/[id]` | Soft-delete a lead | `leads:delete` | — | `{ data: { id } }` |
| POST | `/api/leads/[id]/transition` | Change lead status | `leads:update` | `{ to: "QUALIFIED", reason? }` | `{ data: Lead }` |
| POST | `/api/leads/[id]/convert` | Convert to Opportunity | `leads:update` | `{ title, estimatedValue, expectedCloseDate }` | `{ data: { lead, opportunity } }` |

**Error cases per endpoint:**
- `POST /api/leads`: 400 if Zod validation fails; 401 if not authenticated; 403 if lacking `leads:create`.
- `PUT /api/leads/[id]`: 404 if lead not found (or soft-deleted); 409 if trying to modify a DISQUALIFIED lead's status.
- `POST /api/leads/[id]/transition`: 409 if transition is invalid.
- `POST /api/leads/[id]/convert`: 409 if lead is not QUALIFIED; 409 if lead already has an Opportunity.

**Full endpoint list (all domains follow the same pattern):**

| Domain | Endpoints |
|---|---|
| Auth | `POST /api/auth/[...nextauth]` (Auth.js handler) |
| Users | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/[id]` |
| Roles | `GET/POST /api/roles`, `GET/PUT/DELETE /api/roles/[id]` |
| Permissions | `GET /api/permissions` (read-only, seeded) |
| Settings | `GET/PUT /api/settings` (key-based) |
| AuditLogs | `GET /api/audit-logs` (read-only, paginated) |
| Leads | CRUD + `/transition` + `/convert` |
| Opportunities | CRUD + `/transition` + `/convert` (to Quotation) |
| Quotations | CRUD + `/transition` + `/items` (sub-resource CRUD) + `/convert` (to SalesOrder) |
| Customers | CRUD + `/contacts` (sub-resource CRUD) + `/addresses` (sub-resource CRUD) |
| SalesOrders | CRUD + `/transition` + `/items` (sub-resource CRUD) + `/convert` (from Quotation) |
| DeliveryNotes | CRUD + `/transition` + `/items` (sub-resource CRUD) |
| SalesInvoices | CRUD + `/transition` + `/items` (sub-resource CRUD) |
| Payments | CRUD + `/transition` |
| Dashboard | `GET /api/dashboard/kpis`, `GET /api/dashboard/activity`, `GET /api/dashboard/pipeline` |
| Reports | `GET /api/reports/lead-sources`, `GET /api/reports/sales-pipeline`, `GET /api/reports/revenue` |

**Sub-resource pattern (e.g., Quotation Items):** `POST /api/quotations/[id]/items` (add), `PUT /api/quotations/[id]/items/[itemId]` (update), `DELETE /api/quotations/[id]/items/[itemId]` (remove). Recalculates quotation totals on every item change (transactional).

**Conversion endpoints (cross-domain):**
- `POST /api/leads/[id]/convert` → creates Opportunity (validates Lead is QUALIFIED)
- `POST /api/opportunities/[id]/convert` → creates Quotation (validates Opportunity is CLOSED_WON)
- `POST /api/quotations/[id]/convert` → creates SalesOrder (validates Quotation is ACCEPTED)
- Each returns both the source (updated) and target (new) entity.

#### 6.3 Server Actions catalog

Server Actions are the primary mutation path for UI forms. Each Route Handler endpoint has a corresponding Server Action.

**Server Action contract:** (1) Validate input with Zod → throw `ValidationError` on failure. (2) Check `auth()` session → throw `UnauthorizedError` if none. (3) Check permission via `hasPermission()` → throw `ForbiddenError` if denied. (4) Call service layer → service throws domain errors. (5) On success: `revalidatePath()` and return `{ success: true, data }`. (6) On error: return `{ success: false, error: { code, message } }`.

---

### 7. UI Architecture

#### 7.1 Dashboard layout
- **Sidebar**: collapsible, grouped by module (CRM, Sales, System). Nav items in `src/config/nav.ts`. Active route highlighted. Permission-filtered.
- **Topbar**: global search (future), notification bell (unread count), user dropdown (profile, settings, logout).
- **Content area**: renders the current page (Server Component). Loading state via `loading.tsx`.

#### 7.2 Navigation structure
Dashboard → CRM (Leads, Opportunities, Quotations, Customers) → Sales (Sales Orders, Delivery Notes, Invoices, Payments) → System (Users, Roles, Audit Logs, Settings) → Reports. Each item permission-filtered.

#### 7.3 Data tables (TanStack Table)
- Reusable `DataTable` component: props for columns, data, pagination, sorting, filtering. All state URL-based (`?page=2&pageSize=20&sort=createdAt:desc&status=ACTIVE&search=john`).
- Server Component reads URL params, calls service, passes data to Client Component `DataTable`.
- Column definitions per-domain. Features: column sorting, column visibility toggle, row selection, row click → detail page.

#### 7.4 Forms (React Hook Form + Zod)
- Zod schema → `useForm` with `zodResolver` → reusable field components (`FormTextField`, `FormSelectField`, `FormTextareaField`).
- On submit: call Server Action. Success → `router.push` + toast. Failure → inline errors.
- Dynamic line items: `useFieldArray` for add/remove rows.

#### 7.5 Dialogs
- `ConfirmDialog` (delete confirmations), `FormDialog` (inline edits), `DetailDialog` (quick-view).

#### 7.6 Pagination
- Offset pagination (page + pageSize). "Showing 1-20 of 100" + Prev/Next + page size selector (10/20/50/100). State in URL.

#### 7.7 Search, Filtering, Sorting
- **Search**: text input, debounced 300ms, server-side `LIKE`. URL: `?search=john`.
- **Filtering**: dropdown filters (status, source, assignedTo). URL: `?status=ACTIVE&source=WEBSITE`. Multiple filters AND.
- **Sorting**: column header click. URL: `?sort=createdAt:desc`. Single-column sort.

#### 7.8 Status badges
- Reusable `StatusBadge`: props `status` + `domain`. Each domain defines status→color mapping in `constants.ts`. Uses shadcn/ui `Badge`.

#### 7.9 Loading states
- Route-level: `loading.tsx` skeleton matching page layout. Component-level: `Skeleton` from shadcn/ui. Button-level: spinner + disable on pending.

#### 7.10 Error handling (UI)
- Route-level: `error.tsx` with "Try Again" (`reset()`). Form-level: inline Zod errors + server error alert. Toast: success (green) / error (red) via `sonner`.

#### 7.11 Empty states
- Reusable `EmptyState`: icon + title + description + optional action button. Used in tables, detail sub-sections, dashboard.

#### 7.12 Responsive behavior
- Desktop (lg+): full sidebar, all columns, multi-column forms. Tablet (md): icon-only sidebar, fewer columns, single-column forms. Mobile (sm): hamburger sidebar, card-based list, single-column forms.

---

### 8. State Management

#### 8.1 Server Components (default)
All list pages, detail pages, dashboard. Fetch data server-side via service layer. No client-side fetching for initial render. Reduces JS shipped, direct DB access, no API round-trip.

#### 8.2 Client Components (only for interactivity)
Forms (React Hook Form), data tables (TanStack Table), dialogs, dropdowns, status transition buttons. `"use client"` only at leaf component level, never at page level.

#### 8.3 Server Actions
Primary mutation path. No client-side `fetch()` for form submissions. `revalidatePath()` on success. No optimistic updates in initial build.

#### 8.4 React Query / TanStack Query
NOT used in initial build. Server Components handle fetching; Server Actions handle mutations. Add later if real-time polling, optimistic updates, or offline support needed.

#### 8.5 Context
- `ThemeContext` (dark/light via `next-themes`).
- `NotificationContext` (notification dropdown state).
- No global state for domain data — always fetched per-route server-side.

#### 8.6 URL state
Table state (page, pageSize, sort, filters, search) in URL search params. Tab state via `?tab=contacts`. Dialog open/close via local `useState`.

#### 8.7 Local state (useState)
Form state (React Hook Form), dialog/dropdown open, selected rows, debounced search input.

#### 8.8 Caching strategy
- Server Component data: Next.js Data Cache + `revalidatePath` on mutation.
- Static data (nav, permissions, status maps): static imports.
- Settings: in-memory singleton on server, invalidated on update.
- No client-side cache.

---

### 9. Authentication

#### 9.1 Auth.js v5 configuration
- **Provider**: Credentials (email + password). OAuth (Google, Microsoft) documented as future.
- **Session strategy**: JWT (httpOnly cookie, edge-compatible for middleware).
- **Prisma adapter**: configured for account linking; JWT is active strategy.
- **Callbacks**: `jwt` embeds userId, roleId, permissions array. `session` exposes them on session object.
- **Password hashing**: bcrypt, 12 rounds.
- **Files**: `src/lib/auth/auth.config.ts`, `src/lib/auth/auth.ts`, `src/lib/auth/permissions.ts`, `src/middleware.ts`.

#### 9.2 RBAC
- **Model**: User → Role (1:N initially) → RolePermission (M2M) → Permission.
- **Permission format**: `resource:action` (e.g., `leads:create`).
- **Definitions**: const array in `src/lib/auth/permissions.ts`, seeded to DB.
- **Checker**: `hasPermission(user, "leads:create")` — array includes check.
- **Enforcement**: (1) Middleware (coarse, route-prefix level), (2) Server Action (fine, per-action), (3) UI (cosmetic, hide buttons/items).

#### 9.3 Protected routes
- Public: `/login`, `/register`, `/api/auth/*`. All others require session. `(dashboard)/layout.tsx` checks `auth()` as defense-in-depth.

#### 9.4 Middleware
1. Skip public routes. 2. Check session → redirect `/login`. 3. Check route-prefix permission → redirect `/dashboard` if denied. 4. Proceed. Route-to-permission mapping in `permissions.ts`.

#### 9.5 Session management
- 24h lifetime, sliding expiration (refreshed on each request). `signOut()` clears cookie. `auth()` in Server Components/Actions.

#### 9.6 Seeded roles

| Role | Key Permissions |
|---|---|
| Admin | All (wildcard) |
| Sales Manager | CRM:*, Sales:*, reports:read |
| Sales Rep | leads/opportunities/quotations/customers: read+create+update, sales-orders:read |
| Accountant | invoices:*, payments:*, customers:read, reports:read |

---

### 10. Validation

#### 10.1 Zod as single validation layer
- One schema per operation: `<domain>-create.ts`, `<domain>-update.ts`, `<domain>-query.ts`.
- Shared client + server — no drift.
- Composition: base schema → create (required) → update (`.partial()`) → query (coerced pagination/filter params).

#### 10.2 Form validation (client)
React Hook Form + `zodResolver`. Validation on blur. Errors inline via `FormTextField`. Submit allowed but errors shown if invalid.

#### 10.3 API validation (server)
Every Server Action and Route Handler validates with the same Zod schema. Failure → `ValidationError` (400 with field-level details). Authoritative — client validation is UX, server is security.

#### 10.4 Database validation
- Unique constraints: catch Prisma `P2002` → `ConflictError` with user-friendly message.
- FK constraints: catch `P2003` → `ConflictError`.
- Required fields: Prisma schema (non-nullable). Zod catches before Prisma.
- Type coercion: `z.coerce.number()`, `z.coerce.date()` for URL query params.

#### 10.5 State machine validation
Validated in service layer (not Zod). Transition table as const in `src/features/<domain>/types.ts`. Invalid transition → `ConflictError`.

---

### 11. Error Handling

#### 11.1 Error class hierarchy
`AppError` (base: statusCode, code, message, details?) → `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409). All in `src/lib/errors/`.

#### 11.2 Error flow
- **Service layer**: throws typed errors (`throw new NotFoundError("Lead not found")`).
- **Server Action**: try/catch → returns `{ success: false, error: { code, message } }` for `AppError`; logs and returns `INTERNAL_ERROR` for unexpected.
- **Route Handler**: try/catch → returns `NextResponse.json({ error }, { status: error.statusCode })` for `AppError`; 500 for unexpected.

#### 11.3 Error boundaries
Root `error.tsx` (full-page error + "Try Again"). Route segment `error.tsx` where recovery differs (form vs list).

#### 11.4 Logging
`console.error` for server-side (captured by Docker logs). Structured logging (Winston/Pino) documented as future. AuditLog table for business events (separate from error logging).

#### 11.5 Toast notifications
Success (green) / error (red) via `sonner`. 4s duration with close button. Called from Client Component after Server Action returns.

#### 11.6 Retry strategies
No automatic retry. User sees error toast and re-submits manually. Auto-retry with backoff documented as future.

#### 11.7 Validation errors (form)
Client-side: React Hook Form + Zod inline. Server-side: Server Action returns `VALIDATION_ERROR` with `details[]` → Client maps to field errors via `setError()`.

#### 11.8 Unexpected failures
Service layer uncaught → Server Action catches, logs, returns `INTERNAL_ERROR` (500). Client sees generic toast. Error boundary catches Server Component render errors. Never expose stack traces in production.

---

### 12. Testing Strategy

#### 12.1 Testing layers

| Layer | Tool | Scope | Location |
|---|---|---|---|
| Unit | Vitest | Pure functions, service methods, state machines, utils | Co-located: `*.test.ts` next to source |
| Integration | Vitest + MSW | Service + Repository + Prisma (test DB) | `src/features/<domain>/__tests__/` |
| E2E | Playwright | Full user workflows (browser) | `tests/e2e/*.spec.ts` |

#### 12.2 Unit testing
- **Target**: service layer methods (CRUD, state machine transitions, conversions, calculations), utility functions (document number generation, pagination, formatting).
- **Mocking**: repository layer is mocked (vi.mock) — tests the service logic in isolation.
- **State machine tests**: for each entity, test every allowed transition (passes) and every disallowed transition (throws ConflictError).
- **Calculation tests**: quotation/invoice totals, payment allocation, delivered qty validation.

#### 12.3 Integration testing
- **Target**: service + repository + real Prisma queries against a test MariaDB database.
- **Test database**: separate `crm_test` database, reset before each test suite (truncate tables).
- **MSW**: for testing Server Actions and Route Handlers in isolation — mock the HTTP layer, not the service.
- **Fixtures**: seed test data (users, roles, leads) in `beforeEach`.

#### 12.4 E2E testing
- **Target**: full browser workflows.
- **Two core workflows**:
  1. CRM workflow: login → create lead → convert to opportunity → create quotation → accept → convert to sales order.
  2. Sales workflow: select customer → create sales order → create delivery note → create invoice → record payment.
- **Auth**: test suite logs in via the login page (or inject session cookie).
- **Playwright config**: `tests/playwright.config.ts`. Runs against `pnpm dev` or a preview build.

#### 12.5 Database testing
- Test database: `crm_test` (separate from development `crm_dev`).
- Prisma client in tests: uses `DATABASE_URL_TEST` environment variable.
- Each test suite truncates relevant tables in `beforeEach` to ensure isolation.
- No transactions for test isolation (MariaDB DDL doesn't always roll back cleanly); truncate is simpler and more reliable.

#### 12.6 Testing tools
- **Vitest**: test runner, assertions, mocking (`vi.mock`, `vi.fn`).
- **MSW** (Mock Service Worker): HTTP mocking for Server Action / Route Handler tests.
- **Playwright**: browser automation for E2E.
- **@testing-library/react**: component testing (for reusable UI components like DataTable, forms).
- **Factory functions**: `src/test/factories.ts` — create test entities with sensible defaults (e.g., `createTestLead({ status: "QUALIFIED" })`).

#### 12.7 Folder structure
```
src/
├── features/lead/services/
│   ├── lead.service.ts
│   └── lead.service.test.ts          # Unit test (repo mocked)
├── features/lead/__tests__/
│   └── lead.integration.test.ts      # Integration test (real DB)
├── components/data-table/
│   └── data-table.test.tsx           # Component test
tests/
├── e2e/
│   ├── crm-workflow.spec.ts
│   └── sales-workflow.spec.ts
├── factories.ts                      # Test data factories
└── setup.ts                          # Global test setup (DB connection)
```

---

### 13. Performance

#### 13.1 Pagination
- **Offset pagination** (`skip` + `take` in Prisma): used initially. Simple, sufficient for the expected data volumes (thousands of records, not millions).
- **Cursor pagination**: documented as a scalability improvement for when any table exceeds ~100K rows. Cursor pagination avoids the `OFFSET` performance penalty on large datasets.
- **Page size**: capped at 100 (enforced in Zod query schema). Default 20.

#### 13.2 Lazy loading
- **Route-level code splitting**: Next.js App Router automatically code-splits by route. Each page only loads its own JavaScript.
- **Component-level lazy loading**: `next/dynamic` for heavy components (e.g., chart components on the dashboard) with `ssr: false` if needed.
- **Below-the-fold content**: deferred loading for non-critical UI (e.g., activity feed loads after KPI cards).

#### 13.3 Database indexes
- Every foreign key column has an `@@index` (Prisma does not auto-index FKs for MySQL/MariaDB).
- Every `deletedAt` column has an `@@index` (soft-delete filter on every query).
- Every `status` column has an `@@index` (filter by pipeline stage).
- Every `createdAt` column has an `@@index` (sorting, time-range queries).
- Composite indexes where queries combine fields (e.g., `[entityType, entityId]` on AuditLog).

#### 13.4 Memoization
- **React.memo**: for pure presentational components that re-render often (e.g., table cells, status badges).
- **useMemo / useCallback**: for expensive computations in Client Components (e.g., derived table data, filter functions).
- **Not overused**: only where profiling shows a benefit. Premature memoization adds complexity without value.

#### 13.5 Server rendering
- Server Components for all list pages, detail pages, dashboard. Data fetched server-side, HTML streamed to client.
- Reduces client JavaScript, improves first contentful paint, enables streaming (partial HTML sent before all data is ready).

#### 13.6 Query optimization
- **Prisma `select`**: explicitly select only needed fields (avoid `SELECT *` equivalent). Especially important for list queries (don't fetch `notes` text field for table display).
- **Prisma `include` vs `select`**: use `include` for related data, but be mindful of N+1 queries. The repository layer should use `include` to eager-load relations in a single query.
- **Count queries**: use Prisma's `_count` for aggregation instead of fetching all records and counting in JS.
- **Transactional writes**: use `prisma.$transaction()` for multi-table writes (e.g., creating a DeliveryNote + updating SalesOrderItem delivered qty).

#### 13.7 Image optimization
- `next/image` for any images (avatars, logos). Automatic format conversion (WebP), lazy loading, responsive sizes.
- No user-uploaded images in the initial build (text-only CRM). Documented as future enhancement.

---

### 14. Security

#### 14.1 Authentication
- Auth.js v5 with JWT strategy. JWT stored in httpOnly, Secure, SameSite=Lax cookie.
- Password hashing: bcrypt, 12 rounds.
- Session expires in 24h (sliding expiration).
- No plaintext passwords stored or logged.

#### 14.2 Authorization
- **Three layers**: middleware (coarse, route-prefix), Server Action (fine, per-action), UI (cosmetic).
- **Defense-in-depth**: even if middleware is bypassed, Server Actions re-check permissions. Even if UI shows a button, the Server Action blocks unauthorized execution.
- **Principle of least privilege**: roles are seeded with minimum required permissions. Admin is the only role with wildcard.

#### 14.3 SQL injection
- **Prisma parameterized queries**: all database access goes through Prisma, which uses parameterized queries. No raw SQL in the initial build.
- **If raw SQL is needed later**: use `prisma.$queryRaw` with tagged template literals (parameterized), never string concatenation.

#### 14.4 XSS (Cross-Site Scripting)
- **React auto-escaping**: React escapes all content rendered in JSX. No `dangerouslySetInnerHTML` in the initial build.
- **User input**: stored as-is in the database (Prisma parameterized), rendered safely by React. No HTML interpretation of user input.
- **CSP**: Content-Security-Policy header configured in `next.config.ts` (restrict scripts to same-origin, no inline scripts except Next.js nonce).

#### 14.5 CSRF (Cross-Site Request Forgery)
- **Auth.js built-in CSRF protection**: Auth.js v5 includes CSRF tokens for authentication routes.
- **Server Actions**: Next.js Server Actions have built-in CSRF protection (action IDs are verified server-side).
- **Route Handlers**: for POST/PUT/DELETE, check the `Origin` header matches the expected origin. Documented as an explicit check in the Route Handler pattern.

#### 14.6 Rate limiting
- **Deferred to future enhancement**: Redis-based rate limiting is documented as a future improvement.
- **Initial approach**: no rate limiting. Acceptable for an internal CRM tool with authenticated users. If exposed to the internet without a reverse proxy, add Nginx-level rate limiting.
- **Login endpoint**: vulnerable to brute force. Initial mitigation: bcrypt is slow (12 rounds), making brute force expensive. Future: add rate limiting and account lockout after N failed attempts.

#### 14.7 Input validation
- **Zod on every input**: Server Actions, Route Handlers, and form submissions all validate with Zod.
- **Whitelist validation**: Zod schemas use strict shapes (no `z.any()`, no `z.unknown()`). Unknown fields are rejected.
- **Type coercion**: query params coerced explicitly (`z.coerce.number()`, `z.coerce.date()`).

#### 14.8 Environment variables and secrets
- **`.env` file**: never committed to git (`.gitignore`). `.env.example` committed as a template.
- **Validation**: `src/config/env.ts` validates environment variables with Zod on startup. Missing required variables → app fails to start with a clear error.
- **Secrets**: `DATABASE_URL`, `AUTH_SECRET` (JWT signing key), `NEXTAUTH_URL` are required. No hardcoded secrets in code.
- **Production**: secrets injected via Docker environment variables or Docker secrets.

#### 14.9 Audit logging
- Every state-changing operation (create, update, delete, transition, convert) is logged to AuditLog.
- AuditLog is append-only (no update, no delete). Indexed for querying by entity and by user.
- Enables forensics: "who changed this lead's status and when?"

---

### 15. Scalability

This section documents how the architecture supports future ERP modules and scale. All items are future enhancements — NOT part of the initial build.

#### 15.1 Inventory
- **Migration path**: add `Product` and `InventoryItem` models. SalesOrderItem gains `productId` FK. DeliveryNoteItem updates inventory (stock reduction). New `StockMovement` model for audit trail.
- **Impact**: new feature module `src/features/inventory/`. SalesOrder and DeliveryNote services gain inventory check calls. No changes to existing schema structure — just new FKs.

#### 15.2 Purchase Orders
- **Migration path**: add `PurchaseOrder`, `PurchaseOrderItem`, `Supplier` models. Mirrors SalesOrder structure (supplier-side). `GoodsReceipt` model for receiving goods (mirrors DeliveryNote).
- **Impact**: new feature module. No changes to existing CRM/Sales models.

#### 15.3 Suppliers
- **Migration path**: add `Supplier` model (similar to Customer). Linked to PurchaseOrder. Can share the `CustomerAddress` pattern (SupplierAddress, SupplierContact).
- **Impact**: new feature module. No changes to existing models.

#### 15.4 Accounting
- **Migration path**: add `JournalEntry`, `JournalLine`, `ChartOfAccount` models. SalesInvoice payment triggers a journal entry. `FiscalPeriod` model for period closing.
- **Impact**: Payment service gains a hook to create journal entries. New feature module. No changes to existing invoice/payment models — accounting reads them as source documents.

#### 15.5 Warehouses
- **Migration path**: add `Warehouse` model. `InventoryItem` gains `warehouseId`. DeliveryNote gains `warehouseId` (source warehouse). `StockTransfer` model for inter-warehouse transfers.
- **Impact**: new feature module. DeliveryNote gains optional FK. Minimal change to existing schema.

#### 15.6 Multiple Companies
- **Migration path**: add `Company` model. All domain models gain `companyId` FK. Layout and navigation become company-aware (company selector in topbar). Auth session embeds `companyId`.
- **Impact**: significant — every model gains a new FK, every query filters by company. But the feature-based architecture means each service/repository adds the filter independently. No cross-cutting schema change.

#### 15.7 Multi-tenancy
- **Migration path**: add `Tenant` model. All domain models gain `tenantId` FK. Middleware enforces tenant isolation (every query scoped to tenant). Auth session embeds `tenantId`. Row-level security or application-level filtering.
- **Impact**: very significant — every model, every query, every middleware. This is why it's deferred. The architecture is designed to accommodate it (feature-based modules mean each repository adds tenant filtering independently), but the initial build does NOT include `tenantId` fields (per user decision).
- **Why deferred**: multi-tenancy adds complexity to every query, every test, and every migration. It's easier to add it once (in a dedicated migration) than to carry the overhead from day one for a single-tenant deployment.

#### 15.8 REST API (public)
- **Migration path**: add API key authentication (`ApiKey` model). Rate limiting (Redis). Versioning (`/api/v1/...`). OpenAPI/Swagger documentation.
- **Impact**: Route Handlers already exist. Add an auth middleware for API keys. Rate limiting is the main new infrastructure.

#### 15.9 Mobile App
- **Migration path**: the REST API (above) serves a mobile app. React Native or Flutter consumes the API. Auth via JWT (Auth.js can issue tokens for mobile).
- **Impact**: no changes to existing architecture. The API layer is the integration point.

#### 15.10 Microservices
- **Migration path**: extract feature modules into independent services. Each service owns its database (or schema). Inter-service communication via REST or event bus (e.g., RabbitMQ, Kafka).
- **Impact**: the feature-based architecture makes this natural — each `src/features/<domain>/` becomes a microservice. The service layer boundary is already clean. The main work is extracting the Prisma schema per service and setting up inter-service auth.
- **Why the architecture supports this**: the service layer never touches Prisma directly (repository layer does), and Server Actions / Route Handlers are thin entry points. Extracting a service means moving the feature module + its Prisma models into a new repo.

---

### 16. AI Development Plan

This section defines the execution strategy for AI coding agents (Builder Agents) to implement the plan with minimal mistakes.

#### 16.1 Task independence principle
- Each todo is completable in isolation. A Builder Agent receives one todo with all context (references, acceptance criteria, QA scenarios) and does not need to read other todos.
- Todos within a phase may be sequential (e.g., model → service → UI), but the dependency is explicit in the `Blocked by` field.
- Todos across phases are NEVER parallelizable (CRM must complete before Sales).

#### 16.2 Task structure (every todo specifies)
- **Goal**: one sentence describing what to build.
- **Inputs**: Prisma models, Zod schemas, types, and patterns from previous todos (with file paths).
- **Outputs**: exact files to create or modify (with paths).
- **Affected files**: explicit list.
- **Dependencies**: which todos must be complete first.
- **Acceptance criteria**: agent-executable commands or assertions.
- **QA scenarios**: happy path + failure path, with exact tool and invocation.

#### 16.3 Pattern establishment
- **Phase 4 (Lead) establishes the pattern**: the first full-stack domain (model → schema → service → repository → API → UI). Builder Agents reference the Lead implementation as the template for all subsequent domains.
- **Copy-and-adapt**: Opportunity, Quotation, Customer, SalesOrder, etc. follow the Lead pattern with domain-specific variations (state machines, line items, conversions).
- **The plan explicitly references the pattern**: every domain todo says "follow the pattern established in T13-T16 (Lead), adapted for [domain-specific differences]."

#### 16.4 Anti-mistake measures
1. **Explicit file paths**: every todo names exact file paths. No "create a service file somewhere in the features directory."
2. **Explicit patterns**: every todo references the pattern to follow (e.g., "same structure as `lead.service.ts`").
3. **State machine tables**: every domain todo includes the transition table (from Section 2) so the Builder Agent doesn't guess transitions.
4. **Zod schema shapes**: every todo references the Prisma model fields (from Section 3) so the Builder Agent knows exactly what fields to validate.
5. **Acceptance criteria are executable**: "run `pnpm test src/features/lead/services/lead.service.test.ts` and assert all tests pass" — not "the service should work."
6. **Must NOT do**: every todo includes explicit prohibitions (e.g., "do NOT add tenantId", "do NOT use Prisma query extensions for soft delete").

#### 16.5 Builder Agent workflow
1. Read the todo.
2. Read referenced files (previous todos' outputs, architecture sections).
3. Implement the files listed in "Outputs."
4. Run acceptance criteria commands.
5. Run QA scenarios (happy + failure).
6. Write evidence to `.omo/evidence/task-<N>-crm-sales-architecture.<ext>`.
7. Commit with the specified commit message.
8. Move to the next todo (respecting dependencies).

#### 16.6 Parallelization
- Within a phase, after the model + schema are done, the service, repository, API, and UI can be built in sequence (they depend on each other) but the UI and API can sometimes overlap.
- Across phases: no parallelization (strict CRM → Sales order).
- The dependency matrix in the Execution Strategy section defines exact ordering.

---

### 17. Coding Standards

#### 17.1 Naming conventions
- **Files**: kebab-case (`lead.service.ts`, `lead-create.ts`, `lead-form.tsx`).
- **Components**: PascalCase (`LeadForm`, `DataTable`, `StatusBadge`).
- **Functions/variables**: camelCase (`createLead`, `leadService`).
- **Constants**: UPPER_SNAKE_CASE (`LEAD_TRANSITIONS`, `LEAD_STATUSES`).
- **Types/Interfaces**: PascalCase (`Lead`, `LeadCreateInput`, `LeadQueryParams`).
- **Zod schemas**: camelCase with "Schema" suffix (`leadCreateSchema`).
- **Enums (as const objects)**: PascalCase object, UPPER_SNAKE values (`LeadStatus.NEW`, `LeadStatus.CONTACTED`).

#### 17.2 Folder conventions
- Feature modules: `src/features/<domain>/` with `schemas/`, `services/`, `repositories/`, `types.ts`, `constants.ts`.
- Shared components: `src/components/` (flat or shallow nested: `ui/`, `layout/`, `data-table/`, `forms/`).
- Lib: `src/lib/` for cross-cutting infrastructure (`auth/`, `prisma.ts`, `errors/`, `utils.ts`).
- App router: `src/app/` mirrors the URL structure.

#### 17.3 Component conventions
- **Server Components**: default, no directive. Fetch data, render UI.
- **Client Components**: `"use client"` at top. Only for interactivity. Props are serializable.
- **Component file = component name**: `LeadForm` is in `lead-form.tsx`.
- **One default export per page file**: Next.js convention. Named exports for reusable components.
- **Props interface above component**: `interface LeadFormProps { ... }` then `export function LeadForm({ ... }: LeadFormProps) { ... }`.

#### 17.4 Prisma conventions
- Models: PascalCase (`Lead`, `SalesOrder`).
- Table names: snake_case via `@@map("leads")`, `@@map("sales_orders")`.
- Fields: camelCase in Prisma, snake_case via `@map("created_by_id")`.
- Enums: stored as String (not Prisma enum type) for migration flexibility — allows adding new statuses without migration.
- Relations: explicit `@relation` with named fields.

#### 17.5 API conventions
- Route Handlers: `export async function GET(...)`, `export async function POST(...)` in `route.ts`.
- Server Actions: `export async function createLeadAction(...)` — named with "Action" suffix.
- Response shape: consistent envelope (Section 6.1).
- Error handling: try/catch in every handler, typed errors from service layer.

#### 17.6 Error conventions
- Throw typed errors (`NotFoundError`, `ConflictError`) — never throw strings or generic `Error`.
- Error messages: user-friendly, actionable ("Lead not found" not "Entity with id xyz not found in table leads").
- Error codes: UPPER_SNAKE_CASE (`VALIDATION_ERROR`, `NOT_FOUND`).

#### 17.7 Git commit conventions
- **Conventional Commits**: `type(scope): description`
  - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `style`.
  - Scope: domain name (`feat(leads): add lead creation form`).
  - Description: imperative, lowercase, no period.
- **Breaking changes**: `feat(auth)!: change session strategy` with `BREAKING CHANGE:` footer.
- **Commit per todo**: each todo results in one commit (or a small set if the todo spans multiple logical changes).

#### 17.8 Branch strategy
- **Branch naming**: `feat/<domain>-<description>` (e.g., `feat/leads-creation`), `fix/<description>`, `chore/<description>`.
- **PR-based**: every feature branch → PR → review → merge to `main`.
- **No direct commits to `main`** (enforced by branch protection rules, if using GitHub).
- **One branch per phase or sub-phase**: e.g., `feat/phase-4-leads`, `feat/phase-5-opportunities`.

---

### 18. Risks

#### 18.1 Technical risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Prisma + MariaDB compatibility issues (MariaDB vs MySQL dialect) | Medium | Medium | Prisma uses MySQL provider for MariaDB. Test connection early in Phase 1. If issues arise, fallback to MySQL. |
| Auth.js v5 configuration complexity (App Router changes) | Medium | High | Phase 2 is dedicated to auth. Reference official Auth.js v5 docs. Test thoroughly before proceeding. |
| Decimal precision issues in money calculations | Low | High | Use Prisma `Decimal` type throughout. Never use JS `number` for money. Convert to string for display. |
| Transaction failures in multi-table writes (e.g., DeliveryNote + SalesOrderItem) | Medium | High | Use `prisma.$transaction()` for all multi-table writes. Test failure scenarios. |

#### 18.2 Architectural risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Feature-based architecture becomes inconsistent across domains | Medium | Medium | Phase 4 (Lead) establishes the pattern. Every subsequent domain references it. Linter rules can enforce structure. |
| Service layer accumulates too much logic (becomes god classes) | Medium | Medium | Keep services focused on one domain. Cross-domain logic goes in a dedicated orchestration service (e.g., `conversion.service.ts`). |
| Repository layer becomes leaky (service touches Prisma directly) | Low | Medium | Code review. The pattern is established in Phase 4. No Prisma imports in service files. |

#### 18.3 Database risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Document number race conditions (two concurrent creates get the same number) | Medium | High | Use `Counter` table with atomic `update` + `increment`. Transactional. Test concurrency. |
| Soft-delete queries miss the `deletedAt IS NULL` filter | Medium | Medium | Manual filtering is intentional (user decision). Repository layer is the single place that adds this filter. Code review. |
| Schema migration conflicts (multiple agents modifying schema.prisma) | Medium | Medium | One agent at a time modifies schema.prisma. Phase ordering ensures no concurrent schema edits. |
| Index performance on large datasets (offset pagination degrades) | Low | Low | Documented as future improvement (cursor pagination). Acceptable for initial data volumes. |

#### 18.4 Performance risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Dashboard aggregation queries slow with large datasets | Medium | Medium | Index on `status`, `createdAt`. Use `_count` for aggregations. Cache dashboard data (revalidate every 60s). |
| N+1 queries in list pages (loading relations per row) | Medium | Medium | Use Prisma `include` for eager loading. Test with `EXPLAIN` on slow queries. |
| Large bundle size from shadcn/ui + TanStack Table | Low | Low | Tree-shaking (shadcn/ui is copy-in, not imported). Dynamic imports for heavy components. |

#### 18.5 Security risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Brute force login attacks (no rate limiting) | Medium | High | bcrypt (12 rounds) slows attacks. Documented: add rate limiting + account lockout as near-term future enhancement. Deploy behind reverse proxy (Nginx) with rate limiting. |
| CSRF on Route Handlers | Low | Medium | Check `Origin` header on POST/PUT/DELETE. Server Actions have built-in CSRF protection. |
| Sensitive data in audit logs (PII in metadata) | Low | Medium | Audit log stores state changes, not full entity data. Review what goes into `metadata` JSON field. |

#### 18.6 AI-agent risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Builder Agent deviates from the established pattern | High | Medium | Every todo explicitly references the pattern. Acceptance criteria include structural checks (file exists at path, exports match expected names). |
| Builder Agent invents fields not in the Prisma model | Medium | Medium | Every todo references the exact model fields from Section 3. Zod schema must match model fields. |
| Builder Agent adds tenantId or other excluded features | Low | Low | Every todo includes "Must NOT do" with explicit prohibitions. Code review. |
| Builder Agent writes tests that pass but don't test the right thing | Medium | High | QA scenarios specify exact assertions, not just "tests pass." Failure-path tests required (e.g., "assert that transitioning from DISQUALIFIED to QUALIFIED throws ConflictError"). |
| Builder Agent modifies files outside its todo scope | Medium | Medium | Every todo lists "Affected files." Reviewer checks diff against this list. |
| Inconsistent error handling (some services throw, some return errors) | Medium | Medium | Convention is established in Phase 3/4: services throw, callers catch. Linter or code review enforces. |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

#### Technology notes (verified 2025)
- **Prisma v7**: uses driver adapters by default. For MariaDB, install `@prisma/adapter-mariadb` and configure the Prisma client with it. The `mysql` provider is still used in `schema.prisma`.
- **shadcn/ui**: new projects start on **Tailwind v4 + React 19**. Use `pnpm dlx shadcn@latest init` for setup.
- **Auth.js v5**: the old `withAuth` middleware helper is deprecated. Use `auth()` in Server Components/Actions and export `auth` as Next.js middleware for route protection.

---

#### Phase 1: Project Setup (Wave 1)

- [ ] 1. Scaffold Next.js 15 project with TypeScript and Tailwind CSS v4
  What: initialize the Next.js 15 App Router project with TypeScript strict mode, Tailwind CSS v4, and the `src/` directory structure. Install pnpm as the package manager. Create the base `src/app/layout.tsx` (root layout with html/body), `src/app/page.tsx` (placeholder home page that redirects to `/dashboard`), `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`. Set up `src/config/env.ts` with Zod-validated environment variables (DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL).
  Must NOT do: do NOT install Prisma, shadcn/ui, or auth libraries yet. Do NOT create feature folders yet. Do NOT use Tailwind v3.
  Wave: 1 | Blocked by: — | Blocks: T2, T3, T4
  References: Architecture Section 1.2 (folder structure tree), Section 1.1 (overall architecture). Create files: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/config/env.ts`, `.env.example`, `.gitignore`.
  Acceptance: `pnpm dev` starts without errors on port 3000; `pnpm build` exits 0; `pnpm lint` exits 0 with zero errors; `src/config/env.ts` validates `DATABASE_URL` and `AUTH_SECRET` — app crashes with clear message if missing.
  QA happy: run `pnpm dev`, `curl -s http://localhost:3000 | grep -q "<html"` — assert HTML response. Evidence: `.omo/evidence/task-1-crm-sales-architecture.txt`
  QA failure: remove `DATABASE_URL` from `.env`, run `pnpm dev` — assert startup fails with "DATABASE_URL is required". Evidence: `.omo/evidence/task-1-fail-crm-sales-architecture.txt`
  Commit: Y | chore(setup): scaffold next.js 15 with typescript and tailwind v4

- [ ] 2. Configure Prisma ORM with MariaDB using driver adapter
  What: install `prisma`, `@prisma/client`, and `@prisma/adapter-mariadb`. Create `prisma/schema.prisma` with `provider = "mysql"`, datasource from `DATABASE_URL`. Create `src/lib/prisma.ts` as a Prisma client singleton using the MariaDB driver adapter. Create a basic `User` model (just `id`, `email`, `name`, `createdAt`, `updatedAt`) to verify the connection. Run `prisma db push` to create the table. Create `prisma/seed.ts` placeholder.
  Must NOT do: do NOT define all domain models yet (only a minimal User to verify connection). Do NOT use Prisma v6 or the legacy mysql driver. Do NOT use `prisma generate` without the adapter configured.
  Wave: 1 | Blocked by: T1 | Blocks: T5, T9, T13 | Can parallelize with: T3, T4
  References: Architecture Section 1.9 (database layer), Section 3.1 (conventions), Technology notes (Prisma v7 driver adapter). Create files: `prisma/schema.prisma`, `src/lib/prisma.ts`, `prisma/seed.ts`. Modify: `package.json` (add prisma scripts).
  Acceptance: `pnpm prisma db push` succeeds and creates the `users` table in MariaDB; `pnpm prisma generate` succeeds; a test script that queries `prisma.user.findFirst()` runs without error.
  QA happy: run `pnpm prisma db push`, then run a script that inserts and reads a User row — assert the row is returned. Evidence: `.omo/evidence/task-2-crm-sales-architecture.txt`
  QA failure: use an invalid `DATABASE_URL` (wrong password), run `pnpm prisma db push` — assert connection error with clear message. Evidence: `.omo/evidence/task-2-fail-crm-sales-architecture.txt`
  Commit: Y | chore(prisma): configure prisma with mariadb driver adapter

- [ ] 3. Install and configure shadcn/ui + Lucide icons
  What: run `pnpm dlx shadcn@latest init` to set up shadcn/ui with Tailwind v4. Install `lucide-react`. Add the following shadcn/ui components: `button`, `input`, `label`, `card`, `dialog`, `dropdown-menu`, `table`, `badge`, `select`, `textarea`, `toast` (sonner), `skeleton`, `separator`, `tabs`, `checkbox`, `form` (React Hook Form integration). Create `src/components/ui/` directory (shadcn/ui places components here). Create `src/lib/utils.ts` with `cn()` helper.
  Must NOT do: do NOT create domain-specific components yet. Do NOT install Tailwind v3 compatibility packages.
  Wave: 1 | Blocked by: T1 | Blocks: T7, T8, T12, T13 | Can parallelize with: T2, T4
  References: Architecture Section 7 (UI Architecture), Section 1.2 (folder structure — `src/components/ui/`). Technology notes (shadcn/ui Tailwind v4). Create files: `src/components/ui/*.tsx`, `src/lib/utils.ts`. Modify: `tailwind.config.ts`, `src/app/globals.css`.
  Acceptance: `pnpm build` succeeds; a test page that renders `<Button>Test</Button>` displays correctly; `lucide-react` icons render; `cn()` utility merges classes correctly.
  QA happy: create a temporary page rendering `Button` + `Input` + `Badge` + `User` icon, run `pnpm dev`, `curl` the page — assert all components present in HTML. Evidence: `.omo/evidence/task-3-crm-sales-architecture.txt`
  QA failure: remove `cn()` import from a component, run `pnpm build` — assert build fails with clear error. Evidence: `.omo/evidence/task-3-fail-crm-sales-architecture.txt`
  Commit: Y | chore(ui): install shadcn/ui and lucide icons

- [ ] 4. Configure ESLint, Prettier, Vitest, and project structure skeleton
  What: configure ESLint with Next.js + TypeScript rules. Add Prettier with consistent formatting (single quotes, 2 spaces, 80 char width). Configure Vitest with `vitest.config.ts` (environment: node for services, jsdom for components). Create a sample unit test (`src/lib/utils.test.ts` testing `cn()`). Create the empty feature folder skeleton: `src/features/`, `src/components/layout/`, `src/components/data-table/`, `src/components/forms/`, `src/hooks/`, `src/types/`. Create `src/lib/errors/` with `AppError` base class and subclasses (`NotFoundError`, `ValidationError`, `ForbiddenError`, `UnauthorizedError`, `ConflictError`).
  Must NOT do: do NOT create domain-specific test files yet. Do NOT configure Playwright yet (deferred to when E2E tests are needed in Phase 4).
  Wave: 1 | Blocked by: T1 | Blocks: all test-dependent todos | Can parallelize with: T2, T3
  References: Architecture Section 11.1 (error class hierarchy), Section 12 (testing strategy), Section 17 (coding standards). Create files: `.eslintrc.json`, `.prettierrc`, `vitest.config.ts`, `src/lib/utils.test.ts`, `src/lib/errors/app-error.ts`, `src/lib/errors/not-found-error.ts`, `src/lib/errors/validation-error.ts`, `src/lib/errors/forbidden-error.ts`, `src/lib/errors/unauthorized-error.ts`, `src/lib/errors/conflict-error.ts`, `src/lib/errors/index.ts`, empty folder placeholders.
  Acceptance: `pnpm lint` exits 0; `pnpm test` runs and passes the `cn()` test; `pnpm format` (prettier check) exits 0; all error classes are importable from `src/lib/errors/`.
  QA happy: run `pnpm test` — assert 1 test passes. Run `pnpm lint` — assert 0 errors. Evidence: `.omo/evidence/task-4-crm-sales-architecture.txt`
  QA failure: add a deliberate lint error (unused variable), run `pnpm lint` — assert it reports the error. Evidence: `.omo/evidence/task-4-fail-crm-sales-architecture.txt`
  Commit: Y | chore(config): configure eslint prettier vitest and error classes

#### Phase 2: Authentication (Wave 2)

- [ ] 5. Define Prisma models for Auth.js v5 and System module
  What: add ALL system-domain Prisma models to `schema.prisma`: `User` (extend with `passwordHash`, `roleRoleId`, `status`, `lastLoginAt`, `deletedAt` — note: User uses deactivate instead of soft-delete, but keep `status` field), `Role`, `Permission`, `RolePermission` (M2M join), `AuditLog`, `Notification`, `Setting`, `Counter`. Also add Auth.js adapter models: `Account`, `Session`, `VerificationToken`. Follow the exact field definitions from Architecture Section 3.3. Use `@@map` for snake_case table names, `@map` for snake_case columns. Add all indexes as specified. Run `prisma db push` to create tables. Create `prisma/seed.ts` to seed: 4 Roles (Admin, Sales Manager, Sales Rep, Accountant), all Permissions (from the permissions const), Admin user (email: admin@crm.local, password: hashed "admin123"), default Settings, Counter records for all prefixes.
  Must NOT do: do NOT add tenantId to any model. Do NOT use Prisma enum types (use String for status fields). Do NOT add `createdById` to system models (User, Role, Permission, etc.) — only AuditLog has its own `userId`. Do NOT use automatic Prisma query extensions.
  Wave: 2 | Blocked by: T2 | Blocks: T6, T7, T8, T9 | Can parallelize with: —
  References: Architecture Section 3.3 (all model definitions), Section 3.1 (conventions), Section 9.6 (seeded roles and permissions), Section 3.3 Counter model. Modify: `prisma/schema.prisma`, `prisma/seed.ts`. Create: `src/lib/auth/permissions.ts` (const array of permission codes + route-to-permission mapping).
  Acceptance: `pnpm prisma db push` creates all tables; `pnpm prisma db seed` inserts 4 roles, all permissions, admin user, settings, counters; querying `prisma.role.findMany()` returns 4 roles; `permissions.ts` exports a `PERMISSIONS` array with all `resource:action` codes and a `ROUTE_PERMISSIONS` map.
  QA happy: run `pnpm prisma db seed`, then query roles/permissions/users — assert 4 roles, correct permission count, 1 admin user. Evidence: `.omo/evidence/task-5-crm-sales-architecture.txt`
  QA failure: run seed twice — assert no duplicate roles (unique constraint on `name`), no duplicate role-permissions (composite unique). Evidence: `.omo/evidence/task-5-fail-crm-sales-architecture.txt`
  Commit: Y | feat(auth): define prisma models for auth and system module

- [ ] 6. Configure Auth.js v5 with credentials provider and JWT strategy
  What: install `next-auth@5` and `@auth/prisma-adapter`. Create `src/lib/auth/auth.config.ts` with: credentials provider (email + password, bcrypt verification), JWT session strategy, pages (`/login`), callbacks (`jwt` callback embeds `userId`, `roleId`, `permissions` array from the DB; `session` callback exposes them on `session.user`). Create `src/lib/auth/auth.ts` exporting `handlers` (GET/POST for `/api/auth/[...nextauth]`), `auth` (for Server Components/Actions), `signIn`, `signOut`. Create `src/app/api/auth/[...nextauth]/route.ts` that exports the handlers. Create `src/features/user/repositories/user.repository.ts` with `findByEmail()` and `create()` methods. Create `src/features/user/services/auth.service.ts` with `register()` (hash password, create user with default role) and `verifyCredentials()` (find by email, bcrypt compare).
  Must NOT do: do NOT use database session strategy (use JWT). Do NOT store plaintext passwords. Do NOT expose `passwordHash` in the session object. Do NOT skip bcrypt (12 rounds).
  Wave: 2 | Blocked by: T5 | Blocks: T7, T8 | Can parallelize with: —
  References: Architecture Section 9.1 (Auth.js config), Section 9.5 (session management), Section 6.3 (Server Action contract), Technology notes (Auth.js v5 `auth()` preferred). Create files: `src/lib/auth/auth.config.ts`, `src/lib/auth/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/features/user/repositories/user.repository.ts`, `src/features/user/services/auth.service.ts`, `src/features/user/schemas/register-schema.ts`, `src/features/user/schemas/login-schema.ts`.
  Acceptance: `POST /api/auth/[...nextauth]` with valid credentials returns a session cookie; `auth()` in a Server Component returns the session with `user.userId`, `user.roleId`, `user.permissions`; invalid credentials return an error; `pnpm build` succeeds.
  QA happy: seed admin user, call `signIn("credentials", { email: "admin@crm.local", password: "admin123" })` — assert session cookie set and `auth()` returns user with permissions. Evidence: `.omo/evidence/task-6-crm-sales-architecture.txt`
  QA failure: call `signIn("credentials", { email: "admin@crm.local", password: "wrong" })` — assert no session cookie, error returned. Evidence: `.omo/evidence/task-6-fail-crm-sales-architecture.txt`
  Commit: Y | feat(auth): configure auth.js v5 with credentials and jwt

- [ ] 7. Implement RBAC: permission checker and Next.js middleware
  What: create `src/lib/auth/permissions.ts` (if not created in T5, create now) with `hasPermission(user: { permissions: string[] }, permission: string): boolean` — checks if `user.permissions` includes the given permission OR if user has wildcard `"*"`. Create `src/middleware.ts` that: (1) skips public routes (`/login`, `/register`, `/api/auth/*`), (2) checks `auth()` session — redirects to `/login` if none, (3) checks route-prefix permission via `ROUTE_PERMISSIONS` map — redirects to `/dashboard` if denied, (4) allows request. Export `auth` from Auth.js as the middleware wrapper. Create `src/lib/auth/require-permission.ts` — a helper for Server Actions: `requirePermission(session, "leads:create")` that throws `ForbiddenError` if denied.
  Must NOT do: do NOT rely on middleware as the only auth check (Server Actions must re-check). Do NOT check permissions in the browser (UI hiding is cosmetic only).
  Wave: 2 | Blocked by: T6 | Blocks: T9, T13, T17 | Can parallelize with: T8
  References: Architecture Section 9.2 (RBAC), Section 9.4 (middleware), Section 14.2 (authorization — three layers). Create files: `src/middleware.ts`, `src/lib/auth/permissions.ts` (extend if exists), `src/lib/auth/require-permission.ts`.
  Acceptance: unauthenticated request to `/dashboard` redirects to `/login`; authenticated user without `users:read` permission requesting `/users` redirects to `/dashboard`; `hasPermission({ permissions: ["leads:read"] }, "leads:read")` returns `true`; `hasPermission({ permissions: ["leads:read"] }, "leads:create")` returns `false`; `hasPermission({ permissions: ["*"] }, "anything")` returns `true`.
  QA happy: log in as admin, navigate to `/dashboard` — assert 200 response (not redirect). Evidence: `.omo/evidence/task-7-crm-sales-architecture.txt`
  QA failure: log in as Sales Rep, navigate to `/users` — assert redirect to `/dashboard`. Evidence: `.omo/evidence/task-7-fail-crm-sales-architecture.txt`
  Commit: Y | feat(auth): implement rbac permission checker and middleware

- [ ] 8. Build login and register pages with Server Actions
  What: create `src/app/(auth)/login/page.tsx` (Server Component rendering the login form), `src/app/(auth)/register/page.tsx`, `src/app/(auth)/layout.tsx` (centered card layout). Create `src/components/auth/login-form.tsx` (Client Component with React Hook Form + Zod), `src/components/auth/register-form.tsx`. Create Server Actions: `loginAction` (calls `signIn("credentials", ...)`), `registerAction` (calls `authService.register()`, then auto-login), `logoutAction` (calls `signOut()`). On success: redirect to `/dashboard`. On error: return `{ success: false, error }` and display as toast + inline form error.
  Must NOT do: do NOT use client-side `fetch()` for auth — use Server Actions. Do NOT store password in client state beyond the form input.
  Wave: 2 | Blocked by: T6, T3 | Blocks: T9 | Can parallelize with: T7
  References: Architecture Section 7.4 (forms pattern), Section 6.3 (Server Action contract), Section 11.5 (toast notifications). Create files: `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/components/auth/login-form.tsx`, `src/components/auth/register-form.tsx`, `src/features/user/actions/auth-actions.ts`.
  Acceptance: login page renders form with email + password fields; valid credentials redirect to `/dashboard`; invalid credentials show error toast + inline error; register page creates a new user and redirects to `/dashboard`; logout clears session and redirects to `/login`.
  QA happy: navigate to `/login`, fill admin@crm.local / admin123, submit — assert redirect to `/dashboard`. Evidence: `.omo/evidence/task-8-crm-sales-architecture.txt`
  QA failure: fill wrong password, submit — assert error toast "Invalid credentials" and no redirect. Evidence: `.omo/evidence/task-8-fail-crm-sales-architecture.txt`
  Commit: Y | feat(auth): build login and register pages with server actions

#### Phase 3: System Module (Wave 3)

- [ ] 9. Implement Users CRUD (service, repository, API, UI)
  What: create `src/features/user/schemas/user-create.ts`, `user-update.ts`, `user-query.ts` (Zod schemas matching User model fields). Create `src/features/user/repositories/user.repository.ts` (extend with `findMany`, `findById`, `create`, `update`, `softDelete` — all with manual `deletedAt: null` filter on reads). Create `src/features/user/services/user.service.ts` (CRUD methods, throws `NotFoundError`/`ValidationError`/`ConflictError`, calls `audit.log()` on changes, checks permissions via `requirePermission`). Create Route Handlers: `src/app/api/users/route.ts` (GET list, POST create), `src/app/api/users/[id]/route.ts` (GET, PUT, DELETE). Create Server Actions: `createUserAction`, `updateUserAction`, `deleteUserAction`. Create pages: `src/app/(dashboard)/users/page.tsx` (list), `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`. Create components: `UserTable`, `UserForm`.
  Must NOT do: do NOT hard-delete users (use `status: INACTIVE` or `deletedAt`). Do NOT allow editing `passwordHash` directly (separate password change flow, future enhancement).
  Wave: 3 | Blocked by: T7, T8, T5 | Blocks: T13, T17 | Can parallelize with: T10, T11, T12
  References: Architecture Section 3.3 (User model), Section 6.2 (endpoint catalog), Section 6.3 (Server Action contract), Section 7 (UI patterns), Section 2.3.1 (User domain). Follow the exact Zod schema pattern from Section 10.1. Follow the error handling pattern from Section 11.2.
  Acceptance: `GET /api/users` returns paginated user list; `POST /api/users` creates a user; `PUT /api/users/[id]` updates; `DELETE /api/users/[id]` soft-deletes (sets `deletedAt`); Users list page renders with table, pagination, search, sort; User form validates with Zod; permissions enforced (`users:create` required to create).
  QA happy: log in as admin, create a user via the form, assert user appears in the list. Evidence: `.omo/evidence/task-9-crm-sales-architecture.txt`
  QA failure: log in as Sales Rep, try to access `/users` — assert redirect to `/dashboard` (middleware blocks). Try `POST /api/users` without `users:create` — assert 403. Evidence: `.omo/evidence/task-9-fail-crm-sales-architecture.txt`
  Commit: Y | feat(users): implement users crud with service repository and ui

- [ ] 10. Implement Roles and Permissions management
  What: create `src/features/role/` module (schemas, repositories, services). Role CRUD: list, create, edit, delete. Permission assignment: add/remove permissions from a role (manage RolePermission M2M). Create pages: `src/app/(dashboard)/roles/page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`. The role edit page has a permission checklist (grouped by resource: leads, opportunities, etc.). Create Route Handlers and Server Actions following the same pattern as Users.
  Must NOT do: do NOT allow deleting the Admin role. Do NOT allow removing all permissions from a role (at least `dashboard:read`).
  Wave: 3 | Blocked by: T7, T5 | Blocks: T13, T17 | Can parallelize with: T9, T11, T12
  References: Architecture Section 3.3 (Role, Permission, RolePermission models), Section 9.6 (seeded roles), Section 9.2 (RBAC). Create files under `src/features/role/` and `src/app/(dashboard)/roles/`.
  Acceptance: Admin can create a role, assign permissions, and it takes effect immediately (a user with that role gains the permissions); Role list shows all roles with permission count; Role edit page shows permission checklist grouped by resource.
  QA happy: create a "Custom Role" with `leads:read` permission, assign to a user, log in as that user — assert user can access `/leads` but not `/users`. Evidence: `.omo/evidence/task-10-crm-sales-architecture.txt`
  QA failure: try to delete the Admin role — assert 409 ConflictError "Cannot delete system role". Evidence: `.omo/evidence/task-10-fail-crm-sales-architecture.txt`
  Commit: Y | feat(roles): implement roles and permissions management

- [ ] 11. Implement AuditLog viewer and Settings management
  What: create `src/features/audit-log/` module (repository with `findMany` filtered by entityType/entityId/userId/date range, service is read-only). Create `src/app/(dashboard)/audit-logs/page.tsx` with a filterable table (filter by entity type, date range). Create `src/features/setting/` module (repository, service with `get(key)`, `getAll()`, `update(key, value)`). Create `src/app/(dashboard)/settings/page.tsx` with a settings form (company name, default currency, tax rate, document number prefixes, payment terms default). Create `src/lib/audit.ts` helper: `audit.log({ entityType, entityId, action, previousState, newState, userId, metadata })` — inserts into AuditLog table. This helper is used by all future service methods.
  Must NOT do: do NOT allow editing audit logs (read-only). Do NOT allow non-admin users to access settings.
  Wave: 3 | Blocked by: T7, T5 | Blocks: T13, T17 | Can parallelize with: T9, T10, T12
  References: Architecture Section 3.3 (AuditLog, Setting models), Section 2.3.4 (AuditLog domain), Section 2.3.6 (Setting domain), Section 14.9 (audit logging). Create files under `src/features/audit-log/`, `src/features/setting/`, `src/app/(dashboard)/audit-logs/`, `src/app/(dashboard)/settings/`, `src/lib/audit.ts`.
  Acceptance: AuditLog page shows recent changes with entity type, action, user, timestamp; filters work; Settings page shows and updates settings; updating a setting persists to DB; `audit.log()` inserts a record correctly.
  QA happy: create a user (triggers audit log), navigate to `/audit-logs` — assert the CREATE entry is visible with the correct entity type and user. Evidence: `.omo/evidence/task-11-crm-sales-architecture.txt`
  QA failure: try to `PUT /api/audit-logs/[id]` — assert 405 Method Not Allowed (read-only). Evidence: `.omo/evidence/task-11-fail-crm-sales-architecture.txt`
  Commit: Y | feat(system): implement audit log viewer and settings management

- [ ] 12. Build shared dashboard layout and reusable UI components
  What: create `src/app/(dashboard)/layout.tsx` — the authenticated shell with sidebar + topbar + content area. Create `src/components/layout/sidebar.tsx` (collapsible, permission-filtered nav from `src/config/nav.ts`), `src/components/layout/topbar.tsx` (notification bell with unread count, user dropdown with logout), `src/components/layout/breadcrumb.tsx`. Create `src/config/nav.ts` with the navigation structure from Section 7.2. Create reusable components: `src/components/data-table/data-table.tsx` (TanStack Table wrapper with URL-based pagination/sort/filter), `src/components/status-badge.tsx`, `src/components/page-header.tsx`, `src/components/empty-state.tsx`, `src/components/confirm-dialog.tsx`, `src/components/forms/form-text-field.tsx`, `src/components/forms/form-select-field.tsx`, `src/components/forms/form-textarea-field.tsx`. Create `src/lib/pagination.ts` (offset pagination helper: takes page+pageSize, returns `{ skip, take, page, pageSize }`). Create `src/lib/document-number.ts` (generates document numbers using Counter table: `generateDocumentNo(prefix)` — atomic increment + zero-pad). Create `src/app/(dashboard)/dashboard/page.tsx` (placeholder dashboard with "Welcome" message).
  Must NOT do: do NOT hardcode navigation items in the sidebar component (read from `nav.ts` config). Do NOT make the DataTable fetch its own data (data is passed from Server Component). Do NOT use client-side state for pagination (URL-based).
  Wave: 3 | Blocked by: T7, T3 | Blocks: T13, T17 | Can parallelize with: T9, T10, T11
  References: Architecture Section 7.1-7.12 (all UI architecture), Section 8.6 (URL state), Section 1.2 (folder structure for components). Create files listed above.
  Acceptance: dashboard layout renders sidebar with grouped nav, topbar with user dropdown; sidebar items hidden for users lacking permissions; `DataTable` renders columns with sortable headers, pagination controls, search input; `StatusBadge` maps status strings to colored badges; `generateDocumentNo("LEAD")` returns "LEAD-0001" on first call, "LEAD-0002" on second; `pagination.ts` correctly computes skip/take.
  QA happy: log in as admin — assert sidebar shows all nav items. Log in as Sales Rep — assert System nav items are hidden. Evidence: `.omo/evidence/task-12-crm-sales-architecture.txt`
  QA failure: log in as Sales Rep, manually navigate to `/users` URL — assert redirect to `/dashboard`. Evidence: `.omo/evidence/task-12-fail-crm-sales-architecture.txt`
  Commit: Y | feat(layout): build dashboard shell sidebar and reusable components

#### Phase 4: CRM Lead (Wave 4)

- [ ] 13. Define Lead Prisma model, Zod schemas, types, and state machine
  What: add `Lead` model to `schema.prisma` with fields from Architecture Section 3.3 (id, documentNo @unique, firstName, lastName, email?, phone?, company?, jobTitle?, source, status @default("NEW"), assignedToId?, createdById?, notes?, createdAt, updatedAt, deletedAt). Add `@@map("leads")` and all indexes. Run `prisma db push`. Create `src/features/lead/types.ts` with `LeadStatus` const object (`NEW`, `CONTACTED`, `QUALIFIED`, `DISQUALIFIED`), `LeadSource` const, and `LEAD_TRANSITIONS` map (from Section 2.1.1 state machine). Create `src/features/lead/constants.ts` with status labels, colors, source labels. Create Zod schemas: `src/features/lead/schemas/lead-create.ts`, `lead-update.ts` (partial), `lead-query.ts` (page, pageSize, sort, status filter, search), `lead-transition.ts` (to + reason?).
  Must NOT do: do NOT use Prisma enum types (String for status). Do NOT add tenantId. Do NOT add Prisma query extensions for soft delete.
  Wave: 4 | Blocked by: 9, 10, 12 | Blocks: 14, 15, 16 | Can parallelize with: —
  References: Architecture Section 3.3 (Lead model), Section 2.1.1 (Lead state machine + transition table), Section 10.1 (Zod schema pattern), Section 3.1 (conventions). Create/modify: `prisma/schema.prisma`, `src/features/lead/types.ts`, `src/features/lead/constants.ts`, `src/features/lead/schemas/*.ts`.
  Acceptance: `pnpm prisma db push` creates `leads` table; `LeadStatus.NEW` equals "NEW"; `LEAD_TRANSITIONS["NEW"]` includes "CONTACTED", "QUALIFIED", "DISQUALIFIED"; `LEAD_TRANSITIONS["DISQUALIFIED"]` is empty or admin-only; Zod `leadCreateSchema.parse({ firstName: "John", lastName: "Doe" })` succeeds; `leadCreateSchema.parse({})` throws (firstName required).
  QA happy: run `pnpm prisma db push`, query the leads table schema — assert all columns exist with correct types. Evidence: `.omo/evidence/task-13-crm-sales-architecture.txt`
  QA failure: `leadCreateSchema.parse({ firstName: "" })` — assert Zod validation error (min length 1). Evidence: `.omo/evidence/task-13-fail-crm-sales-architecture.txt`
  Commit: Y | feat(leads): define lead model schemas types and state machine

- [ ] 14. Implement Lead service and repository
  What: create `src/features/lead/repositories/lead.repository.ts` with `findMany({ page, pageSize, sort, status, search })` (manual `deletedAt: null` filter, offset pagination, LIKE search on firstName/lastName/email/company), `findById(id)` (include `deletedAt: null`), `create(data)` (generate documentNo via `generateDocumentNo("LEAD")`, set `createdById`), `update(id, data)`, `softDelete(id)` (set `deletedAt`). Create `src/features/lead/services/lead.service.ts` with `list()`, `getById()` (throws NotFoundError), `create()` (calls audit.log), `update()` (calls audit.log with previousState/newState), `delete()` (calls audit.log), `transition(id, to, reason?)` (validate via LEAD_TRANSITIONS, throw ConflictError if invalid, call audit.log), `convert(id, { title, estimatedValue, expectedCloseDate })` (validate status is QUALIFIED, throw ConflictError if already has Opportunity, create Opportunity — stub for now, just validate and return, actual Opp creation in T17). All service methods call `requirePermission(session, "leads:...")`. Create `src/features/lead/services/lead.service.test.ts` — unit test with mocked repository: test CRUD, test all valid transitions, test all invalid transitions throw ConflictError, test convert requires QUALIFIED.
  Must NOT do: do NOT import Prisma in the service (use repository). Do NOT skip audit logging. Do NOT allow transitions not in LEAD_TRANSITIONS.
  Wave: 4 | Blocked by: 13 | Blocks: 15, 16 | Can parallelize with: —
  References: Architecture Section 1.5 (service layer), Section 1.6 (repository layer), Section 2.1.1 (state machine), Section 11.2 (error flow), Section 12.2 (unit testing). Create: `src/features/lead/repositories/lead.repository.ts`, `src/features/lead/services/lead.service.ts`, `src/features/lead/services/lead.service.test.ts`.
  Acceptance: `pnpm test src/features/lead/services/lead.service.test.ts` passes all tests (CRUD + all transitions + convert); `leadService.transition("invalid-id", "QUALIFIED")` throws NotFoundError; `leadService.transition(validId, "INVALID_STATUS")` throws ConflictError.
  QA happy: run `pnpm test src/features/lead/services/lead.service.test.ts` — assert all tests pass (expect tests for: create, getById, update, delete, transition NEW→CONTACTED, transition NEW→QUALIFIED, transition QUALIFIED→convert, invalid transition DISQUALIFIED→QUALIFIED throws). Evidence: `.omo/evidence/task-14-crm-sales-architecture.txt`
  QA failure: add a test that transitions DISQUALIFIED→QUALIFIED without admin override — assert the test confirms it throws ConflictError. Evidence: `.omo/evidence/task-14-fail-crm-sales-architecture.txt`
  Commit: Y | feat(leads): implement lead service repository and unit tests

- [ ] 15. Implement Lead API (Route Handlers and Server Actions)
  What: create Route Handlers: `src/app/api/leads/route.ts` (GET list with query params, POST create), `src/app/api/leads/[id]/route.ts` (GET, PUT, DELETE), `src/app/api/leads/[id]/transition/route.ts` (POST), `src/app/api/leads/[id]/convert/route.ts` (POST). Each handler: validate with Zod, check `auth()`, check `requirePermission()`, call service, catch AppError and return appropriate HTTP status. Create Server Actions: `src/features/lead/actions/lead-actions.ts` — `createLeadAction`, `updateLeadAction`, `deleteLeadAction`, `transitionLeadAction`, `convertLeadAction`. Each: validate with Zod, check auth + permission, call service, `revalidatePath("/(dashboard)/leads")` on success, return `{ success, data | error }`.
  Must NOT do: do NOT skip Zod validation in Route Handlers. Do NOT skip permission checks. Do NOT call Prisma directly from handlers/actions.
  Wave: 4 | Blocked by: 14 | Blocks: 16 | Can parallelize with: —
  References: Architecture Section 6.1 (response envelope), Section 6.2 (endpoint catalog), Section 6.3 (Server Action contract), Section 11.2 (error flow). Create: `src/app/api/leads/route.ts`, `src/app/api/leads/[id]/route.ts`, `src/app/api/leads/[id]/transition/route.ts`, `src/app/api/leads/[id]/convert/route.ts`, `src/features/lead/actions/lead-actions.ts`.
  Acceptance: `GET /api/leads?page=1&pageSize=20` returns `{ data: [], meta: {...} }`; `POST /api/leads` with valid body returns 201; `POST /api/leads/[id]/transition` with invalid transition returns 409; unauthenticated request returns 401; unauthorized user returns 403.
  QA happy: seed a lead, `curl GET /api/leads` — assert 200 with data array. Evidence: `.omo/evidence/task-15-crm-sales-architecture.txt`
  QA failure: `curl POST /api/leads/[id]/transition` with `{ to: "INVALID" }` — assert 409 ConflictError. Evidence: `.omo/evidence/task-15-fail-crm-sales-architecture.txt`
  Commit: Y | feat(leads): implement lead api route handlers and server actions

- [ ] 16. Build Lead UI pages and components
  What: create `src/app/(dashboard)/leads/page.tsx` (Server Component: reads URL search params, calls `leadService.list()`, passes data to `LeadTable` Client Component). Create `src/app/(dashboard)/leads/new/page.tsx` (renders `LeadForm`), `src/app/(dashboard)/leads/[id]/page.tsx` (detail with status transition buttons), `src/app/(dashboard)/leads/[id]/edit/page.tsx` (renders `LeadForm` pre-filled). Create `src/components/leads/lead-table.tsx` (Client: TanStack Table with columns: documentNo, name, email, company, source, status badge, assignedTo, createdAt; URL-based sort/filter/pagination), `src/components/leads/lead-form.tsx` (Client: React Hook Form + Zod, calls `createLeadAction`/`updateLeadAction`), `src/components/leads/lead-status-actions.tsx` (Client: buttons for valid transitions based on current status, calls `transitionLeadAction`). Create `loading.tsx` and `error.tsx` for the leads route.
  Must NOT do: do NOT fetch data in the Client Component (data from Server Component). Do NOT use local state for table pagination (URL-based). Do NOT show transition buttons for invalid transitions.
  Wave: 4 | Blocked by: 15, 3 | Blocks: 17 | Can parallelize with: —
  References: Architecture Section 7.3-7.12 (all UI patterns), Section 8.1-8.2 (Server/Client Component split). Create files listed above.
  Acceptance: `/leads` renders table with data, sortable columns, pagination, search, status filter; `/leads/new` renders form that creates a lead on submit; `/leads/[id]` shows detail with transition buttons; transition only shows valid options; success toast on create; error toast on failure.
  QA happy: navigate to `/leads/new`, fill form, submit — assert redirect to `/leads/[id]` and success toast. Evidence: `.omo/evidence/task-16-crm-sales-architecture.txt`
  QA failure: submit form with empty firstName — assert inline validation error "First name is required". Evidence: `.omo/evidence/task-16-fail-crm-sales-architecture.txt`
  Commit: Y | feat(leads): build lead list form and detail pages

#### Phase 5: CRM Opportunity (Wave 5)

- [ ] 17. Define Opportunity model, schemas, types, and Lead conversion
  What: add `Opportunity` model to `schema.prisma` (fields from Section 3.3: id, documentNo, leadId FK, title, description?, estimatedValue Decimal(12,2), expectedCloseDate, stage, status, lossReason?, assignedToId?, createdById?, timestamps, deletedAt). Add `@@map("opportunities")` and indexes. Run `prisma db push`. Create `src/features/opportunity/types.ts` with `OpportunityStage` const (PROSPECTING, QUALIFICATION, NEEDS_ANALYSIS, VALUE_PROPOSITION, NEGOTIATION), `OpportunityStatus` const (OPEN, CLOSED_WON, CLOSED_LOST), `OPPORTUNITY_STAGE_TRANSITIONS` map (from Section 2.1.2), `OPPORTUNITY_STATUS_TRANSITIONS` map. Create Zod schemas: `opportunity-create.ts`, `opportunity-update.ts`, `opportunity-query.ts`, `opportunity-transition.ts`, `lead-convert.ts` (title, estimatedValue, expectedCloseDate). Update `lead.service.ts` `convert()` method to actually create an Opportunity record (was stubbed in T14).
  Must NOT do: do NOT allow creating an Opportunity for a non-QUALIFIED lead. Do NOT allow stage transitions backward (except re-open from CLOSED_LOST).
  Wave: 5 | Blocked by: 16 | Blocks: 18, 19, 20 | Can parallelize with: —
  References: Architecture Section 3.3 (Opportunity model), Section 2.1.2 (state machine + transitions), Section 10.1 (Zod pattern). Create/modify: `prisma/schema.prisma`, `src/features/opportunity/types.ts`, `src/features/opportunity/constants.ts`, `src/features/opportunity/schemas/*.ts`, `src/features/lead/services/lead.service.ts` (update convert).
  Acceptance: `prisma db push` creates `opportunities` table; `OPPORTUNITY_STAGE_TRANSITIONS["PROSPECTING"]` includes "QUALIFICATION"; `leadService.convert(qualifiedLeadId, data)` creates an Opportunity with `leadId` set and returns both lead and opportunity; `leadService.convert(disqualifiedLeadId, data)` throws ConflictError.
  QA happy: seed a QUALIFIED lead, call `leadService.convert()` — assert Opportunity created with correct leadId and stage=PROSPECTING. Evidence: `.omo/evidence/task-17-crm-sales-architecture.txt`
  QA failure: seed a NEW lead, call `leadService.convert()` — assert ConflictError "Lead must be QUALIFIED". Evidence: `.omo/evidence/task-17-fail-crm-sales-architecture.txt`
  Commit: Y | feat(opportunities): define model schemas types and lead conversion

- [ ] 18. Implement Opportunity service and repository
  What: create `src/features/opportunity/repositories/opportunity.repository.ts` (same pattern as Lead: findMany with filters for stage/status/leadId/assignedToId, findById, create, update, softDelete). Create `src/features/opportunity/services/opportunity.service.ts` (CRUD + `transition(id, toStage)` validating OPPORTUNITY_STAGE_TRANSITIONS + `closeWon(id)` / `closeLost(id, reason)` + `convert(id)` creating a Quotation stub — validate stage is NEGOTIATION and status is CLOSED_WON). All with audit logging and permission checks. Create unit tests covering all transitions, close won/lost, and convert validation.
  Must NOT do: do NOT allow close-won from stages before NEGOTIATION (must advance through stages). Do NOT allow convert if status is not CLOSED_WON.
  Wave: 5 | Blocked by: 17 | Blocks: 19, 20 | Can parallelize with: —
  References: Architecture Section 2.1.2 (state machine), Section 1.5-1.6 (service/repo patterns). Follow the pattern established in T14 (Lead service). Create: `src/features/opportunity/repositories/opportunity.repository.ts`, `src/features/opportunity/services/opportunity.service.ts`, `src/features/opportunity/services/opportunity.service.test.ts`.
  Acceptance: unit tests pass for all valid stage transitions (PROSPECTING→QUALIFICATION→...→NEGOTIATION→CLOSED_WON), close-lost from any active stage, invalid transitions throw ConflictError, convert requires CLOSED_WON.
  QA happy: run tests — assert PROSPECTING→QUALIFICATION transition succeeds. Evidence: `.omo/evidence/task-18-crm-sales-architecture.txt`
  QA failure: test CLOSED_LOST→PROSPECTING (re-open) without admin — assert ConflictError. Evidence: `.omo/evidence/task-18-fail-crm-sales-architecture.txt`
  Commit: Y | feat(opportunities): implement service repository and tests

- [ ] 19. Implement Opportunity API (Route Handlers and Server Actions)
  What: create Route Handlers: `GET/POST /api/opportunities`, `GET/PUT/DELETE /api/opportunities/[id]`, `POST /api/opportunities/[id]/transition`, `POST /api/opportunities/[id]/convert`. Create Server Actions: `createOpportunityAction`, `updateOpportunityAction`, `transitionOpportunityAction`, `convertOpportunityAction`. Follow the exact same pattern as T15 (Lead API). Each with Zod validation, auth, permission check, service call, error handling.
  Must NOT do: do NOT skip permission checks. Do NOT deviate from the Lead API pattern.
  Wave: 5 | Blocked by: 18 | Blocks: 20 | Can parallelize with: —
  References: Architecture Section 6 (API design), Section 6.3 (Server Action contract). Follow the pattern from T15. Create: `src/app/api/opportunities/*.ts`, `src/features/opportunity/actions/opportunity-actions.ts`.
  Acceptance: `GET /api/opportunities` returns paginated list; `POST /api/opportunities/[id]/transition` with valid stage returns 200; invalid stage returns 409; convert on non-CLOSED_WON returns 409.
  QA happy: seed opportunity, `POST /api/opportunities/[id]/transition` with `{ to: "QUALIFICATION" }` — assert 200. Evidence: `.omo/evidence/task-19-crm-sales-architecture.txt`
  QA failure: `POST /api/opportunities/[id]/transition` with `{ to: "INVALID" }` — assert 409. Evidence: `.omo/evidence/task-19-fail-crm-sales-architecture.txt`
  Commit: Y | feat(opportunities): implement api route handlers and server actions

- [ ] 20. Build Opportunity UI pages and pipeline view
  What: create `src/app/(dashboard)/opportunities/page.tsx` (list), `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`. Create components: `opportunity-table.tsx`, `opportunity-form.tsx`, `opportunity-detail.tsx`, `opportunity-pipeline.tsx` (kanban-style board with columns for each stage, drag-and-drop optional — initial build: click to advance stage), `opportunity-stage-badge.tsx`. Add "Convert to Opportunity" button on Lead detail page (T16). Add "Convert to Quotation" button on Opportunity detail (calls convertOpportunityAction, disabled if status != CLOSED_WON).
  Must NOT do: do NOT implement drag-and-drop in the initial build (click buttons instead). Do NOT show "Convert to Quotation" if status is not CLOSED_WON.
  Wave: 5 | Blocked by: 19 | Blocks: 21 | Can parallelize with: —
  References: Architecture Section 7 (UI patterns). Follow the pattern from T16 (Lead UI). Create: files in `src/app/(dashboard)/opportunities/` and `src/components/opportunities/`.
  Acceptance: opportunity list paginates/sorts/filters; pipeline view shows opportunities grouped by stage; stage advance via button; Lead detail has "Convert" button (visible only if QUALIFIED); Opportunity detail has "Convert to Quotation" (visible only if CLOSED_WON).
  QA happy: navigate to `/opportunities`, assert pipeline view renders with stages as columns. Evidence: `.omo/evidence/task-20-crm-sales-architecture.txt`
  QA failure: navigate to a CLOSED_LOST opportunity detail — assert "Convert to Quotation" button is NOT visible. Evidence: `.omo/evidence/task-20-fail-crm-sales-architecture.txt`
  Commit: Y | feat(opportunities): build opportunity pages and pipeline view

#### Phase 6: CRM Quotation (Wave 6)

- [ ] 21. Define Quotation and QuotationItem models, schemas, and types
  What: add `Quotation` and `QuotationItem` models to `schema.prisma` (fields from Section 3.3). Quotation: id, documentNo, opportunityId FK, customerId? FK (optional), status, subject, validUntil, subtotal, discountTotal, taxTotal, grandTotal, sentAt?, acceptedAt?, notes?, createdById?, timestamps, deletedAt. QuotationItem: id, quotationId FK, description, quantity, unitPrice, discountPercent, lineTotal, timestamps, deletedAt. Add `@@map` and indexes. Run `prisma db push`. Create `src/features/quotation/types.ts` with `QuotationStatus` const (DRAFT, READY, SENT, ACCEPTED, REJECTED, EXPIRED), `QUOTATION_TRANSITIONS` map (from Section 2.1.3). Create Zod schemas: `quotation-create.ts`, `quotation-update.ts`, `quotation-query.ts`, `quotation-transition.ts`, `quotation-item-create.ts`, `quotation-item-update.ts`.
  Must NOT do: do NOT compute totals in the schema (computed in service). Do NOT allow editing a SENT/ACCEPTED quotation (must revise to DRAFT first).
  Wave: 6 | Blocked by: 20 | Blocks: 22, 23, 24 | Can parallelize with: —
  References: Architecture Section 3.3 (Quotation, QuotationItem models), Section 2.1.3 (state machine). Create: `prisma/schema.prisma`, `src/features/quotation/types.ts`, `src/features/quotation/constants.ts`, `src/features/quotation/schemas/*.ts`.
  Acceptance: `prisma db push` creates both tables; `QUOTATION_TRANSITIONS["DRAFT"]` includes "READY", "SENT"; `QUOTATION_TRANSITIONS["SENT"]` includes "ACCEPTED", "REJECTED", "EXPIRED"; Zod schemas validate correctly.
  QA happy: `quotationCreateSchema.parse({ opportunityId: "x", subject: "Test", validUntil: new Date() })` succeeds. Evidence: `.omo/evidence/task-21-crm-sales-architecture.txt`
  QA failure: `quotationItemCreateSchema.parse({ description: "" })` — assert validation error. Evidence: `.omo/evidence/task-21-fail-crm-sales-architecture.txt`
  Commit: Y | feat(quotations): define quotation models schemas and types

- [ ] 22. Implement Quotation service and repository with line items and totals
  What: create `src/features/quotation/repositories/quotation.repository.ts` and `quotation-item.repository.ts`. Create `src/features/quotation/services/quotation.service.ts` with CRUD + state machine + line item management + totals calculation. Totals: `recalculate(quotationId)` — fetch all items, compute `lineTotal = qty * unitPrice * (1 - discountPercent/100)`, `subtotal = sum(lineTotal)`, `discountTotal` and `taxTotal` per settings, `grandTotal = subtotal - discountTotal + taxTotal`. Every line item add/update/delete triggers `recalculate()` in a `prisma.$transaction()`. `convert(quotationId)` — validate status is ACCEPTED, create SalesOrder stub (actual creation in T29). Create unit tests for: totals calculation (various discount scenarios), state transitions, line item CRUD, convert validation.
  Must NOT do: do NOT calculate totals in the UI. Do NOT allow line item changes on a SENT quotation. Do NOT use floating-point for money (use Decimal).
  Wave: 6 | Blocked by: 21 | Blocks: 23, 24 | Can parallelize with: —
  References: Architecture Section 2.1.3 (state machine), Section 3.5 (Decimal for money), Section 13.6 (transactional writes). Follow the pattern from T14. Create: `src/features/quotation/repositories/*.ts`, `src/features/quotation/services/quotation.service.ts`, `src/features/quotation/services/quotation.service.test.ts`.
  Acceptance: unit tests pass for totals (subtotal, discount, tax, grandTotal); adding an item updates totals; removing an item updates totals; state transitions work; convert requires ACCEPTED.
  QA happy: create quotation with 2 items (qty 10 @ $5.00, qty 5 @ $20.00), assert subtotal = $200.00. Evidence: `.omo/evidence/task-22-crm-sales-architecture.txt`
  QA failure: add item to a SENT quotation — assert ConflictError "Cannot modify items on a SENT quotation". Evidence: `.omo/evidence/task-22-fail-crm-sales-architecture.txt`
  Commit: Y | feat(quotations): implement service with line items and totals calculation

- [ ] 23. Implement Quotation API (Route Handlers and Server Actions)
  What: create Route Handlers: `GET/POST /api/quotations`, `GET/PUT/DELETE /api/quotations/[id]`, `POST /api/quotations/[id]/transition`, `POST /api/quotations/[id]/items` (add item), `PUT/DELETE /api/quotations/[id]/items/[itemId]`, `POST /api/quotations/[id]/convert`. Create Server Actions: `createQuotationAction`, `updateQuotationAction`, `transitionQuotationAction`, `addQuotationItemAction`, `updateQuotationItemAction`, `removeQuotationItemAction`, `convertQuotationAction`. Follow the same pattern as T15.
  Must NOT do: do NOT skip transactional totals recalculation on item changes.
  Wave: 6 | Blocked by: 22 | Blocks: 24 | Can parallelize with: —
  References: Architecture Section 6 (API design). Follow pattern from T15. Create: `src/app/api/quotations/*.ts`, `src/features/quotation/actions/quotation-actions.ts`.
  Acceptance: all endpoints return correct status codes; adding an item via API recalculates totals; convert returns 409 if not ACCEPTED.
  QA happy: `POST /api/quotations/[id]/items` with item data — assert 200 and totals updated in response. Evidence: `.omo/evidence/task-23-crm-sales-architecture.txt`
  QA failure: `POST /api/quotations/[sentId]/items` — assert 409. Evidence: `.omo/evidence/task-23-fail-crm-sales-architecture.txt`
  Commit: Y | feat(quotations): implement api with sub-resource item endpoints

- [ ] 24. Build Quotation UI pages with dynamic line item editor
  What: create `src/app/(dashboard)/quotations/page.tsx` (list), `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`. Create components: `quotation-table.tsx`, `quotation-form.tsx` (includes `QuotationItemEditor` — dynamic line items with `useFieldArray`, add/remove rows, each row: description, quantity, unitPrice, discountPercent; totals auto-update as user types), `quotation-detail.tsx` (shows items, totals breakdown, status transitions), `quotation-totals.tsx` (subtotal, discount, tax, grand total display). Detail page shows "Send", "Accept", "Reject" buttons based on status. "Convert to Sales Order" button visible if ACCEPTED.
  Must NOT do: do NOT allow adding line items in the UI if status is SENT/ACCEPTED/REJECTED/EXPIRED. Do NOT compute totals on the client (display server-computed totals).
  Wave: 6 | Blocked by: 23 | Blocks: 25 | Can parallelize with: —
  References: Architecture Section 7.4 (forms with useFieldArray). Follow pattern from T16. Create: files in `src/app/(dashboard)/quotations/` and `src/components/quotations/`.
  Acceptance: quotation form supports dynamic line items; totals display updates when items change; status transition buttons appear based on current status; line item editor disabled on non-DRAFT quotations.
  QA happy: create quotation, add 3 line items, save — assert quotation detail shows correct totals. Evidence: `.omo/evidence/task-24-crm-sales-architecture.txt`
  QA failure: open a SENT quotation edit page — assert line item editor is disabled (no add/remove). Evidence: `.omo/evidence/task-24-fail-crm-sales-architecture.txt`
  Commit: Y | feat(quotations): build quotation pages with line item editor

#### Phase 7: CRM Customer (Wave 7)

- [ ] 25. Define Customer, CustomerContact, CustomerAddress models and schemas
  What: add `Customer`, `CustomerContact`, `CustomerAddress` models to `schema.prisma` (fields from Section 3.3). Customer: id, documentNo, name, email?, phone?, taxId?, website?, status, creditLimit?, paymentTerms, createdById?, timestamps, deletedAt. CustomerContact: id, customerId FK, name, email?, phone?, jobTitle?, isPrimary, timestamps, deletedAt. CustomerAddress: id, customerId FK, type (BILLING/SHIPPING), line1, line2?, city, state?, postalCode?, country, timestamps, deletedAt. Add `@@map` and indexes. Run `prisma db push`. Create `src/features/customer/types.ts` with `CustomerStatus` const (NEW, ACTIVE, INACTIVE, BLOCKED), `CUSTOMER_TRANSITIONS` map (from Section 2.1.4). Create Zod schemas: `customer-create.ts`, `customer-update.ts`, `customer-query.ts`, `contact-create.ts`, `contact-update.ts`, `address-create.ts`, `address-update.ts`.
  Must NOT do: do NOT allow more than one primary contact per customer (enforced in service). Do NOT add tenantId.
  Wave: 7 | Blocked by: 24 | Blocks: 26, 27, 28 | Can parallelize with: —
  References: Architecture Section 3.3 (Customer models), Section 2.1.4 (state machine). Create: `prisma/schema.prisma`, `src/features/customer/types.ts`, `src/features/customer/constants.ts`, `src/features/customer/schemas/*.ts`.
  Acceptance: `prisma db push` creates 3 tables; `CUSTOMER_TRANSITIONS["ACTIVE"]` includes "INACTIVE", "BLOCKED"; Zod schemas validate.
  QA happy: `customerCreateSchema.parse({ name: "Acme Corp" })` succeeds. Evidence: `.omo/evidence/task-25-crm-sales-architecture.txt`
  QA failure: `addressCreateSchema.parse({ type: "INVALID" })` — assert Zod enum error. Evidence: `.omo/evidence/task-25-fail-crm-sales-architecture.txt`
  Commit: Y | feat(customers): define customer models schemas and types

- [ ] 26. Implement Customer service and repository with contacts and addresses
  What: create `src/features/customer/repositories/customer.repository.ts`, `customer-contact.repository.ts`, `customer-address.repository.ts`. Create `src/features/customer/services/customer.service.ts` with: CRUD + state transitions + contact management (`addContact`, `updateContact`, `removeContact`, `setPrimaryContact` — unsets other primaries) + address management (`addAddress`, `updateAddress`, `removeAddress`). All with audit logging and permissions. Create unit tests for: status transitions, primary contact enforcement (only one primary), BLOCKED customer check (exposes a `canCreateSalesOrder(customerId)` method for Sales module to use later).
  Must NOT do: do NOT allow multiple primary contacts. Do NOT hard-delete customers with SalesOrders (restrict).
  Wave: 7 | Blocked by: 25 | Blocks: 27, 28 | Can parallelize with: —
  References: Architecture Section 2.1.4 (state machine), Section 3.7 (FK dependencies — cascade rules). Follow pattern from T14. Create: repositories, service, service test.
  Acceptance: unit tests pass; `setPrimaryContact` unsets previous primary; `canCreateSalesOrder` returns false for BLOCKED/INACTIVE customers.
  QA happy: add 2 contacts, set second as primary — assert first is no longer primary. Evidence: `.omo/evidence/task-26-crm-sales-architecture.txt`
  QA failure: try to `setPrimaryContact` on a non-existent contact — assert NotFoundError. Evidence: `.omo/evidence/task-26-fail-crm-sales-architecture.txt`
  Commit: Y | feat(customers): implement service with contacts and addresses

- [ ] 27. Implement Customer API (Route Handlers and Server Actions)
  What: create Route Handlers: `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/[id]`, `POST/PUT/DELETE /api/customers/[id]/contacts`, `POST/PUT/DELETE /api/customers/[id]/addresses`. Create Server Actions for all CRUD operations. Follow the same pattern as T15.
  Must NOT do: do NOT skip permission checks on sub-resources.
  Wave: 7 | Blocked by: 26 | Blocks: 28 | Can parallelize with: —
  References: Architecture Section 6 (API design). Follow pattern from T15. Create: `src/app/api/customers/*.ts`, `src/features/customer/actions/customer-actions.ts`.
  Acceptance: all endpoints work; contact/address sub-resource CRUD works; 404 for non-existent customer.
  QA happy: `POST /api/customers/[id]/contacts` — assert 200 and contact created. Evidence: `.omo/evidence/task-27-crm-sales-architecture.txt`
  QA failure: `DELETE /api/customers/[nonexistent]` — assert 404. Evidence: `.omo/evidence/task-27-fail-crm-sales-architecture.txt`
  Commit: Y | feat(customers): implement api with contact and address sub-resources

- [ ] 28. Build Customer UI pages with tabs
  What: create `src/app/(dashboard)/customers/page.tsx` (list), `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`. Create components: `customer-table.tsx`, `customer-form.tsx`, `customer-detail.tsx` (tabbed: Info, Contacts, Addresses, History), `contact-list.tsx` (inline editable list with add/edit/remove), `address-list.tsx` (inline editable). Detail page shows purchase history (empty placeholder — populated in Sales phase). Status badge with BLOCKED → red, ACTIVE → green.
  Must NOT do: do NOT show purchase history yet (Sales module not built). Do NOT allow editing contacts/addresses on a BLOCKED customer.
  Wave: 7 | Blocked by: 27 | Blocks: 29 | Can parallelize with: —
  References: Architecture Section 7 (UI patterns). Follow pattern from T16. Create: files in `src/app/(dashboard)/customers/` and `src/components/customers/`.
  Acceptance: customer list paginates/sorts/filters; detail page has 4 tabs; contacts tab shows inline-editable list; adding a contact works inline; primary contact badge shown; status transitions work.
  QA happy: navigate to customer detail, click Contacts tab, add a contact — assert it appears inline. Evidence: `.omo/evidence/task-28-crm-sales-architecture.txt`
  QA failure: try to add a contact to a BLOCKED customer — assert error toast "Customer is blocked". Evidence: `.omo/evidence/task-28-fail-crm-sales-architecture.txt`
  Commit: Y | feat(customers): build customer pages with tabbed detail view

#### Phase 8: Sales Order (Wave 8)

- [ ] 29. Define SalesOrder and SalesOrderItem models, schemas, and Quotation conversion
  What: add `SalesOrder` and `SalesOrderItem` models to `schema.prisma` (fields from Section 3.3). SalesOrder: id, documentNo, customerId FK (required), quotationId? FK (optional), status, orderDate, expectedDeliveryDate?, subtotal, discountTotal, taxTotal, grandTotal, notes?, createdById?, timestamps, deletedAt. SalesOrderItem: id, salesOrderId FK, description, quantity, unitPrice, discountPercent, lineTotal, deliveredQuantity (default 0), timestamps, deletedAt. Add `@@map` and indexes. Run `prisma db push`. Create `src/features/sales-order/types.ts` with `SalesOrderStatus` const (DRAFT, PENDING, CONFIRMED, FULFILLING, DELIVERED, INVOICED, COMPLETED, CANCELLED), `SALES_ORDER_TRANSITIONS` map (from Section 2.2.1). Create Zod schemas: `sales-order-create.ts`, `sales-order-update.ts`, `sales-order-query.ts`, `sales-order-transition.ts`, `quotation-convert.ts`. Update `quotation.service.ts` `convert()` to actually create a SalesOrder with copied line items (was stubbed in T22).
  Must NOT do: do NOT allow creating a SalesOrder for a non-ACTIVE customer. Do NOT copy line items without recalculating (they should mirror quotation items).
  Wave: 8 | Blocked by: 28 | Blocks: 30, 31, 32 | Can parallelize with: —
  References: Architecture Section 3.3 (SalesOrder, SalesOrderItem), Section 2.2.1 (state machine). Create: `prisma/schema.prisma`, `src/features/sales-order/types.ts`, `src/features/sales-order/constants.ts`, `src/features/sales-order/schemas/*.ts`. Modify: `src/features/quotation/services/quotation.service.ts`.
  Acceptance: `prisma db push` creates tables; `quotationService.convert(acceptedQuoteId)` creates SalesOrder with matching line items; `quotationService.convert(nonAcceptedQuoteId)` throws ConflictError.
  QA happy: seed ACCEPTED quotation with 2 items, convert — assert SalesOrder has 2 items with matching descriptions/quantities. Evidence: `.omo/evidence/task-29-crm-sales-architecture.txt`
  QA failure: convert a DRAFT quotation — assert ConflictError "Quotation must be ACCEPTED". Evidence: `.omo/evidence/task-29-fail-crm-sales-architecture.txt`
  Commit: Y | feat(sales-orders): define models schemas and quotation conversion

- [ ] 30. Implement SalesOrder service and repository with auto-status logic
  What: create repositories and `sales-order.service.ts` with: CRUD + state machine + `checkAndAutoTransition(salesOrderId)` — called after DeliveryNote/Invoice/Payment creation: if first DN → status=FULFILLING; if all items delivered → DELIVERED; if invoice created → INVOICED; if fully paid → COMPLETED. Uses `prisma.$transaction()` for multi-table updates. `convert(quotationId)` — validates quotation ACCEPTED, creates SalesOrder + copies line items, recalculates totals. Create unit tests for auto-status logic (all paths), state machine, conversion.
  Must NOT do: do NOT make auto-status non-idempotent (calling twice should not break). Do NOT skip transactional updates.
  Wave: 8 | Blocked by: 29 | Blocks: 31, 32 | Can parallelize with: —
  References: Architecture Section 2.2.1 (auto-transitions), Section 13.6 (transactional writes). Follow pattern from T14. Create: `src/features/sales-order/repositories/*.ts`, `src/features/sales-order/services/sales-order.service.ts`, test file.
  Acceptance: unit tests pass for: DRAFT→PENDING→CONFIRMED; auto FULFILLING on first DN; auto DELIVERED when deliveredQuantity >= quantity for all items; auto INVOICED on invoice; auto COMPLETED on full payment.
  QA happy: seed SalesOrder with 1 item qty 10, create DN with qty 10, call `checkAndAutoTransition` — assert status DELIVERED. Evidence: `.omo/evidence/task-30-crm-sales-architecture.txt`
  QA failure: create DN with qty 15 (exceeds ordered 10) — assert ConflictError. Evidence: `.omo/evidence/task-30-fail-crm-sales-architecture.txt`
  Commit: Y | feat(sales-orders): implement service with auto-status logic

- [ ] 31. Implement SalesOrder API (Route Handlers and Server Actions)
  What: create Route Handlers: `GET/POST /api/sales-orders`, `GET/PUT/DELETE /api/sales-orders/[id]`, `POST /api/sales-orders/[id]/transition`, `POST /api/quotations/[id]/convert`. Create Server Actions. Follow T15 pattern.
  Must NOT do: do NOT skip auto-status trigger after downstream document creation.
  Wave: 8 | Blocked by: 30 | Blocks: 32 | Can parallelize with: —
  References: Architecture Section 6. Follow pattern from T15. Create: `src/app/api/sales-orders/*.ts`, `src/features/sales-order/actions/sales-order-actions.ts`.
  Acceptance: all endpoints work; convert endpoint returns both quotation (updated) and salesOrder (new).
  QA happy: `POST /api/quotations/[id]/convert` on ACCEPTED quotation — assert 200 with salesOrder data. Evidence: `.omo/evidence/task-31-crm-sales-architecture.txt`
  QA failure: `POST /api/sales-orders/[draftId]/transition` with `{ to: "FULFILLING" }` — assert 409 (must go through PENDING→CONFIRMED first). Evidence: `.omo/evidence/task-31-fail-crm-sales-architecture.txt`
  Commit: Y | feat(sales-orders): implement api route handlers and server actions

- [ ] 32. Build SalesOrder UI pages with line items and delivery status
  What: create `src/app/(dashboard)/sales-orders/` pages (list, new, detail, edit). Create components: `sales-order-table.tsx`, `sales-order-form.tsx` (with line item editor like quotation), `sales-order-detail.tsx` (shows items with delivered qty, delivery status, invoice status, payment status). "Convert from Quotation" button on quotation detail (if ACCEPTED). Status badge with color per status.
  Must NOT do: do NOT show line item editor on CONFIRMED+ orders (use read-only display). Do NOT allow status changes from UI (auto-driven by downstream documents).
  Wave: 8 | Blocked by: 31 | Blocks: 33 | Can parallelize with: —
  References: Architecture Section 7. Follow pattern from T16/T24. Create: files in `src/app/(dashboard)/sales-orders/` and `src/components/sales-orders/`.
  Acceptance: list paginates/sorts/filters; form with line items; detail shows delivery progress per item; status transitions are auto-driven (no manual status buttons except PENDING→CONFIRMED and cancel).
  QA happy: create SO from quotation, view detail — assert line items match quotation, delivered qty 0. Evidence: `.omo/evidence/task-32-crm-sales-architecture.txt`
  QA failure: try to edit a CONFIRMED sales order's line items — assert read-only. Evidence: `.omo/evidence/task-32-fail-crm-sales-architecture.txt`
  Commit: Y | feat(sales-orders): build pages with line items and status display

#### Phase 9: Delivery Note (Wave 9)

- [ ] 33. Define DeliveryNote and DeliveryNoteItem models, schemas, and types
  What: add `DeliveryNote` and `DeliveryNoteItem` models to `schema.prisma` (fields from Section 3.3). DeliveryNote: id, documentNo, salesOrderId FK, status, deliveryDate?, carrier?, trackingNumber?, notes?, createdById?, timestamps, deletedAt. DeliveryNoteItem: id, deliveryNoteId FK, salesOrderItemId FK, description, quantity, timestamps, deletedAt. Add `@@map` and indexes. Run `prisma db push`. Create types (DeliveryNoteStatus, DELIVERY_NOTE_TRANSITIONS from Section 2.2.2) and Zod schemas.
  Must NOT do: do NOT allow creating a DN for a DRAFT/PENDING/CANCELLED sales order.
  Wave: 9 | Blocked by: 32 | Blocks: 34, 35, 36 | Can parallelize with: —
  References: Architecture Section 3.3, Section 2.2.2 (state machine). Create: `prisma/schema.prisma`, `src/features/delivery-note/types.ts`, `src/features/delivery-note/schemas/*.ts`.
  Acceptance: `prisma db push` creates tables; `DELIVERY_NOTE_TRANSITIONS["DRAFT"]` includes "DISPATCHED", "CANCELLED".
  QA happy: schema validates correctly. Evidence: `.omo/evidence/task-33-crm-sales-architecture.txt`
  QA failure: `deliveryNoteItemCreateSchema.parse({ quantity: -5 })` — assert validation error (min 0). Evidence: `.omo/evidence/task-33-fail-crm-sales-architecture.txt`
  Commit: Y | feat(delivery-notes): define models schemas and types

- [ ] 34. Implement DeliveryNote service with partial delivery and qty validation
  What: create repositories and `delivery-note.service.ts` with: CRUD + state machine + `create(data)` that validates each item quantity does not exceed `salesOrderItem.quantity - salesOrderItem.deliveredQuantity` (remaining), then in a `prisma.$transaction()`: creates DN + DN items + updates `SalesOrderItem.deliveredQuantity` + calls `salesOrderService.checkAndAutoTransition()`. Create unit tests for: partial delivery (qty < ordered), full delivery (qty = ordered), over-delivery (throws ConflictError), auto-status trigger.
  Must NOT do: do NOT allow delivering more than ordered. Do NOT skip the transactional update of deliveredQuantity.
  Wave: 9 | Blocked by: 33 | Blocks: 35, 36 | Can parallelize with: —
  References: Architecture Section 2.2.2 (business rules), Section 13.6 (transactions). Follow pattern from T14. Create: repositories, service, test.
  Acceptance: unit tests pass for partial (qty 5 of 10 → remaining 5), full (qty 10 of 10 → SO auto-DELIVERED), over-delivery (qty 15 of 10 → ConflictError).
  QA happy: seed SO item qty 10, create DN with qty 5 — assert deliveredQuantity=5, SO status=FULFILLING. Evidence: `.omo/evidence/task-34-crm-sales-architecture.txt`
  QA failure: try to deliver qty 15 on a 10-qty item — assert ConflictError "Delivered quantity exceeds ordered quantity". Evidence: `.omo/evidence/task-34-fail-crm-sales-architecture.txt`
  Commit: Y | feat(delivery-notes): implement service with partial delivery validation

- [ ] 35. Implement DeliveryNote API (Route Handlers and Server Actions)
  What: create Route Handlers: `GET/POST /api/delivery-notes`, `GET/PUT/DELETE /api/delivery-notes/[id]`, `POST /api/delivery-notes/[id]/transition`. Create Server Actions. Follow T15 pattern.
  Must NOT do: do NOT skip the sales order auto-status trigger after DN creation.
  Wave: 9 | Blocked by: 34 | Blocks: 36 | Can parallelize with: —
  References: Architecture Section 6. Follow pattern from T15. Create: `src/app/api/delivery-notes/*.ts`, `src/features/delivery-note/actions/delivery-note-actions.ts`.
  Acceptance: endpoints work; creating a DN triggers SO auto-status; 409 for over-delivery.
  QA happy: `POST /api/delivery-notes` with valid data — assert 200 and SO status updated. Evidence: `.omo/evidence/task-35-crm-sales-architecture.txt`
  QA failure: `POST /api/delivery-notes` for a DRAFT sales order — assert 409. Evidence: `.omo/evidence/task-35-fail-crm-sales-architecture.txt`
  Commit: Y | feat(delivery-notes): implement api route handlers and server actions

- [ ] 36. Build DeliveryNote UI pages with remaining qty display
  What: create `src/app/(dashboard)/delivery-notes/` pages. Create components: `delivery-note-table.tsx`, `delivery-note-form.tsx` (line item selector showing SalesOrderItem with remaining qty), `delivery-note-detail.tsx`. Form shows remaining qty per SO item (ordered - already delivered) and prevents entering more than remaining.
  Must NOT do: do NOT allow selecting items from a non-CONFIRMED/FULFILLING sales order. Do NOT allow qty input exceeding remaining.
  Wave: 9 | Blocked by: 35 | Blocks: 37 | Can parallelize with: —
  References: Architecture Section 7. Follow pattern from T16. Create: files in `src/app/(dashboard)/delivery-notes/` and `src/components/delivery-notes/`.
  Acceptance: form shows SO items with remaining qty; qty input max = remaining; creating DN updates SO detail page delivery progress.
  QA happy: open DN form for a CONFIRMED SO, select item — assert remaining qty displayed, input capped at remaining. Evidence: `.omo/evidence/task-36-crm-sales-architecture.txt`
  QA failure: try to enter qty > remaining — assert client-side validation prevents it. Evidence: `.omo/evidence/task-36-fail-crm-sales-architecture.txt`
  Commit: Y | feat(delivery-notes): build pages with remaining qty display

#### Phase 10: Sales Invoice (Wave 10)

- [ ] 37. Define SalesInvoice and SalesInvoiceItem models, schemas, and types
  What: add `SalesInvoice` and `SalesInvoiceItem` models (fields from Section 3.3). SalesInvoice: id, documentNo, salesOrderId FK, customerId FK, status, issueDate, dueDate, subtotal, discountTotal, taxTotal, grandTotal, paidAmount (default 0), notes?, createdById?, timestamps, deletedAt. SalesInvoiceItem: id, salesInvoiceId FK, description, quantity, unitPrice, discountPercent, lineTotal, timestamps, deletedAt. Add `@@map` and indexes. Run `prisma db push`. Create types (SalesInvoiceStatus, SALES_INVOICE_TRANSITIONS from Section 2.2.3) and Zod schemas.
  Must NOT do: do NOT allow invoicing a non-DELIVERED/FULFILLING sales order. Do NOT compute paidAmount in the schema (service-managed).
  Wave: 10 | Blocked by: 36 | Blocks: 38, 39, 40 | Can parallelize with: —
  References: Architecture Section 3.3, Section 2.2.3. Create: `prisma/schema.prisma`, `src/features/sales-invoice/types.ts`, `src/features/sales-invoice/schemas/*.ts`.
  Acceptance: `prisma db push` creates tables; `SALES_INVOICE_TRANSITIONS["OPEN"]` includes "PARTIALLY_PAID", "PAID", "OVERDUE".
  QA happy: schema validates. Evidence: `.omo/evidence/task-37-crm-sales-architecture.txt`
  QA failure: `salesInvoiceCreateSchema.parse({ dueDate: undefined })` — assert validation error. Evidence: `.omo/evidence/task-37-fail-crm-sales-architecture.txt`
  Commit: Y | feat(sales-invoices): define models schemas and types

- [ ] 38. Implement SalesInvoice service with due date calc and paidAmount tracking
  What: create repositories and `sales-invoice.service.ts` with: CRUD + state machine + `create(data)` that computes `dueDate = issueDate + customer.paymentTerms days`, copies line items from SalesOrder (or DeliveryNote), computes totals. `updatePaidAmount(invoiceId)` — called after Payment creation: sums all RECEIVED payments for the invoice, updates `paidAmount`, auto-transitions status (OPEN→PARTIALLY_PAID if 0<paid<total, →PAID if paid>=total), calls `salesOrderService.checkAndAutoTransition()`. `checkOverdue()` — marks invoices past dueDate as OVERDUE (called on-read or via scheduled job). Create unit tests for: due date calculation, paidAmount update, status auto-transitions, overdue detection.
  Must NOT do: do NOT use floating-point for paidAmount (Decimal). Do NOT skip SO auto-status trigger.
  Wave: 10 | Blocked by: 37 | Blocks: 39, 40 | Can parallelize with: —
  References: Architecture Section 2.2.3 (business rules), Section 3.5 (Decimal). Follow pattern from T14. Create: repositories, service, test.
  Acceptance: unit tests pass for: dueDate = issueDate + 30 days (default terms); paidAmount updates on payment; OPEN→PARTIALLY_PAID on partial payment; →PAID on full payment; SO auto-INVOICED.
  QA happy: create invoice, record payment of 50% — assert status PARTIALLY_PAID, paidAmount correct. Evidence: `.omo/evidence/task-38-crm-sales-architecture.txt`
  QA failure: create invoice with issueDate today, checkOverdue — assert not OVERDUE (due in future). Set issueDate 60 days ago — assert OVERDUE. Evidence: `.omo/evidence/task-38-fail-crm-sales-architecture.txt`
  Commit: Y | feat(sales-invoices): implement service with due date and paid amount tracking

- [ ] 39. Implement SalesInvoice API (Route Handlers and Server Actions)
  What: create Route Handlers: `GET/POST /api/sales-invoices`, `GET/PUT/DELETE /api/sales-invoices/[id]`, `POST /api/sales-invoices/[id]/transition`. Create Server Actions. Follow T15 pattern.
  Must NOT do: do NOT skip paidAmount recalculation after payment changes.
  Wave: 10 | Blocked by: 38 | Blocks: 40 | Can parallelize with: —
  References: Architecture Section 6. Follow pattern from T15. Create: `src/app/api/sales-invoices/*.ts`, `src/features/sales-invoice/actions/sales-invoice-actions.ts`.
  Acceptance: endpoints work; creating invoice triggers SO auto-INVOICED; 409 for invoicing non-DELIVERED order.
  QA happy: `POST /api/sales-invoices` for DELIVERED SO — assert 200, SO status INVOICED. Evidence: `.omo/evidence/task-39-crm-sales-architecture.txt`
  QA failure: `POST /api/sales-invoices` for DRAFT SO — assert 409. Evidence: `.omo/evidence/task-39-fail-crm-sales-architecture.txt`
  Commit: Y | feat(sales-invoices): implement api route handlers and server actions

- [ ] 40. Build SalesInvoice UI pages with payment status
  What: create `src/app/(dashboard)/sales-invoices/` pages. Components: `sales-invoice-table.tsx`, `sales-invoice-form.tsx`, `sales-invoice-detail.tsx` (shows items, totals, payment status: paid/partial/overdue, payment history). "Create Invoice" button on SO detail (if DELIVERED). Status badge: OPEN→blue, PARTIALLY_PAID→yellow, PAID→green, OVERDUE→red.
  Must NOT do: do NOT allow editing paidAmount from the UI (service-managed via payments). Do NOT allow editing invoice items after issuance.
  Wave: 10 | Blocked by: 39 | Blocks: 41 | Can parallelize with: —
  References: Architecture Section 7. Follow pattern from T16. Create: files in `src/app/(dashboard)/sales-invoices/` and `src/components/sales-invoices/`.
  Acceptance: list paginates/sorts/filters by status; detail shows payment status and history; "Create Invoice" button only on DELIVERED SOs.
  QA happy: view invoice detail — assert payment status badge and paid amount displayed. Evidence: `.omo/evidence/task-40-crm-sales-architecture.txt`
  QA failure: try to edit an OPEN invoice's items — assert read-only. Evidence: `.omo/evidence/task-40-fail-crm-sales-architecture.txt`
  Commit: Y | feat(sales-invoices): build pages with payment status display

#### Phase 11: Payment (Wave 11)

- [ ] 41. Define Payment model, schemas, and types
  What: add `Payment` model (fields from Section 3.3). Payment: id, documentNo, salesInvoiceId FK, customerId FK, amount Decimal, paymentMethod, referenceNumber?, paymentDate, status, notes?, createdById?, timestamps, deletedAt. Add `@@map` and indexes. Run `prisma db push`. Create types (PaymentStatus, PAYMENT_TRANSITIONS from Section 2.2.4, PaymentMethod const) and Zod schemas.
  Must NOT do: do NOT allow payment amount > invoice remaining balance (enforced in service). Do NOT add PaymentAllocation M2M (single-invoice payments only in initial build).
  Wave: 11 | Blocked by: 40 | Blocks: 42, 43, 44 | Can parallelize with: —
  References: Architecture Section 3.3, Section 2.2.4. Create: `prisma/schema.prisma`, `src/features/payment/types.ts`, `src/features/payment/schemas/*.ts`.
  Acceptance: `prisma db push` creates table; `PAYMENT_TRANSITIONS["PENDING"]` includes "RECEIVED", "CANCELLED", "FAILED".
  QA happy: schema validates. Evidence: `.omo/evidence/task-41-crm-sales-architecture.txt`
  QA failure: `paymentCreateSchema.parse({ amount: -100 })` — assert validation error. Evidence: `.omo/evidence/task-41-fail-crm-sales-architecture.txt`
  Commit: Y | feat(payments): define model schemas and types

- [ ] 42. Implement Payment service with invoice reconciliation and SO completion
  What: create repositories and `payment.service.ts` with: CRUD + state machine + `create(data)` that validates amount <= invoice remaining balance (total - paidAmount), then in transaction: creates Payment (PENDING), transitions to RECEIVED, calls `salesInvoiceService.updatePaidAmount()` which auto-transitions invoice status, calls `salesOrderService.checkAndAutoTransition()` which may transition SO to COMPLETED. `transition(id, to)` for PENDING→RECEIVED/CANCELLED/FAILED. Create unit tests for: balance validation, invoice status update (PARTIALLY_PAID, PAID), SO completion (COMPLETED when fully paid).
  Must NOT do: do NOT allow payment exceeding remaining balance. Do NOT skip transactional invoice/SO updates.
  Wave: 11 | Blocked by: 41 | Blocks: 43, 44 | Can parallelize with: —
  References: Architecture Section 2.2.4 (business rules), Section 2.2.3 (invoice auto-status). Follow pattern from T14. Create: repositories, service, test.
  Acceptance: unit tests pass for: payment <= remaining balance (success), payment > remaining (ConflictError), partial payment → invoice PARTIALLY_PAID, full payment → invoice PAID + SO COMPLETED.
  QA happy: seed invoice total $100, pay $50 — assert invoice PARTIALLY_PAID, paidAmount=$50. Pay remaining $50 — assert invoice PAID, SO COMPLETED. Evidence: `.omo/evidence/task-42-crm-sales-architecture.txt`
  QA failure: try to pay $150 on $100 invoice with $0 paid — assert ConflictError "Payment exceeds remaining balance". Evidence: `.omo/evidence/task-42-fail-crm-sales-architecture.txt`
  Commit: Y | feat(payments): implement service with invoice reconciliation

- [ ] 43. Implement Payment API (Route Handlers and Server Actions)
  What: create Route Handlers: `GET/POST /api/payments`, `GET/PUT/DELETE /api/payments/[id]`, `POST /api/payments/[id]/transition`. Create Server Actions. Follow T15 pattern.
  Must NOT do: do NOT skip invoice/SO auto-status triggers.
  Wave: 11 | Blocked by: 42 | Blocks: 44 | Can parallelize with: —
  References: Architecture Section 6. Follow pattern from T15. Create: `src/app/api/payments/*.ts`, `src/features/payment/actions/payment-actions.ts`.
  Acceptance: endpoints work; creating payment triggers invoice + SO auto-status; 409 for overpayment.
  QA happy: `POST /api/payments` with valid amount — assert 200, invoice status updated. Evidence: `.omo/evidence/task-43-crm-sales-architecture.txt`
  QA failure: `POST /api/payments` exceeding balance — assert 409. Evidence: `.omo/evidence/task-43-fail-crm-sales-architecture.txt`
  Commit: Y | feat(payments): implement api route handlers and server actions

- [ ] 44. Build Payment UI pages
  What: create `src/app/(dashboard)/payments/` pages. Components: `payment-table.tsx`, `payment-form.tsx` (selects invoice, shows remaining balance, amount input capped at balance, payment method select, reference number, date), `payment-detail.tsx`. "Record Payment" button on invoice detail (if OPEN/PARTIALLY_PAID/OVERDUE).
  Must NOT do: do NOT allow amount input > remaining balance (client-side cap + server validation). Do NOT allow payments on PAID/VOIDED invoices.
  Wave: 11 | Blocked by: 43 | Blocks: 45 | Can parallelize with: —
  References: Architecture Section 7. Follow pattern from T16. Create: files in `src/app/(dashboard)/payments/` and `src/components/payments/`.
  Acceptance: list paginates/sorts/filters; form shows remaining balance and caps amount; recording payment updates invoice detail; "Record Payment" button only on unpaid invoices.
  QA happy: open payment form for $100 invoice with $50 paid — assert remaining balance $50, amount input max=50. Evidence: `.omo/evidence/task-44-crm-sales-architecture.txt`
  QA failure: try to open payment form for a PAID invoice — assert "Record Payment" button not visible. Evidence: `.omo/evidence/task-44-fail-crm-sales-architecture.txt`
  Commit: Y | feat(payments): build payment pages with balance validation

#### Phase 12: Dashboard (Wave 12)

- [ ] 45. Implement Dashboard KPI cards and data service
  What: create `src/features/dashboard/services/dashboard.service.ts` with `getKpis()`: total leads (all-time), open opportunities (count + total estimated value), pending sales orders (CONFIRMED/FULFILLING), overdue invoices (count + total amount). Create `GET /api/dashboard/kpis` Route Handler. Create `src/app/(dashboard)/dashboard/page.tsx` (replace placeholder) with KPI cards grid (4 cards: Leads, Opportunities, Pending Orders, Overdue Invoices). Each card: icon, label, big number, secondary metric. Use Lucide icons. Revalidate every 60s (or on each visit).
  Must NOT do: do NOT use client-side fetching for KPIs. Do NOT compute KPIs in the UI.
  Wave: 12 | Blocked by: 44, 12 | Blocks: — | Can parallelize with: 46, 47
  References: Architecture Section 8.1 (Server Components), Section 13.5 (server rendering). Create: `src/features/dashboard/services/dashboard.service.ts`, `src/app/api/dashboard/kpis/route.ts`, `src/app/(dashboard)/dashboard/page.tsx`, `src/components/dashboard/kpi-card.tsx`.
  Acceptance: dashboard page loads; 4 KPI cards display correct numbers; numbers match DB counts.
  QA happy: seed data, navigate to `/dashboard` — assert KPI cards show correct counts. Evidence: `.omo/evidence/task-45-crm-sales-architecture.txt`
  QA failure: empty DB — assert cards show 0 (not error). Evidence: `.omo/evidence/task-45-fail-crm-sales-architecture.txt`
  Commit: Y | feat(dashboard): implement kpi cards and data service

- [ ] 46. Implement Dashboard activity feed
  What: add `getActivityFeed()` to `dashboard.service.ts` — returns latest 20 AuditLog entries with user name, entity type, action, timestamp. Create `GET /api/dashboard/activity`. Create `src/components/dashboard/activity-feed.tsx` — timeline list showing "User X created Lead Y" with relative timestamp (e.g., "2 hours ago").
  Must NOT do: do NOT fetch more than 20 entries. Do NOT show audit logs for entities the user can't read (permission filter).
  Wave: 12 | Blocked by: 44, 12 | Blocks: — | Can parallelize with: 45, 47
  References: Architecture Section 2.3.4 (AuditLog). Create: service method, route handler, component.
  Acceptance: activity feed shows latest 20 changes; relative timestamps display correctly; clicking an entry navigates to the entity (if user has permission).
  QA happy: create some records, navigate to dashboard — assert activity feed shows recent changes. Evidence: `.omo/evidence/task-46-crm-sales-architecture.txt`
  QA failure: empty DB — assert "No recent activity" empty state. Evidence: `.omo/evidence/task-46-fail-crm-sales-architecture.txt`
  Commit: Y | feat(dashboard): implement activity feed

- [ ] 47. Implement Dashboard pipeline summary
  What: add `getPipelineSummary()` to `dashboard.service.ts` — returns opportunity counts and total estimated value grouped by stage. Create `GET /api/dashboard/pipeline`. Create `src/components/dashboard/pipeline-summary.tsx` — horizontal bar chart or funnel showing stages (PROSPECTING → ... → NEGOTIATION) with count and value per stage. Use a lightweight charting approach (CSS bars or Recharts if installed).
  Must NOT do: do NOT use a heavy charting library unless already installed (CSS bars are sufficient for initial build).
  Wave: 12 | Blocked by: 44, 12 | Blocks: — | Can parallelize with: 45, 46
  References: Architecture Section 2.1.2 (opportunity stages). Create: service method, route handler, component.
  Acceptance: pipeline summary shows 5 stages with count and value; bars proportional to value; CLOSED_WON/Lost excluded from pipeline.
  QA happy: seed opportunities in various stages, navigate to dashboard — assert pipeline shows correct counts per stage. Evidence: `.omo/evidence/task-47-crm-sales-architecture.txt`
  QA failure: no open opportunities — assert empty state "No open opportunities". Evidence: `.omo/evidence/task-47-fail-crm-sales-architecture.txt`
  Commit: Y | feat(dashboard): implement pipeline summary chart

#### Phase 13: Reporting — DEFERRED

> **Deferred per user decision.** Reporting will be added after the CRM+Sales foundation is reviewed by a senior engineer. The architecture design (Section 5, Phase 13 above) documents the full design for future implementation.

#### Phase 14: Deployment — DEFERRED

> **Deferred per user decision.** The project runs on localhost (`pnpm dev`) for now. Docker deployment will be added after senior review. The architecture design (Section 5, Phase 14 above) documents the full design for future implementation.

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit
- [ ] F2. Code quality review
- [ ] F3. Real manual QA
- [ ] F4. Scope fidelity

## Commit strategy

- **One commit per todo**: each todo ends with a Conventional Commit (`feat(leads): ...`, `chore(setup): ...`, etc.).
- **Commit message format**: `type(scope): description` — lowercase, imperative, no period.
- **Branch per phase**: `feat/phase-1-setup`, `feat/phase-2-auth`, `feat/phase-3-system`, `feat/phase-4-leads`, etc.
- **PR-based merge**: each phase branch → PR → review → merge to `main`. No direct commits to `main`.
- **Squash merge**: PRs are squash-merged to keep history clean (one commit per PR).
- **Migration commits**: Prisma schema changes get their own commit (`feat(prisma): add lead model`) separate from logic commits.
- **Evidence commits**: QA evidence files (`.omo/evidence/`) are committed alongside the todo they verify.

## Success criteria

The plan is complete when ALL of the following are true:

1. **All 47 todos completed**: every todo checkbox is checked, every acceptance criterion passes, every QA scenario (happy + failure) has evidence in `.omo/evidence/`.
2. **Full CRM workflow**: a Lead can be created → contacted → qualified → converted to Opportunity → advanced through stages → closed won → quoted → quotation accepted → customer created → converted to Sales Order. All state transitions enforced.
3. **Full Sales workflow**: a Sales Order can be created → confirmed → delivery note created (partial + full) → delivered → invoiced → payment recorded → completed. All auto-status transitions work correctly.
4. **RBAC enforced**: Sales Rep cannot access Users/Roles/Settings; Accountant cannot access Leads/Opportunities; Admin can access everything. Middleware + Server Action + UI all enforce permissions.
5. **Dashboard functional**: KPI cards show correct counts, activity feed shows recent changes, pipeline summary shows opportunities by stage.
6. **Localhost development**: `pnpm dev` starts the app on localhost:3000; `pnpm prisma db push` + `pnpm prisma db seed` set up the local MariaDB database; all pages load without errors.
7. **No technical debt**: no `any` types, no `eslint-disable` without justification, no TODO comments in shipped code, all error cases handled.
8. **Architecture document is the source of truth**: the 18-section Architecture Blueprint in this plan document accurately reflects the implemented system.
9. **Ready for senior review**: code is clean, well-structured, and documented enough for a senior engineer to review before deployment.
