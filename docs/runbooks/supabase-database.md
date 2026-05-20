# Database: Supabase Postgres (no Docker)

> **P1001 / host not found?** See [fix-p1001-supabase.md](./fix-p1001-supabase.md) — usually the project ref in `.env` is wrong or the project does not exist.

Use **one** Supabase project for:

- **Auth** — Phone OTP (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`)
- **App data** — Prisma migrations + seed (`DATABASE_URL`, `DIRECT_URL`)

Do **not** run `supabase/bootstrap.sql` on the same database if you use Prisma migrations. That SQL targets Supabase-native UUID tables and RLS; Prisma owns the schema via `packages/db/prisma/migrations`. Running both causes duplicate/conflicting tables.

## 1. Connection strings

In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Connect** / **Database**:

1. Copy the **URI** for the **direct** connection (`db.<project-ref>.supabase.co`, port **5432**).
2. Append `?sslmode=require` if it is not already present.
3. Set the **same** value in all three files:
   - `.env`
   - `packages/db/.env` (required for `npm run db:migrate`)
   - `apps/api/.env`

Also set `DIRECT_URL` to the same URI (Prisma uses it for migrations).

Example shape:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

If direct `5432` fails on your network (common on Windows), use the **Session pooler** URI on port **5432** from the dashboard and set both `DATABASE_URL` and `DIRECT_URL` to that value.

## 2. Project must be active

- Unpause the project if it is paused (free tier).
- Reset the database password in Dashboard if login fails.

## 3. Apply schema and seed

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

`db:migrate` runs `prisma migrate dev` and applies `packages/db/prisma/migrations` to Supabase.

## 4. Auth for the vertical slice

- Add `SUPABASE_SERVICE_ROLE_KEY` to `apps/web/.env.local` and `apps/api/.env`.
- Enable **Phone** auth in Supabase.
- After login, `app_metadata.tenant_id` is set to `seed-tenant-core` to match the Prisma seed tenant.

## 5. Run the app

```bash
npm run dev:api
npm run dev:web
```

No `npm run db:up` (Docker) is required.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `P1001` Can't reach `db.*.supabase.co` | Open `https://<project-ref>.supabase.co` in a browser. If it does not load, the project ref is wrong or the project was deleted/paused — create or restore the project and copy a **new** connection string. |
| DNS / host not found | Re-copy the host from **Connect** in the dashboard (do not type `db.<ref>.supabase.co` by hand). |
| `P1001` on Windows with direct host | Use the **Session pooler** URI (port 5432) from the dashboard; set both `DATABASE_URL` and `DIRECT_URL` to that value. |
| Test connectivity | `npm run db:check` |
| `P1001` Can't reach `localhost:5432` | `packages/db/.env` still points at Docker — switch to Supabase URI. |
| Migrate asks to reset DB | You may have run `bootstrap.sql` earlier; use a fresh Supabase DB or resolve drift manually. |
| `TENANT_MISSING` on inventory | Set `SUPABASE_SERVICE_ROLE_KEY` and log in again. |
