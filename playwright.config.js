// @ts-check
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  webServer: {
    command: "npx --yes serve . -l 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI
  },
  use: {
    baseURL: "http://localhost:4173"
  }
});
