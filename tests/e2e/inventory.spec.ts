import { test, expect } from "@playwright/test";

test("inventory redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/inventory");
  await expect(page).toHaveURL(/\/login\?next=%2Finventory/);
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});
