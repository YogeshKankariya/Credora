import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import prisma from "../config/database.js";
import { sendSuccess, sendCreated, sendError, sendServerError } from "../utils/response.js";
import { cryptoService } from "../services/crypto.service.js";

const googleClient = new OAuth2Client(
  process.env["GOOGLE_CLIENT_ID"],
  process.env["GOOGLE_CLIENT_SECRET"]
);

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
    sendServerError(res, err instanceof Error ? err.message : "Internal server error");
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
      // Look up bank by institution code OR by user email
      const bank = await prisma.institutionProfile.findFirst({
        where: {
          OR: [
            { institutionCode: { equals: bankId, mode: "insensitive" } },
            { user: { email: { equals: bankId, mode: "insensitive" } } },
          ],
        },
        include: { user: true },
      });
      if (bank?.user) {
        user = bank.user;
      } else {
        // Fallback: check if a user exists with this email directly
        const fallbackUser = await prisma.user.findFirst({
          where: { email: { equals: bankId, mode: "insensitive" } },
        });
        if (fallbackUser) {
          user = fallbackUser;
        } else {
          sendError(res, "Invalid Bank ID or password", 401);
          return;
        }
      }
    } else if (email) {
      user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });
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
    sendServerError(res, err instanceof Error ? err.message : "Internal server error");
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

interface GooglePayload {
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub?: string;
  email_verified?: boolean;
}

/**
 * POST /auth/verify-wallet
 * Re-authenticates with a Google token and verifies the resolved email
 * matches the currently-signed-in user's email from the database.
 * Used exclusively by the Identity Wallet unlock flow.
 *
 * Requires: Bearer JWT (authenticate middleware)
 * Body: { token, credential, demoUser? }  — same shape as /auth/google
 */
export async function verifyWalletAccess(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, "Not authenticated", 401);
      return;
    }

    // Look up the authenticated user's email from DB (source of truth)
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { email: true },
    });

    if (!dbUser) {
      sendError(res, "Authenticated user not found in database", 404);
      return;
    }

    const registeredEmail = dbUser.email.toLowerCase();

    const { token: idTokenInput, credential, demoUser } = req.body;
    const idToken = idTokenInput || credential;

    let resolvedEmail = "";

    // ── Demo / test mode ─────────────────────────────────────────────────────
    if (
      process.env["NODE_ENV"] !== "production" &&
      idToken &&
      typeof idToken === "string" &&
      idToken.startsWith("demo_google_token")
    ) {
      resolvedEmail = (demoUser?.email || "").toLowerCase();
      if (!resolvedEmail) {
        sendError(res, "Demo token missing email", 400);
        return;
      }
    } else {
      // ── Real Google token verification ────────────────────────────────────
      if (!idToken) {
        sendError(res, "Google ID token or credential is required", 400);
        return;
      }

      const clientId = process.env["GOOGLE_CLIENT_ID"];
      let payload: GooglePayload | undefined;

      if (clientId && !clientId.includes("your_google_client_id_here")) {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: clientId,
          });
          payload = ticket.getPayload() as GooglePayload | undefined;
        } catch (verifyErr) {
          console.warn("[auth.verifyWalletAccess] verifyIdToken fallback:", (verifyErr as Error).message);
        }
      }

      if (!payload) {
        try {
          const resp = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
          );
          if (resp.ok) {
            payload = (await resp.json()) as GooglePayload;
          } else {
            const errData = await resp.json().catch(() => ({}));
            sendError(
              res,
              "Google token verification failed",
              401,
              (errData as any).error_description || "Invalid Google ID token"
            );
            return;
          }
        } catch {
          sendError(res, "Failed to connect to Google verification service", 502);
          return;
        }
      }

      if (!payload?.email) {
        sendError(res, "Unable to extract email from Google profile", 400);
        return;
      }

      resolvedEmail = payload.email.toLowerCase();
    }

    // ── Email match check ─────────────────────────────────────────────────────
    if (resolvedEmail !== registeredEmail) {
      sendError(
        res,
        "Google account does not match your registered email",
        403,
        `Wallet requires authentication with ${registeredEmail}`
      );
      return;
    }

    sendSuccess(res, { verified: true, email: registeredEmail }, "Wallet access verified");
  } catch (err) {
    console.error("[auth.verifyWalletAccess]", err);
    sendServerError(res);
  }
}

