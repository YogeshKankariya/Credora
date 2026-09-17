import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/database.js";
import { verificationService } from "../services/verification.service.js";
import { sendSuccess, sendError, sendServerError } from "../utils/response.js";
import { param } from "../utils/params.js";

const VerifySchema = z.object({
  credentialId: z.string(),
  purpose: z.string().min(3),
});

// POST /api/verification/verify
export async function verifyCredential(req: Request, res: Response): Promise<void> {
  try {
    const verifierId = req.user?.userId;
    if (!verifierId) { sendError(res, "Not authenticated", 401); return; }

    const parsed = VerifySchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validation failed", 400, parsed.error.message);
      return;
    }

    const { credentialId, purpose } = parsed.data;

    // Perform all six verification checks via service
    const result = await verificationService.verify({ credentialId, purpose, verifierId });

    sendSuccess(res, result, result.overall === "PASS" ? "Verification passed" : "Verification failed");
  } catch (err) {
    console.error("[verification.verify]", err);
    sendServerError(res);
  }
}

// GET /api/verification/history
export async function getVerificationHistory(req: Request, res: Response): Promise<void> {
  try {
    const verifierId = req.user?.userId;
    if (!verifierId) { sendError(res, "Not authenticated", 401); return; }

    const logs = await prisma.verificationLog.findMany({
      where: { verifierId },
      include: {
        credential: { select: { credentialId: true, credentialType: true } },
        verifier: { select: { name: true } },
      },
      orderBy: { verifiedAt: "desc" },
      take: 50,
    });
    sendSuccess(res, logs);
  } catch (err) {
    console.error("[verification.getHistory]", err);
    sendServerError(res);
  }
}

// GET /api/verification/:id
export async function getVerificationById(req: Request, res: Response): Promise<void> {
  try {
    const verifierId = req.user?.userId;
    if (!verifierId) { sendError(res, "Not authenticated", 401); return; }

    const id = param(req, "id");
    const log = await prisma.verificationLog.findUnique({
      where: { id },
      include: {
        credential: {
          include: {
            customer: { include: { user: { select: { name: true } } } },
            issuer: { select: { name: true, did: true } },
          },
        },
        verifier: { select: { name: true } },
      },
    });

    if (!log || log.verifierId !== verifierId) { sendError(res, "Verification record not found", 404); return; }
    sendSuccess(res, log);
  } catch (err) {
    console.error("[verification.getById]", err);
    sendServerError(res);
  }
}

// GET /api/institutions/trusted
export async function getTrustedIssuers(_req: Request, res: Response): Promise<void> {
  try {
    const issuers = await prisma.institutionProfile.findMany({
      where: { role: { in: ["ISSUER", "BOTH"] }, status: "ACTIVE" },
      select: { id: true, name: true, shortName: true, did: true, publicKey: true, accreditedDate: true },
    });
    sendSuccess(res, issuers);
  } catch (err) {
    console.error("[verification.getTrustedIssuers]", err);
    sendServerError(res);
  }
}
