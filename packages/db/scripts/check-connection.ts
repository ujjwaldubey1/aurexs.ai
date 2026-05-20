import "dotenv/config";
import dns from "node:dns/promises";
import { PrismaClient } from "@prisma/client";

function hostFromDatabaseUrl(url: string): string | null {
  try {
    const parsed = new URL(url.replace(/^postgresql:/, "http:"));
    return parsed.hostname || null;
  } catch {
    return null;
  }
}

function projectRefFromSupabaseUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const ref = parsed.hostname.split(".")[0];
    return ref || null;
  } catch {
    return null;
  }
}

async function assertHostResolves(host: string) {
  try {
    await dns.lookup(host);
  } catch {
    console.error(`
FAILED — DNS cannot resolve "${host}".

This is not a Prisma or password problem. The Supabase project URL in your .env files
does not exist on the internet (wrong project ref, deleted project, or typo).

Fix:
  1. Open https://supabase.com/dashboard and open your project (or create one).
  2. Confirm the browser URL is https://<YOUR-PROJECT-REF>.supabase.co
  3. Go to Connect → Database → copy the *URI* connection string.
  4. Paste it into:
       - .env
       - packages/db/.env
       - apps/api/.env
     Set both DATABASE_URL and DIRECT_URL to that URI (add ?sslmode=require if missing).
  5. Set NEXT_PUBLIC_SUPABASE_URL to https://<YOUR-PROJECT-REF>.supabase.co
  6. Run: npm run db:check

Do not use placeholder refs from .env.example (e.g. nrqbmudhrtgdikkxgjrd) unless that is your real project.
`);
    process.exit(1);
  }
}

const prisma = new PrismaClient();

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  if (!databaseUrl) {
    console.error("FAILED — DATABASE_URL is missing in packages/db/.env");
    process.exit(1);
  }

  const dbHost = hostFromDatabaseUrl(databaseUrl);
  if (!dbHost) {
    console.error("FAILED — DATABASE_URL is not a valid PostgreSQL URL");
    process.exit(1);
  }

  if (supabaseUrl) {
    const ref = projectRefFromSupabaseUrl(supabaseUrl);
    const dbRef = dbHost.replace(/^db\./, "").replace(/\.supabase\.co$/, "");
    if (ref && dbRef && ref !== dbRef) {
      console.warn(
        `Warning: NEXT_PUBLIC_SUPABASE_URL ref "${ref}" does not match database host ref "${dbRef}".`
      );
    }
    await assertHostResolves(new URL(supabaseUrl).hostname);
  }

  await assertHostResolves(dbHost);

  console.log(`Checking database at ${dbHost}:5432 ...`);
  await prisma.$queryRaw`SELECT 1`;
  console.log("OK — database is reachable.");
}

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Can't reach database server")) {
      console.error(`
FAILED — TCP connection to Postgres failed (host resolves but port 5432 is blocked or DB is down).

Try:
  - Unpause the project in Supabase Dashboard
  - Reset database password and update DATABASE_URL / DIRECT_URL
  - Use the *Session pooler* URI from Connect (port 5432) for both DATABASE_URL and DIRECT_URL
  - Confirm password has no unescaped special characters (or URL-encode them)
`);
    } else {
      console.error("FAILED —", message);
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
