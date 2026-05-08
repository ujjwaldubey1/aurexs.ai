import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      lines: 30,
      functions: 30,
      branches: 30,
      statements: 30
    }
  }
});
