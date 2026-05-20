# Jewellery ERP (Phase 1 Foundation)

Focused ERP for jewellery stores covering inventory, billing, karigar workflow, purchase management, customer records, and basic ledger operations.

## In Scope
- Inventory management with item lifecycle tracking
- Karigar job assignment and metal issue/return tracking
- Sales and purchase transaction recording
- Basic ledger (double-entry) and day book reporting
- Customer records and repair management
- Live gold rates and stock reports

## Out of Scope (Phase 1)
- Gold loans (girvi), interest calculations, advance schemes
- Multi-branch operations
- E-commerce integration
- WhatsApp chatbot and AI document extraction

## Architecture
- `apps/web`: Next.js 14 + TypeScript UI shell
- `apps/api`: Fastify + TypeScript API shell
- `packages/db`: Prisma schema, migrations, and seed data
- `supabase`: SQL bootstrap for Supabase Postgres + RLS policies
- `docs`: product scope, domain vocabulary, architecture decisions, API contract, and wireframe specs

## Prerequisites
- Node.js 20+
- [Supabase](https://supabase.com) project (Postgres + Auth). Docker is optional.

## Setup
1. Install dependencies: `npm install`
2. Copy env templates:
   - `copy .env.example .env`
   - `copy packages\db\.env.example packages\db\.env`
   - `copy apps\api\.env.example apps\api\.env`
   - `copy apps\web\.env.example apps\web\.env.local`
3. Set **Supabase database** URIs (`DATABASE_URL` + `DIRECT_URL`) in `.env`, `packages/db/.env`, and `apps/api/.env` from Dashboard → Database → connection string (see [docs/runbooks/supabase-database.md](docs/runbooks/supabase-database.md)).
4. `npm run db:generate` → `npm run db:migrate` → `npm run db:seed`
5. Start: `npm run dev:api` and `npm run dev:web`

## Supabase (Auth + Postgres)
- **Prisma** owns the app schema via migrations — do not run `supabase/bootstrap.sql` on the same DB unless you intend a separate RLS-only setup.
- Enable Phone auth; set `SUPABASE_SERVICE_ROLE_KEY` for login tenant metadata.
- OTP flow: web `/login` or API `POST /auth/session`.
- Optional local Postgres: `npm run db:up` (Docker) and use localhost `DATABASE_URL` in env files instead.

## Phase 2 Foundation Additions
- Turborepo orchestration via `turbo.json`
- Supabase OTP auth + tenant/role context middleware
- Swagger docs endpoint: `/docs`
- Structured API logging via Pino
- Vitest and Playwright baseline tests
- Prisma migration workflow docs: `docs/architecture/migrations.md`

## Vertical Slice (Login → Inventory)

See [docs/runbooks/vertical-slice.md](docs/runbooks/vertical-slice.md) and [docs/runbooks/supabase-database.md](docs/runbooks/supabase-database.md) (Supabase Postgres, no Docker).

## Development Commands
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Phase 1 Deliverables Mapping
- Tech stack and architecture decisions: `docs/architecture/stack-decisions.md`
- Domain state machine rules: `docs/architecture/state-machine.md`
- Complete Prisma schema: `packages/db/prisma/schema.prisma`
- API contract: `docs/api/openapi.yaml`
- Wireframes/spec for 8 screens: `docs/wireframes/screens.md`
