import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// Routes
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import issuerRoutes from "./routes/issuer.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import credentialRoutes from "./routes/credential.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import revocationRoutes from "./routes/revocation.routes.js";
import institutionRoutes from "./routes/institution.routes.js";
import prisma from "./config/database.js";

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env["CLIENT_URL"],
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any vercel.app subdomain
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
const healthHandler = async (_req: Request, res: Response) => {
  let dbStatus = "unknown";
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err) {
    dbStatus = "disconnected";
    dbError = err instanceof Error ? err.message : String(err);
  }

  res.json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    database: { status: dbStatus, error: dbError },
    service: "hack2ignite-backend",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/issuer", issuerRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/credentials", credentialRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/revocations", revocationRoutes);
app.use("/api/institutions", institutionRoutes);

// Fallback aliases without /api prefix
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/issuer", issuerRoutes);
app.use("/kyc", kycRoutes);
app.use("/credentials", credentialRoutes);
app.use("/verification", verificationRoutes);
app.use("/revocations", revocationRoutes);
app.use("/institutions", institutionRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[unhandled error]", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
