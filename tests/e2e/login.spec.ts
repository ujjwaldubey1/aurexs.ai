import { test, expect } from "@playwright/test";

test("login page renders otp controls", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send OTP" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify OTP" })).toBeVisible();
});
