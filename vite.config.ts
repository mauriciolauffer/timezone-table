import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      instances: [{ browser: "chromium" }],
      provider: playwright(),
      headless: true,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
  optimizeDeps: {
    include: [
      "@ui5/webcomponents-icons/dist/refresh.js",
      "@ui5/webcomponents/dist/Assets.js",
      "@ui5/webcomponents-fiori/dist/Assets.js",
      "@ui5/webcomponents/dist/Slider.js",
      "@ui5/webcomponents/dist/ComboBox.js",
      "@ui5/webcomponents/dist/Table.js",
    ],
  },
});
