import "dotenv/config";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { z } from "zod";
import { prisma } from "@jewellery-erp/db";
import { initSentry, captureApiError } from "./plugins/sentry.js";
import { getSupabaseAdminClient, getSupabasePublicClient } from "./lib/supabase.js";
import { attachAuthContext, requireRoles } from "./plugins/auth.js";
import { syncDevTenantAndRefreshSession } from "./lib/sync-tenant-metadata.js";

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    transport:
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            target: "pino-pretty",
            options: { colorize: true }
          }
  }
});

initSentry();

app.register(cors, { origin: true });
app.register(cookie);
app.register(swagger, {
  openapi: {
    info: {
      title: "Jewellery ERP API",
      version: "0.2.0"
    }
  }
});
app.register(swaggerUi, { routePrefix: "/docs" });

const otpVerifySchema = z.object({
  phone: z.string().min(8),
  otp: z.string().min(4)
});

app.get("/health", async () => {
  await prisma.$queryRaw`SELECT 1`;
  return { ok: true };
});

app.post("/auth/session", async (request, reply) => {
  const parseResult = otpVerifySchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.code(400).send({
      code: "VALIDATION_ERROR",
      message: "Invalid payload",
      issues: parseResult.error.issues
    });
  }

  const supabase = getSupabasePublicClient();
  if (!supabase) {
    return reply.code(500).send({ code: "AUTH_NOT_CONFIGURED", message: "Supabase auth not configured" });
  }

  const { phone, otp } = parseResult.data;
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: "sms"
  });
  if (error || !data.session) {
    return reply.code(401).send({ code: "OTP_FAILED", message: error?.message || "OTP failed" });
  }

  const synced = await syncDevTenantAndRefreshSession(data.session);
  if (!synced.ok) {
    return reply.code(500).send({ code: "METADATA_SYNC_FAILED", message: synced.message });
  }

  reply.setCookie("sb-access-token", synced.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: synced.expiresIn
  });
  return reply.code(200).send({ ok: true });
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

app.get(
  "/inventory/items",
  { preHandler: [attachAuthContext, requireRoles(["OWNER", "MANAGER", "STAFF"])] },
  async (request) => {
    // Tenant scope comes from JWT app_metadata.tenant_id, not query params.
    return prisma.item.findMany({
      where: { tenantId: request.auth?.tenantId },
      take: 50,
      orderBy: { createdAt: "desc" }
    });
  }
);

const port = Number(process.env.PORT || 4000);
app.setErrorHandler((error, _request, reply) => {
  captureApiError(error);
  reply.code(500).send({
    code: "INTERNAL_ERROR",
    message: "Unexpected server error"
  });
});

app
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`API running on ${port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
