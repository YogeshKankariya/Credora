import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import prisma from "../config/database.js";
import {
  getVerificationHistory,
  getVerificationById,
} from "./verification.controller.js";

vi.mock("../config/database.js", () => ({
  default: {
    verificationLog: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
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
  params: Record<string, string> = {}
): Request {
  return {
    user: userId
      ? { userId, role: "VERIFIER", email: "verifier@test.com" }
      : undefined,
    params,
  } as unknown as Request;
}

describe("Verification History Access Control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getVerificationHistory", () => {
    it("returns 401 when the request has no authenticated user", async () => {
      const req = createMockRequest(undefined);
      const res = createMockResponse();

      await getVerificationHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Not authenticated",
        })
      );
      expect(prisma.verificationLog.findMany).not.toHaveBeenCalled();
    });

    it("filters verification history by the authenticated verifier's ID", async () => {
      const verifierId = "verifier-uuid-1";
      const req = createMockRequest(verifierId);
      const res = createMockResponse();

      const userLogs = [
        {
          id: "log-1",
          verifierId,
          purpose: "KYC Check",
          result: "PASS",
          verifiedAt: new Date(),
        },
      ];

      vi.mocked(prisma.verificationLog.findMany).mockResolvedValueOnce(
        userLogs as never
      );

      await getVerificationHistory(req, res);

      expect(prisma.verificationLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { verifierId },
          orderBy: { verifiedAt: "desc" },
          take: 50,
        })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: userLogs,
        })
      );
    });
  });

  describe("getVerificationById", () => {
    it("returns 401 when the request has no authenticated user", async () => {
      const req = createMockRequest(undefined, { id: "log-1" });
      const res = createMockResponse();

      await getVerificationById(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Not authenticated",
        })
      );
      expect(prisma.verificationLog.findUnique).not.toHaveBeenCalled();
    });

    it("allows a verifier to retrieve their own verification log", async () => {
      const verifierId = "verifier-uuid-1";
      const logId = "log-1";
      const req = createMockRequest(verifierId, { id: logId });
      const res = createMockResponse();

      const ownedLog = {
        id: logId,
        verifierId,
        purpose: "KYC Verification",
        result: "PASS",
        credential: { credentialId: "KYC-2026-000184" },
        verifier: { name: "Demo Verifier" },
      };

      vi.mocked(prisma.verificationLog.findUnique).mockResolvedValueOnce(
        ownedLog as never
      );

      await getVerificationById(req, res);

      expect(prisma.verificationLog.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: logId },
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: ownedLog,
        })
      );
    });

    it("returns 404 and does not expose another user's verification log", async () => {
      const verifierId = "verifier-uuid-1";
      const logId = "log-2";
      const otherVerifierId = "other-verifier-uuid-999";
      const req = createMockRequest(verifierId, { id: logId });
      const res = createMockResponse();

      const otherUserLog = {
        id: logId,
        verifierId: otherVerifierId,
        purpose: "Confidential Verification",
        result: "PASS",
        credential: { credentialId: "KYC-2026-999999" },
        verifier: { name: "Other Bank Verifier" },
      };

      vi.mocked(prisma.verificationLog.findUnique).mockResolvedValueOnce(
        otherUserLog as never
      );

      await getVerificationById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Verification record not found",
        })
      );
    });

    it("returns 404 when the verification log does not exist", async () => {
      const verifierId = "verifier-uuid-1";
      const req = createMockRequest(verifierId, { id: "non-existent-id" });
      const res = createMockResponse();

      vi.mocked(prisma.verificationLog.findUnique).mockResolvedValueOnce(null);

      await getVerificationById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Verification record not found",
        })
      );
    });
  });
});
