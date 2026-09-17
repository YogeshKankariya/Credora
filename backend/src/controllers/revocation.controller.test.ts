import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import prisma from "../config/database.js";
import { blockchainService } from "../services/blockchain.service.js";
import { revokeCredential } from "./revocation.controller.js";

vi.mock("../config/database.js", () => ({
  default: {
    credential: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    institutionProfile: {
      findUnique: vi.fn(),
    },
    revocation: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("../services/blockchain.service.js", () => ({
  blockchainService: {
    revokeCredentialOnChain: vi.fn(),
  },
}));

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

function createMockRequest(
  userId?: string,
  params: Record<string, string> = {},
  body: Record<string, unknown> = {}
): Request {
  return {
    user: userId
      ? { userId, role: "ISSUER", email: "issuer@test.com" }
      : undefined,
    params,
    body,
  } as unknown as Request;
}

describe("Revocation Controller - revokeCredential", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the request is unauthenticated", async () => {
    const req = createMockRequest(undefined, { credentialId: "KYC-2026-0001" }, { reason: "Customer requested" });
    const res = createMockResponse();

    await revokeCredential(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Not authenticated",
      })
    );
    expect(prisma.credential.findUnique).not.toHaveBeenCalled();
    expect(blockchainService.revokeCredentialOnChain).not.toHaveBeenCalled();
  });

  it("returns 400 when the revocation reason is missing or invalid", async () => {
    const req = createMockRequest("issuer-user-1", { credentialId: "KYC-2026-0001" }, { reason: "bad" }); // less than 5 chars
    const res = createMockResponse();

    await revokeCredential(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "A reason is required to revoke a credential",
      })
    );
    expect(prisma.credential.findUnique).not.toHaveBeenCalled();
    expect(blockchainService.revokeCredentialOnChain).not.toHaveBeenCalled();
  });

  it("returns 404 when the credential is not found", async () => {
    const req = createMockRequest("issuer-user-1", { credentialId: "KYC-2026-NONEXISTENT" }, { reason: "Suspected fraudulent activity" });
    const res = createMockResponse();

    vi.mocked(prisma.credential.findUnique).mockResolvedValueOnce(null);

    await revokeCredential(req, res);

    expect(prisma.credential.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { credentialId: "KYC-2026-NONEXISTENT" },
        include: { issuer: true },
      })
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Credential not found",
      })
    );
    expect(blockchainService.revokeCredentialOnChain).not.toHaveBeenCalled();
  });

  it("returns 400 when the credential is already revoked", async () => {
    const req = createMockRequest("issuer-user-1", { credentialId: "KYC-2026-0001" }, { reason: "Duplicate revocation request" });
    const res = createMockResponse();

    vi.mocked(prisma.credential.findUnique).mockResolvedValueOnce({
      id: "db-cred-1",
      credentialId: "KYC-2026-0001",
      status: "REVOKED",
      issuerId: "inst-1",
    } as never);

    await revokeCredential(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Credential is already revoked",
      })
    );
    expect(blockchainService.revokeCredentialOnChain).not.toHaveBeenCalled();
  });

  it("returns 403 when the authenticated user belongs to another institution", async () => {
    const req = createMockRequest("issuer-user-1", { credentialId: "KYC-2026-0001" }, { reason: "Unauthorized attempt" });
    const res = createMockResponse();

    vi.mocked(prisma.credential.findUnique).mockResolvedValueOnce({
      id: "db-cred-1",
      credentialId: "KYC-2026-0001",
      status: "ACTIVE",
      issuerId: "inst-owner-99",
    } as never);

    // Current user belongs to a different institution
    vi.mocked(prisma.institutionProfile.findUnique).mockResolvedValueOnce({
      id: "inst-other-1",
      userId: "issuer-user-1",
    } as never);

    await revokeCredential(req, res);

    expect(prisma.institutionProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: "issuer-user-1" },
    });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "You can only revoke credentials you issued",
      })
    );
    expect(blockchainService.revokeCredentialOnChain).not.toHaveBeenCalled();
  });

  it("successfully revokes on-chain and persists REVOKED status, reason, and transaction hash", async () => {
    const credentialId = "KYC-2026-0001";
    const issuerUserId = "issuer-user-1";
    const institutionId = "inst-1";
    const reason = "Customer account compromised";
    const txHash = "0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef";

    const req = createMockRequest(issuerUserId, { credentialId }, { reason });
    const res = createMockResponse();

    vi.mocked(prisma.credential.findUnique).mockResolvedValueOnce({
      id: "db-cred-1",
      credentialId,
      status: "ACTIVE",
      issuerId: institutionId,
    } as never);

    vi.mocked(prisma.institutionProfile.findUnique).mockResolvedValueOnce({
      id: institutionId,
      userId: issuerUserId,
    } as never);

    vi.mocked(blockchainService.revokeCredentialOnChain).mockResolvedValueOnce({
      transactionHash: txHash,
      blockNumber: 12345,
    });

    const mockUpdatedCredential = {
      id: "db-cred-1",
      credentialId,
      status: "REVOKED",
    };
    const mockRevocationRecord = {
      id: "revocation-1",
      credentialId: "db-cred-1",
      revokedById: issuerUserId,
      reason,
      blockchainTxHash: txHash,
      revokedAt: new Date(),
    };

    vi.mocked(prisma.$transaction).mockResolvedValueOnce([
      mockUpdatedCredential,
      mockRevocationRecord,
    ] as never);

    await revokeCredential(req, res);

    // Verify blockchain revocation call
    expect(blockchainService.revokeCredentialOnChain).toHaveBeenCalledWith(credentialId);

    // Verify database transaction
    expect(prisma.credential.update).toHaveBeenCalledWith({
      where: { credentialId },
      data: { status: "REVOKED" },
    });
    expect(prisma.revocation.create).toHaveBeenCalledWith({
      data: {
        credentialId: "db-cred-1",
        revokedById: issuerUserId,
        reason,
        blockchainTxHash: txHash,
      },
    });
    expect(prisma.$transaction).toHaveBeenCalled();

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Credential revoked successfully",
        data: {
          credential: mockUpdatedCredential,
          revocation: mockRevocationRecord,
        },
      })
    );
  });

  it("handles blockchain failure and prevents the database transaction", async () => {
    const credentialId = "KYC-2026-0001";
    const issuerUserId = "issuer-user-1";
    const institutionId = "inst-1";
    const reason = "Suspicious activity detected";

    const req = createMockRequest(issuerUserId, { credentialId }, { reason });
    const res = createMockResponse();

    vi.mocked(prisma.credential.findUnique).mockResolvedValueOnce({
      id: "db-cred-1",
      credentialId,
      status: "ACTIVE",
      issuerId: institutionId,
    } as never);

    vi.mocked(prisma.institutionProfile.findUnique).mockResolvedValueOnce({
      id: institutionId,
      userId: issuerUserId,
    } as never);

    // Blockchain call fails (e.g. node unreachable or revert)
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(blockchainService.revokeCredentialOnChain).mockRejectedValueOnce(
      new Error("Blockchain network error")
    );

    await revokeCredential(req, res);

    expect(blockchainService.revokeCredentialOnChain).toHaveBeenCalledWith(credentialId);
    expect(prisma.$transaction).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Internal server error",
      })
    );

    consoleSpy.mockRestore();
  });
});
