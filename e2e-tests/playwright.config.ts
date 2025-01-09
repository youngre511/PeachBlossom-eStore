import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests", // Directory for your tests
    use: {
        baseURL: "http://localhost:3000", // Your frontend URL
        headless: true, // Run tests without opening a browser window
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { browserName: "chromium" },
        },
        {
            name: "firefox",
            use: { browserName: "firefox" },
        },
        {
            name: "webkit",
            use: { browserName: "webkit" },
        },
    ],
});
