import { defineConfig, devices } from "@playwright/test";

const chromiumViewport = (width: number, height: number) => ({
  ...devices["Desktop Chrome"],
  viewport: { width, height },
});

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm start --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "wide-1920x1080",
      use: chromiumViewport(1920, 1080),
    },
    {
      name: "desktop-1440x900",
      use: chromiumViewport(1440, 900),
    },
    {
      name: "desktop-1366x768",
      use: chromiumViewport(1366, 768),
    },
    {
      name: "desktop-1280x720",
      use: chromiumViewport(1280, 720),
    },
    {
      name: "tablet-1024x768",
      use: chromiumViewport(1024, 768),
    },
    {
      name: "tablet-768x1024",
      use: chromiumViewport(768, 1024),
    },
    {
      name: "mobile-390x844",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
