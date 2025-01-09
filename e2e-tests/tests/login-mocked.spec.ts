import { test, expect } from "@playwright/test";
import jwt from "jsonwebtoken";

test.describe("Login Workflow", () => {
    test("should allow the user to log in with mocked backend", async ({
        page,
    }) => {
        const mockAccessToken = jwt.sign(
            {
                username: "cottonj@gmail.com",
                role: "customer",
                customer_id: 123,
                cart_id: 123,
                firstName: "John",
                lastName: "Cotton",
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                defaultPassword: false,
            },
            "test secret"
        );
        await page.route("**/auth/login", (route) => {
            // Simulate a successful login response
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    accessToken: mockAccessToken,
                    newCartId: 123,
                }),
            });
        });

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
        const signInButton = page.locator(".login-btn"); // Adjust if the button's type is not "submit"
        await signInButton.click();

        // Step 6: Verify the expected behavior

        const accountManagement = page.locator(".account-management"); // Replace with your actual selector
        await expect(accountManagement).toBeVisible();
    });
});
