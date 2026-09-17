import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/database.js";
import { blockchainService } from "../services/blockchain.service.js";
import { sendSuccess, sendError, sendServerError } from "../utils/response.js";
import { param } from "../utils/params.js";

const RevokeSchema = z.object({
  reason: z.string().min(5),
});

// POST /api/credentials/:credentialId/revoke
export async function revokeCredential(req: Request, res: Response): Promise<void> {
  try {
    const issuerId = req.user?.userId;
    if (!issuerId) { sendError(res, "Not authenticated", 401); return; }

    const credentialId = param(req, "credentialId");
    const parsed = RevokeSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, "A reason is required to revoke a credential", 400);
      return;
    }

    const { reason } = parsed.data;

    // Find credential
    const credential = await prisma.credential.findUnique({
      where: { credentialId },
      include: { issuer: true },
    });

    if (!credential) { sendError(res, "Credential not found", 404); return; }
    if (credential.status === "REVOKED") {
      sendError(res, "Credential is already revoked", 400);
      return;
    }

    // Verify the revoking issuer owns this credential
    const institution = await prisma.institutionProfile.findUnique({ where: { userId: issuerId } });
    if (!institution || institution.id !== credential.issuerId) {
      sendError(res, "You can only revoke credentials you issued", 403);
      return;
    }

    // The contract is the final authorization boundary. Only update local state
    // after its confirmed transaction succeeds.
    const blockchainResult = await blockchainService.revokeCredentialOnChain(
      credentialId
    );

    // Revoke in transaction: update credential status + create revocation record
    const [updatedCredential, revocation] = await prisma.$transaction([
      prisma.credential.update({
        where: { credentialId },
        data: { status: "REVOKED" },
      }),
      prisma.revocation.create({
        data: {
          credentialId: credential.id,
          revokedById: issuerId,
          reason,
          blockchainTxHash: blockchainResult.transactionHash,
        },
      }),
    ]);

    sendSuccess(res, { credential: updatedCredential, revocation }, "Credential revoked successfully");
  } catch (err) {
    console.error("[revocation.revoke]", err);
    sendServerError(res);
  }
}

// GET /api/revocations
export async function getRevocations(req: Request, res: Response): Promise<void> {
  try {
    const issuerId = req.user?.userId;
    if (!issuerId) { sendError(res, "Not authenticated", 401); return; }

    const institution = await prisma.institutionProfile.findUnique({ where: { userId: issuerId } });
    if (!institution) { sendError(res, "Institution not found", 404); return; }

    const revocations = await prisma.revocation.findMany({
      where: { credential: { issuerId: institution.id } },
      include: {
        credential: {
          select: {
            credentialId: true, credentialType: true,
            customer: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { revokedAt: "desc" },
    });

    sendSuccess(res, revocations);
  } catch (err) {
    console.error("[revocation.getAll]", err);
    sendServerError(res);
  }
}
