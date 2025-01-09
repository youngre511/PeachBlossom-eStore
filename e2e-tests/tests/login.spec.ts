import { test, expect } from "@playwright/test";

test.describe("Login Workflow", () => {
    test("should allow the user to log in", async ({ page }) => {
        // Step 1: Navigate to the site
        await page.goto("localhost:3000");

        // Step 2: Open the account panel by clicking the account icon
        const accountIcon = page.locator("#account");
        await accountIcon.click();

        // Step 3: Wait for the login panel to appear
        const loginForm = page.locator(".login-form");
        await expect(loginForm).toBeVisible();

        // Step 4: Fill in email and password
        await page.fill("#email", "cottonj@gmail.com");
        await page.fill("#password", "psalmsinging");

        // Step 5: Click the "Sign In" button
        const signInButton = page.locator(".login-btn");
        await signInButton.click();

        // Step 6: Verify the expected behavior

        const accountManagement = page.locator(".account-management");
        await expect(accountManagement).toBeVisible();
    });
});
