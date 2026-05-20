# Vertical Slice Runbook: Login → Inventory

End-to-end dev flow using **Supabase Postgres** (Prisma data) and **Supabase Auth** (OTP).

> **Database setup:** [supabase-database.md](./supabase-database.md) (no Docker required).

## Prerequisites

- Node.js 20+
- Supabase project (active, not paused)
- Phone auth enabled

## Environment

```bash
copy .env.example .env
copy packages\db\.env.example packages\db\.env
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env.local
```

Fill **database** URIs from Supabase Dashboard (direct or session pooler) in `.env`, `packages/db/.env`, and `apps/api/.env`. Set `DIRECT_URL` to the same URI.

| Variable | Where | Purpose |
|----------|-------|---------|
| `DATABASE_URL` / `DIRECT_URL` | `.env`, `packages/db/.env`, `apps/api/.env` | Supabase Postgres for Prisma |
| `NEXT_PUBLIC_SUPABASE_URL` | web + api | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | web + api | OTP |
| `SUPABASE_SERVICE_ROLE_KEY` | web `.env.local`, `apps/api/.env` | `tenant_id` in `app_metadata` on login |
| `NEXT_PUBLIC_API_URL` | web | `http://localhost:4000` |

## Database (Supabase)

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Do **not** use `npm run db:up` unless you intentionally run local Docker.

## Run services

```bash
npm run dev:api
npm run dev:web
```

## Smoke checks

| Step | Expected |
|------|----------|
| `GET http://localhost:4000/health` | `{ "ok": true }` |
| Login → verify OTP | Redirect to `/inventory` |
| `/inventory` | ~50 seeded items |
| `/inventory` (logged out) | Redirect to `/login?next=/inventory` |

## Troubleshooting

See [supabase-database.md](./supabase-database.md) for `P1001`, migrate, and pooler issues.

- **`TENANT_MISSING`:** Add `SUPABASE_SERVICE_ROLE_KEY`, sign in again.
- **Empty inventory:** Run `npm run db:seed`; tenant id must be `seed-tenant-core` in JWT metadata.
