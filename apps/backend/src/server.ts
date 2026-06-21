import { app } from "./app.js";
import { env } from "./env.js";
import { prisma } from "./prisma/client.js";

const server = app.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT}`);
});

async function shutdown(signal: NodeJS.Signals) {
  console.log(`${signal} received. Shutting down API server.`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
