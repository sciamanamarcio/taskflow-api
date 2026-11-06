import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`TaskFlow API running on http://localhost:${env.PORT}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