export async function googleLogin(req: Request, res: Response): Promise<void> {
  try {
    const { token: idTokenInput, credential, demoUser } = req.body;
    const idToken = idTokenInput || credential;

    let email = "";
    let name = "";
    let picture = "";

    // 1. Support development demo simulation if Google credentials not yet configured
    if (
      process.env["NODE_ENV"] !== "production" &&
      idToken &&
      typeof idToken === "string" &&
      idToken.startsWith("demo_google_token")
    ) {
      email = (demoUser?.email || "demo.individual@gmail.com").toLowerCase();
      name = demoUser?.name || "Google Individual User";
      picture = demoUser?.picture || "";
    } else {
      if (!idToken) {
        sendError(res, "Google ID token or credential is required", 400);
        return;
      }

      const clientId = process.env["GOOGLE_CLIENT_ID"];
      let payload: GooglePayload | undefined;

      // Try official Google token verification if clientId is configured
      if (clientId && !clientId.includes("your_google_client_id_here")) {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: clientId,
          });
          payload = ticket.getPayload() as GooglePayload | undefined;
        } catch (verifyErr) {
          console.warn("[auth.googleLogin] verifyIdToken fallback to tokeninfo:", (verifyErr as Error).message);
        }
      }

      // If verifyIdToken didn't yield payload or clientId isn't configured yet, fallback to Google tokeninfo
      if (!payload) {
        try {
          const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
          if (resp.ok) {
            payload = (await resp.json()) as GooglePayload;
          } else {
            const errData = await resp.json().catch(() => ({}));
            sendError(
              res,
              "Google token verification failed",
              401,
              (errData as any).error_description || "Invalid Google ID token"
            );
            return;
          }
        } catch (netErr) {
          sendError(res, "Failed to connect to Google verification service", 502);
          return;
        }
      }

      if (!payload || !payload.email) {
        sendError(res, "Unable to extract email from Google profile", 400);
        return;
      }

      email = payload.email.toLowerCase();
      name = payload.name || payload.given_name || email.split("@")[0] || "Individual User";
      picture = payload.picture || "";
    }

    // 2. Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { customerProfile: true },
    });

    // 3. If new user, create User (role: CUSTOMER) and CustomerProfile (Individual section only)
    if (!user) {
      const randomPassword = crypto.randomUUID() + "-" + Date.now();
      const passwordHash = await bcrypt.hash(randomPassword, 12);
      const keys = cryptoService.generateKeyPair();

      const createdUser = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: "CUSTOMER",
          },
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        const did = cryptoService.generateDID(keys.publicKey);
        await tx.customerProfile.create({
          data: {
            userId: newUser.id,
            did,
            publicKey: keys.publicKey,
            identityStatus: "CREATED",
            kycStatus: "PENDING",
            keyStatus: "ACTIVE",
          },
        });

        return newUser;
      });

      user = await prisma.user.findUnique({
        where: { id: createdUser.id },
        include: { customerProfile: true },
      });
    } else {
      // If user exists, but doesn't have a CustomerProfile yet, ensure one is generated
      if (user.role === "CUSTOMER" && !user.customerProfile) {
        const keys = cryptoService.generateKeyPair();
        const did = cryptoService.generateDID(keys.publicKey);
        await prisma.customerProfile.create({
          data: {
            userId: user.id,
            did,
            publicKey: keys.publicKey,
            identityStatus: "CREATED",
            kycStatus: "PENDING",
            keyStatus: "ACTIVE",
          },
        });
      }

      // Update name if currently empty or generic
      if (name && (!user.name || user.name === "Customer")) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name },
          include: { customerProfile: true },
        });
      }
    }

    if (!user) {
      sendServerError(res, "Failed to authenticate or create user");
      return;
    }

    // 4. Generate system JWT token
    const jwtToken = signToken(user.id, user.role, user.email);

    sendSuccess(
      res,
      {
        token: jwtToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: picture || undefined,
        },
      },
      "Google login successful"
    );
  } catch (err) {
    console.error("[auth.googleLogin]", err);
    sendServerError(res);
  }
}

