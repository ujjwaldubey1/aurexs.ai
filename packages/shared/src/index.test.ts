import { describe, expect, it } from "vitest";
import { hasPermission } from "./index.js";

describe("hasPermission", () => {
  it("grants wildcard permissions to OWNER", () => {
    expect(hasPermission("OWNER", "ledger:write")).toBe(true);
  });

  it("denies unauthorized permissions to STAFF", () => {
    expect(hasPermission("STAFF", "ledger:write")).toBe(false);
  });
});
