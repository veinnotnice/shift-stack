import { defineConfig } from "@playwright/test"

// Its own port, away from an app's dev server (3000, 5173). The fixture app is built and served as in production.
const port = 4310

export default defineConfig({
  testDir: "tests",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    viewport: { width: 393, height: 852 },
    trace: "retain-on-failure"
  },
  webServer: {
    command: "pnpm build && pnpm start",
    url: `http://localhost:${port}`,
    env: { PORT: String(port) },
    reuseExistingServer: false,
    timeout: 120_000
  }
})
