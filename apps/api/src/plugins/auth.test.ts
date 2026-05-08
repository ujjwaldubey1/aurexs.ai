import { describe, expect, it } from "vitest";
import { resolveAuthClaims } from "./auth.js";

describe("resolveAuthClaims", () => {
  it("extracts tenant and role from app metadata", () => {
    const claims = resolveAuthClaims({ tenant_id: "t1", role: "OWNER" });
    expect(claims.tenantId).toBe("t1");
    expect(claims.role).toBe("OWNER");
  });

  it("falls back to STAFF when role is missing", () => {
    const claims = resolveAuthClaims({ tenant_id: "t1" });
    expect(claims.role).toBe("STAFF");
  });
});
