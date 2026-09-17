import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/database.js";
import { credentialService } from "../services/credential.service.js";
import { sendSuccess, sendCreated, sendError, sendServerError } from "../utils/response.js";
import { param } from "../utils/params.js";

const IssueCredentialSchema = z.object({
  customerId: z.string().uuid(),
  credentialType: z.string().default("KYC Verification"),
  assuranceLevel: z.string().default("Tier-1 High Assurance"),
  expiresInDays: z.number().int().positive().default(365),
});

// POST /api/credentials
export async function issueCredential(req: Request, res: Response): Promise<void> {
  try {
    const issuerId = req.user?.userId;
    if (!issuerId) { sendError(res, "Not authenticated", 401); return; }

    const parsed = IssueCredentialSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "Validation failed", 400, parsed.error.message);
      return;
    }

    const { customerId, credentialType, assuranceLevel, expiresInDays } = parsed.data;

    // Verify issuer institution exists
    const institution = await prisma.institutionProfile.findUnique({ where: { userId: issuerId } });
    if (!institution) { sendError(res, "Issuer institution not found", 404); return; }

    // Verify customer exists and KYC is approved
    const customer = await prisma.customerProfile.findUnique({ where: { id: customerId } });
    if (!customer) { sendError(res, "Customer not found", 404); return; }
    if (customer.kycStatus !== "VERIFIED") {
      sendError(res, "Customer KYC must be verified before issuing credential", 422);
      return;
    }

    // Issue via service (handles hashing, signing, blockchain stub)
    const credential = await credentialService.issue({
      customer,
      institution,
      credentialType,
      assuranceLevel,
      expiresInDays,
    });

    sendCreated(res, credential, "Credential issued successfully");
  } catch (err) {
    console.error("[credential.issue]", err);
    sendServerError(res);
  }
}

// GET /api/credentials
export async function getCredentials(_req: Request, res: Response): Promise<void> {
  try {
    const credentials = await prisma.credential.findMany({
      include: {
        customer: { include: { user: { select: { name: true } } } },
        issuer: { select: { name: true, did: true } },
        blockchainRecord: true,
      },
      orderBy: { issuedAt: "desc" },
    });
    sendSuccess(res, credentials);
  } catch (err) {
    console.error("[credential.getAll]", err);
    sendServerError(res);
  }
}

// GET /api/credentials/:credentialId
export async function getCredentialById(req: Request, res: Response): Promise<void> {
  try {
    const credentialId = param(req, "credentialId");

    const credential = await prisma.credential.findUnique({
      where: { credentialId },
      include: {
        customer: { include: { user: { select: { name: true, email: true } } } },
        issuer: { select: { name: true, did: true, publicKey: true } },
        blockchainRecord: true,
        revocation: true,
        verificationLogs: { orderBy: { verifiedAt: "desc" }, take: 10 },
      },
    });

    if (!credential) { sendError(res, "Credential not found", 404); return; }
    sendSuccess(res, credential);
  } catch (err) {
    console.error("[credential.getById]", err);
    sendServerError(res);
  }
}

// GET /api/credentials/:credentialId/status
export async function getCredentialStatus(req: Request, res: Response): Promise<void> {
  try {
    const credentialId = param(req, "credentialId");

    const credential = await prisma.credential.findUnique({
      where: { credentialId },
      select: { credentialId: true, status: true, expiresAt: true, revocation: true },
    });

    if (!credential) { sendError(res, "Credential not found", 404); return; }
    sendSuccess(res, credential);
  } catch (err) {
    console.error("[credential.getStatus]", err);
    sendServerError(res);
  }
}
