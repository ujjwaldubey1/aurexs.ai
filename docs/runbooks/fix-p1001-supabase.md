# Fix: P1001 Can't reach database server (Supabase)

## Root cause in your case

`npm run db:check` fails because **`nrqbmudhrtgdikkxgjrd.supabase.co` does not exist in DNS** (the hostname does not resolve). That usually means:

- The project ref in `.env` was copied from an **example**, not your real project, or
- The Supabase project was **deleted** or never created.

Until the hostname resolves, **no tool** (Prisma, migrate, seed) can connect.

## Fix (5 minutes)

### 1. Open your real Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project (or **New project** → wait until it is ready)
3. In the browser address bar you should see something like:
   `https://supabase.com/dashboard/project/abcdefghijklmnop`
4. In **Project Settings → General**, note **Reference ID** (e.g. `abcdefghijklmnop`)

### 2. Verify in browser

Open: `https://<REFERENCE-ID>.supabase.co`

- If the page does not load → wrong ref or project not ready.

### 3. Copy connection strings

**Project Settings → Database** (or **Connect**):

- Copy **URI** (direct connection, host `db.<ref>.supabase.co`, port `5432`)
- If direct fails on your PC later, copy **Session pooler** URI (still port `5432`) instead

Add `?sslmode=require` at the end if it is missing.

### 4. Update these files (same values in each)

| File | Variables |
|------|-----------|
| `.env` | `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, keys |
| `packages/db/.env` | `DATABASE_URL`, `DIRECT_URL` |
| `apps/api/.env` | `DATABASE_URL`, `DIRECT_URL`, Supabase keys |
| `apps/web/.env.local` | `NEXT_PUBLIC_*`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_API_URL` |

Example shape (replace with **your** values from the dashboard):

```env
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:5432/postgres?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
```

Also copy **anon/publishable** and **service_role** keys from **Project Settings → API**.

### 5. Test and migrate

```powershell
npm run db:check
npm run db:migrate
npm run db:seed
```

`db:check` should print: `OK — database is reachable.`

## Do not run

- `npm run db:up` (Docker) — you chose Supabase-only
- `supabase/bootstrap.sql` on the same DB as Prisma — use Prisma migrations only
