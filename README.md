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
- PostgreSQL 15+

## Setup
1. Install dependencies:
   - `npm install`
2. Copy environment templates:
   - `copy .env.example .env`
   - `copy apps\\api\\.env.example apps\\api\\.env`
   - `copy apps\\web\\.env.example apps\\web\\.env.local`
3. Configure `DATABASE_URL` in `.env` (and `apps/api/.env` if needed).
4. Generate Prisma client:
   - `npm run db:generate`
5. Run migrations:
   - `npm run db:migrate`
6. Seed initial data:
   - `npm run db:seed`
7. Start services:
   - API: `npm run dev:api`
   - Web: `npm run dev:web`

## Supabase Setup
1. Copy Supabase env values into `.env`, `apps/web/.env.local`, and `apps/api/.env`.
2. Run `supabase/bootstrap.sql` in Supabase SQL Editor.
3. Hit `GET /health/supabase` from API to verify server-side connectivity.

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
