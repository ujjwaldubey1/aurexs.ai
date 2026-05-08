# Stack Decisions

## Frontend: Next.js 14 + TypeScript
Chosen for fast server/client rendering, robust ecosystem, and maintainable typed UI code for long-lived ERP forms and tables.

## UI: Tailwind CSS + shadcn/ui
Provides production-ready primitives with full customization and no recurring license costs.

## Backend: Node.js + Fastify
Fastify offers high throughput, schema-first validation, and straightforward TypeScript integration for API-heavy systems.

## Data Access: Prisma ORM
Prisma gives strongly typed queries, predictable migrations, and a readable schema contract.

## Database: PostgreSQL 15+
ACID guarantees and transactional integrity are mandatory for inventory + ledger correctness.

## Auth
Phase 1 keeps auth integration shallow in code scaffolding. Production target remains Clerk OTP flows.

## Storage and Observability
- Cloudflare R2 (target for media documents and invoice files)
- Sentry initialization hooks included in API and web shells

## Delivery
- GitHub Actions for lint/typecheck/build
- Monorepo workspace for app and package consistency
