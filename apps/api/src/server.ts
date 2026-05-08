import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "@jewellery-erp/db";
import { initSentry } from "./plugins/sentry.js";
import { getSupabaseAdminClient } from "./lib/supabase.js";

const app = Fastify({ logger: true });

initSentry();

app.register(cors, { origin: true });

app.get("/health", async () => {
  await prisma.$queryRaw`SELECT 1`;
  return { ok: true };
});

app.get("/health/supabase", async (_request, reply) => {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return reply.code(200).send({
      ok: false,
      configured: false,
      message:
        "Supabase admin client is not configured. Add SUPABASE_SERVICE_ROLE_KEY."
    });
  }

  const { error } = await supabase.from("tenants").select("id").limit(1);
  if (error) {
    return reply.code(500).send({
      ok: false,
      configured: true,
      error: error.message
    });
  }

  return reply.code(200).send({ ok: true, configured: true });
});

app.get("/inventory/items", async () => {
  return prisma.item.findMany({ take: 50, orderBy: { createdAt: "desc" } });
});

const port = Number(process.env.PORT || 4000);
app
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`API running on ${port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
