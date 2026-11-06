import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false, // testes compartilham o mesmo banco
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "test-secret-with-at-least-16-chars",
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://taskflow:taskflow@localhost:5432/taskflow_test?schema=public",
    },
  },
});
