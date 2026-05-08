# Supabase Integration Guide

This project now supports Supabase as the PostgreSQL backend plus Data API/Auth integration.

## What Was Added
- Frontend Supabase client: `apps/web/lib/supabase.ts`
- Backend admin Supabase client: `apps/api/src/lib/supabase.ts`
- Supabase health endpoint: `GET /health/supabase`
- Auth session endpoint: `POST /auth/session`
- Fastify middleware for JWT + tenant + role context
- Complete SQL bootstrap for ERP tables and policies: `supabase/bootstrap.sql`

## Environment Variables
Use these in `.env`, `apps/web/.env.local`, and `apps/api/.env` as needed:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose to browser)
- `DATABASE_URL` (Supabase Postgres connection string if Prisma is used against Supabase DB)

## Apply Database Schema in Supabase
1. Open Supabase SQL Editor.
2. Paste and run `supabase/bootstrap.sql`.
3. Confirm tables exist in Table Editor.

## Verify Data Flow Readiness
Run these in SQL Editor after bootstrap:

```sql
select to_regclass('public.items') as items_table;
select to_regclass('public.transactions') as transactions_table;
select count(*) from pg_policies where schemaname = 'public';
```

If the results are non-null and policies exist, schema + RLS are loaded.

## Security Notes
- RLS is enabled on all ERP tables.
- Policies use `auth.jwt() -> app_metadata -> tenant_id`.
- No authorization logic uses `user_metadata`.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only.
