import "fastify";
import type { UserRole } from "@jewellery-erp/shared";

declare module "fastify" {
  interface FastifyRequest {
    auth?: {
      userId: string;
      tenantId: string;
      role: UserRole;
    };
  }
}
