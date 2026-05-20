export type UserRole = "OWNER" | "MANAGER" | "STAFF" | "KARIGAR";

/** Matches Prisma seed tenant in packages/db/prisma/seed.ts */
export const DEV_SEED_TENANT_ID = "seed-tenant-core";

export interface RequestContext {
  userId: string;
  tenantId: string;
  role: UserRole;
}

export const rolePermissions: Record<UserRole, string[]> = {
  OWNER: ["*"],
  MANAGER: ["inventory:read", "inventory:write", "ledger:read", "customers:read"],
  STAFF: ["sales:write", "repairs:write", "inventory:read", "customers:read"],
  KARIGAR: ["jobs:read:self"]
};

export function hasPermission(role: UserRole, permission: string) {
  const permissions = rolePermissions[role];
  return permissions.includes("*") || permissions.includes(permission);
}
