import app from "./app.js";
import prisma from "./config/database.js";

const PORT = Number(process.env["PORT"] ?? 5000);

async function main() {
  // Verify database connection on startup
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (err) {
    console.warn("⚠️ Database connection warning (check DATABASE_URL in .env):", (err as Error).message);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env["NODE_ENV"] ?? "development"}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log("🔌 Database disconnected. Goodbye.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});