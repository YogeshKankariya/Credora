import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../config/database.js";
import { sendSuccess, sendCreated, sendError, sendServerError } from "../utils/response.js";
import { cryptoService } from "../services/crypto.service.js";

// ─── Validation schemas ───────────────────────────────────────────────────────

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["CUSTOMER", "ISSUER", "VERIFIER"]),
});

const LoginSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  bankId: z.string().optional(),
  password: z.string(),
}).refine(data => data.email || data.bankId, {
  message: "Either email or bankId must be provided"
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signToken(userId: string, role: string, email: string): string {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET not configured");
  const expiresIn = (process.env["JWT_EXPIRES_IN"] ?? "7d") as string;
  return jwt.sign({ userId, role, email }, secret, { expiresIn } as jwt.SignOptions);
}

/** Extract a human-readable message from Zod validation errors */
function formatZodError(error: z.ZodError): string {
  if (error.issues && error.issues.length > 0) {
    return error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    }).join("; ");
  }
  return "Validation failed";
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validation failed", 400, formatZodError(parsed.error));
      return;
    }

    const { name, email, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      sendError(res, "Email already registered", 409);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Generate keys BEFORE the transaction so it doesn't block DB
    const keys = cryptoService.generateKeyPair();

    // ── Atomic transaction: User + Profile together ──────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash, role },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      if (role === "CUSTOMER") {
        const did = cryptoService.generateDID(keys.publicKey);
        await tx.customerProfile.create({
          data: {
            userId: user.id,
            did,
            publicKey: keys.publicKey,
            identityStatus: "CREATED",  // IdentityStatus: CREATED | VERIFIED | SUSPENDED
            kycStatus: "PENDING",       // KycStatus: PENDING | UNDER_REVIEW | VERIFIED | REJECTED
            keyStatus: "ACTIVE",        // KeyStatus: ACTIVE | ROTATED | REVOKED
          },
        });
      } else {
        // Banks (ISSUER / VERIFIER)
        const institutionCode = `BANK-${Date.now().toString(36).toUpperCase()}`;
        const did = cryptoService.generateInstitutionDID(institutionCode, keys.publicKey);
        await tx.institutionProfile.create({
          data: {
            userId: user.id,
            name,
            shortName: name.substring(0, 3).toUpperCase(),
            institutionCode,
            did,
            publicKey: keys.publicKey,
            role: role === "ISSUER" ? "ISSUER" : "VERIFIER",
            status: "ACTIVE",
            accreditedDate: new Date(),
          },
        });
      }

      return user;
    });

    const token = signToken(result.id, result.role, result.email);
    sendCreated(res, { user: result, token }, "Registration successful");
  } catch (err) {
    console.error("[auth.register]", err);
    sendServerError(res);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validation failed", 400, formatZodError(parsed.error));
      return;
    }

    const { name, email, bankId, password } = parsed.data;

    let user;
    if (bankId) {
      // Look up bank by institution code
      const bank = await prisma.institutionProfile.findUnique({
        where: { institutionCode: bankId },
        include: { user: true },
      });
      if (!bank || !bank.user) {
        sendError(res, "Invalid Bank ID or password", 401);
        return;
      }
      user = bank.user;
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      sendError(res, "Invalid credentials", 401);
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      sendError(res, "Invalid credentials", 401);
      return;
    }

    // If customer entered/updated their name during login, update the user record
    if (name && name.trim()) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    const token = signToken(user.id, user.role, user.email);
    sendSuccess(
      res,
      {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      "Login successful"
    );
  } catch (err) {
    console.error("[auth.login]", err);
    sendServerError(res);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // JWT is stateless — client should discard the token.
  sendSuccess(res, null, "Logged out successfully");
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, "Not authenticated", 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        customerProfile: true,
        institutionProfile: true,
      },
    });

    if (!user) {
      sendError(res, "User not found", 404);
      return;
    }

    sendSuccess(res, user);
  } catch (err) {
    console.error("[auth.getMe]", err);
    sendServerError(res);
  }
}
