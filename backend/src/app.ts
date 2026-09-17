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

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env["CLIENT_URL"] ?? "http://localhost:5173",
    credentials: true,
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "hack2ignite-backend",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/issuer", issuerRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/credentials", credentialRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/revocations", revocationRoutes);
app.use("/api/institutions", institutionRoutes);

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
