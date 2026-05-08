import type { FastifyReply, FastifyRequest } from "fastify";
import { getSupabasePublicClient } from "../lib/supabase.js";
import type { UserRole } from "@jewellery-erp/shared";

export function resolveAuthClaims(appMetadata: Record<string, unknown>) {
  const tenantId = typeof appMetadata.tenant_id === "string" ? appMetadata.tenant_id : undefined;
  const role = typeof appMetadata.role === "string" ? (appMetadata.role as UserRole) : "STAFF";
  return { tenantId, role };
}

export async function attachAuthContext(request: FastifyRequest, reply: FastifyReply) {
  const publicClient = getSupabasePublicClient();
  if (!publicClient) {
    return reply.code(500).send({ code: "AUTH_NOT_CONFIGURED", message: "Auth is not configured" });
  }

  const bearerToken = request.headers.authorization?.replace("Bearer ", "");
  const cookieToken = request.cookies?.["sb-access-token"];
  const accessToken = bearerToken || cookieToken;

  if (!accessToken) {
    return reply.code(401).send({ code: "UNAUTHENTICATED", message: "Missing access token" });
  }

  const { data, error } = await publicClient.auth.getUser(accessToken);
  if (error || !data.user) {
    return reply.code(401).send({ code: "INVALID_TOKEN", message: "Invalid access token" });
  }

  const appMetadata = (data.user.app_metadata ?? {}) as Record<string, unknown>;
  const { tenantId, role } = resolveAuthClaims(appMetadata);

  if (!tenantId) {
    return reply.code(403).send({
      code: "TENANT_MISSING",
      message: "tenant_id missing in app_metadata"
    });
  }

  request.auth = {
    userId: data.user.id,
    tenantId,
    role
  };
}

export function requireRoles(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.auth) {
      return reply.code(401).send({ code: "UNAUTHENTICATED", message: "Auth context missing" });
    }
    if (!allowedRoles.includes(request.auth.role)) {
      return reply.code(403).send({ code: "FORBIDDEN", message: "Role not allowed" });
    }
  };
}
