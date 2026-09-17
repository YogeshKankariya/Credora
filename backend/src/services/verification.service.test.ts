import { describe, expect, it, vi, beforeEach } from "vitest";
import prisma from "../config/database.js";
import { verificationService } from "./verification.service.js";
import { blockchainService } from "./blockchain.service.js";
import { cryptoService } from "./crypto.service.js";
import type { BlockchainRegistry, BlockchainCredentialRecord } from "@hack2ignite/shared/schemas/blockchain";

vi.mock("../config/database.js", () => ({
  default: {
    credential: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    institutionProfile: {
      findUnique: vi.fn(),
    },
    verificationLog: {
      create: vi.fn(),
    },
  },
}));

describe("VerificationService - Blockchain-backed Check 5", () => {
  const credentialId = "KYC-2026-000184";
  const rawSha256 = "1111111111111111111111111111111111111111111111111111111111111111";
  const expectedIssuerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  const validCredential = {
    id: "cred-db-uuid-1",
    credentialId,
    credentialHash: rawSha256,
    signature: "valid-sig",
    subjectDid: "did:demo:subject",
    issuerDid: "did:bank:issuer",
    issuerId: "inst-uuid-1",
    credentialType: "KYC Verification",
    assuranceLevel: "Tier-1 High Assurance",
    publicKey: "dummy-key",
    status: "ACTIVE",
    issuedAt: new Date("2026-01-01T00:00:00.000Z"),
    expiresAt: new Date(Date.now() + 86400000),
    revocation: null,
  };

  const validInstitution = {
    id: "inst-uuid-1",
    status: "ACTIVE",
    role: "ISSUER",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default DB mock responses
    vi.mocked(prisma.credential.findUnique).mockResolvedValue(validCredential as never);
    vi.mocked(prisma.institutionProfile.findUnique).mockResolvedValue(validInstitution as never);
    vi.mocked(prisma.credential.update).mockResolvedValue(validCredential as never);
    vi.mocked(prisma.verificationLog.create).mockResolvedValue({ id: "log-123" } as never);

    // Mock cryptoService to pass checks 3 and 4
    vi.spyOn(cryptoService, "verifySignature").mockReturnValue(true);
    vi.spyOn(cryptoService, "hashCredentialPayload").mockReturnValue(rawSha256);

    // Mock expected issuer address from blockchainService
    vi.spyOn(blockchainService, "getExpectedIssuerAddress").mockReturnValue(expectedIssuerAddress);
  });

  it("passes blockchain check when record is ACTIVE, hash matches, and issuer matches", async () => {
    const mockRegistry: BlockchainRegistry = {
      registerCredential: vi.fn(),
      revokeCredential: vi.fn(),
      getCredential: vi.fn().mockResolvedValue({
        credentialId,
        credentialHash: `0x${rawSha256}`,
        issuer: expectedIssuerAddress.toLowerCase(),
        issuedAt: 1700000000,
        status: "ACTIVE",
      } satisfies BlockchainCredentialRecord),
    };
    blockchainService.setRegistry(mockRegistry);

    const result = await verificationService.verify({
      credentialId,
      purpose: "Testing",
      verifierId: "user-1",
    });

    expect(result.checks.blockchain).toBe(true);
    expect(result.overall).toBe("PASS");
  });

  it("fails blockchain check when record status is NOT_FOUND", async () => {
    const mockRegistry: BlockchainRegistry = {
      registerCredential: vi.fn(),
      revokeCredential: vi.fn(),
      getCredential: vi.fn().mockResolvedValue({
        credentialId,
        credentialHash: "",
        issuer: "",
        issuedAt: 0,
        status: "NOT_FOUND",
      } satisfies BlockchainCredentialRecord),
    };
    blockchainService.setRegistry(mockRegistry);

    const result = await verificationService.verify({
      credentialId,
      purpose: "Testing",
      verifierId: "user-1",
    });

    expect(result.checks.blockchain).toBe(false);
    expect(result.overall).toBe("FAIL");
  });

  it("passes blockchain check but fails status check when on-chain record status is REVOKED", async () => {
    const mockRegistry: BlockchainRegistry = {
      registerCredential: vi.fn(),
      revokeCredential: vi.fn(),
      getCredential: vi.fn().mockResolvedValue({
        credentialId,
        credentialHash: `0x${rawSha256}`,
        issuer: expectedIssuerAddress,
        issuedAt: 1700000000,
        status: "REVOKED",
      } satisfies BlockchainCredentialRecord),
    };
    blockchainService.setRegistry(mockRegistry);

    const result = await verificationService.verify({
      credentialId,
      purpose: "Testing",
      verifierId: "user-1",
    });

    expect(result.checks.blockchain).toBe(true);
    expect(result.checks.statusActive).toBe(false);
    expect(result.overall).toBe("FAIL");
  });

  it("fails blockchain check when on-chain hash does not match DB hash", async () => {
    const mismatchedHash = "2222222222222222222222222222222222222222222222222222222222222222";
    const mockRegistry: BlockchainRegistry = {
      registerCredential: vi.fn(),
      revokeCredential: vi.fn(),
      getCredential: vi.fn().mockResolvedValue({
        credentialId,
        credentialHash: `0x${mismatchedHash}`,
        issuer: expectedIssuerAddress,
        issuedAt: 1700000000,
        status: "ACTIVE",
      } satisfies BlockchainCredentialRecord),
    };
    blockchainService.setRegistry(mockRegistry);

    const result = await verificationService.verify({
      credentialId,
      purpose: "Testing",
      verifierId: "user-1",
    });

    expect(result.checks.blockchain).toBe(false);
    expect(result.overall).toBe("FAIL");
  });

  it("fails blockchain check when on-chain issuer does not match configured backend wallet", async () => {
    const unexpectedIssuer = "0x1111111111111111111111111111111111111111";
    const mockRegistry: BlockchainRegistry = {
      registerCredential: vi.fn(),
      revokeCredential: vi.fn(),
      getCredential: vi.fn().mockResolvedValue({
        credentialId,
        credentialHash: `0x${rawSha256}`,
        issuer: unexpectedIssuer,
        issuedAt: 1700000000,
        status: "ACTIVE",
      } satisfies BlockchainCredentialRecord),
    };
    blockchainService.setRegistry(mockRegistry);

    const result = await verificationService.verify({
      credentialId,
      purpose: "Testing",
      verifierId: "user-1",
    });

    expect(result.checks.blockchain).toBe(false);
    expect(result.overall).toBe("FAIL");
  });

  it("fails blockchain check if registry lookup throws an error", async () => {
    const mockRegistry: BlockchainRegistry = {
      registerCredential: vi.fn(),
      revokeCredential: vi.fn(),
      getCredential: vi.fn().mockRejectedValue(new Error("RPC connection refused")),
    };
    blockchainService.setRegistry(mockRegistry);

    const result = await verificationService.verify({
      credentialId,
      purpose: "Testing",
      verifierId: "user-1",
    });

    expect(result.checks.blockchain).toBe(false);
    expect(result.overall).toBe("FAIL");
  });

  it("fails blockchain check if issuedAt is 0", async () => {
    const mockRegistry: BlockchainRegistry = {
      registerCredential: vi.fn(),
      revokeCredential: vi.fn(),
      getCredential: vi.fn().mockResolvedValue({
        credentialId,
        credentialHash: `0x${rawSha256}`,
        issuer: expectedIssuerAddress,
        issuedAt: 0,
        status: "ACTIVE",
      } satisfies BlockchainCredentialRecord),
    };
    blockchainService.setRegistry(mockRegistry);

    const result = await verificationService.verify({
      credentialId,
      purpose: "Testing",
      verifierId: "user-1",
    });

    expect(result.checks.blockchain).toBe(false);
    expect(result.overall).toBe("FAIL");
  });
});
