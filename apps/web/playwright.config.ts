import { defineConfig, devices } from '@playwright/test'
import { e2eEnv } from './e2e/env'

export default defineConfig({
  globalSetup: './e2e/globalSetup.ts',
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: e2eEnv.CI,
  retries: e2eEnv.CI ? 2 : 0,
  workers: e2eEnv.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: e2eEnv.BASE_URL,
    trace: 'on-first-retry',
    video: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: e2eEnv.BASE_URL,
    reuseExistingServer: !e2eEnv.CI,
  },
})
