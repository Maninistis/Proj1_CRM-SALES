# Draft: crm-sales-architecture

## Routing
- intent: clear
- review_required: false
- classify: Architecture (system design, 5+ modules, long-term impact)
- slug: crm-sales-architecture

## Owner-decisions (ASKED + RESOLVED)
1. Authentication solution -> Auth.js v5 / NextAuth (user confirmed)
   - Prisma adapter, JWT strategy for edge middleware, DB sessions option, RBAC via Role-Permission M2M
2. Deployment target -> Docker / self-hosted (user confirmed)
   - Node.js runtime (not Edge), standard Prisma connection pool, docker-compose for app + MariaDB

## Adopted defaults (best-practice, surfaced for veto at the gate)
- Package manager: pnpm
- Primary keys: cuid (string), uniform across all models
- Soft delete: `deletedAt` nullable timestamp + Prisma query extension to auto-filter
- Audit columns: `createdAt`, `updatedAt`, `deletedAt`, `createdById`, `updatedById` on every domain table
- Multi-tenancy posture: single-tenant NOW, schema-ready (optional `tenantId` on domain tables, nullable, defaulted null; full tenant isolation deferred)
- Naming: snake_case DB tables/columns via Prisma `@@map`/`@map`; camelCase in TS
- Folder structure: feature-based under `src/features/<domain>/` with co-located components/pages/api/services/repositories/schemas
- Layering: Route Handler / Server Action -> Service (business logic, Result type) -> Repository (Prisma data access) -> Zod schema (shared client+server)
- State management: Server Components default; Server Actions + revalidatePath for mutations; URL state for table filters/sort/pagination; no React Query initially
- Validation: Zod schemas shared between React Hook Form (client) and Server Actions / Route Handlers (server)
- Testing: Vitest (unit+integration), Playwright (E2E), MSW for API mocking; tests co-located `*.test.ts`
- Error handling: error.tsx per route segment; service layer returns Result<T> (never throws); sonner toasts for UI feedback
- Security: Auth.js middleware (authN + coarse authZ); fine-grained permission check in Server Actions; Prisma parameterized queries; rate limit via Redis (optional) or in-memory
- Performance: cursor-based pagination; Prisma select() field limiting; indexes on FKs + query fields; next/image; React Server Components for initial render
- Git: Conventional Commits; branch `feat/<domain>-<desc>`; PR-based
- UI: shadcn/ui + Tailwind; TanStack Table for data tables; Lucide icons; status badge component system
- ERP scalability: document migration paths for Inventory, Purchasing, Accounting, Warehouses, Multi-company, REST API, Mobile, Microservices

## Topology lock (components)
1. System foundation (auth, users, roles, permissions, audit, settings, notifications) - status: planned
2. CRM module (Lead, Opportunity, Quotation, Customer) - status: planned
3. Sales module (SalesOrder, DeliveryNote, SalesInvoice, Payment) - status: planned
4. Cross-cutting (dashboard, reporting, shared UI, shared infra) - status: planned

## User adjustments (approved gate)
1. cuid() PK + separate human-readable document numbers for business docs (LEAD-0001, QUO-0001, SO-0001, DN-0001, INV-0001, etc.)
2. deletedAt soft delete where appropriate, but NO automatic Prisma query extensions (manual filtering / scoped repository methods)
3. Remove tenantId from initial schema entirely; multi-tenancy documented as future enhancement only
4. createdAt + updatedAt on ALL domain tables; createdById only where it has business value (not blindly everywhere)
5. Conventional exception handling (try/catch + throw + error boundary) instead of Result<T> pattern
6. Defer Redis + advanced rate limiting to future enhancements; in-memory or none initially
7. Offset pagination initially; cursor pagination documented as scalability improvement
8. Target 40-60 implementation tasks (not 70-90)
9. Explicitly define lifecycle state machines + allowed transitions for every CRM and Sales entity
10. Include ERD, module dependency diagram, request flow diagram, folder structure diagram in the architecture document

## Gate
- status: approved
- pending action: write .omo/plans/crm-sales-architecture.md (scaffold + Metis + append todos + fill TL;DR)
- approach: 14-phase roadmap; ~40-60 todos; CRM before Sales; explicit state machines; 4 diagrams included
