import { describe, expect, it } from "vitest";
import { CredentialService } from "./credential.service.js";
import { MockBlockchainRegistry } from "../blockchain/MockBlockchainRegistry.js";
import type { Credential } from "./credential.schema.js";
import type { IssuerContext } from "./issuer.js";

const credential: Credential = {
  credentialId: "cred-service-001",
  type: "KYC_CREDENTIAL",
  subject: {
    did: "did:kyc:customer-001",
  },
  issuer: {
    did: "did:kyc:bank-a",
    name: "Bank A",
  },
  claims: {
    fullName: "Test Customer",
    dateOfBirth: "2005-01-01",
    documentType: "PAN",
    documentNumber: "ABCDE1234F",
    address: "Pune",
    kycStatus: "VERIFIED",
  },
  issuanceDate: "2026-09-17T00:00:00.000Z",
};

const issuer: IssuerContext = {
  did: "did:kyc:bank-a",
  name: "Bank A",
  blockchainAddress:
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
};

describe("CredentialService", () => {
  it("issues, signs, and registers a credential", async () => {
    const blockchain = new MockBlockchainRegistry();

    const signer = {
      sign: async (payload: string) => {
        expect(payload).toContain("cred-service-001");
        return "mock-signature";
      },
    };

    const service = new CredentialService({
      signer,
      blockchain,
    });

    const issued = await service.issue(credential, issuer);

    expect(issued.signature).toEqual({
      algorithm: "SHA256",
      value: "mock-signature",
    });

    const blockchainRecord =
      await blockchain.getCredential(credential.credentialId);

    expect(blockchainRecord.status).toBe("ACTIVE");
    expect(blockchainRecord.credentialHash).toMatch(
      /^[0-9a-f]{64}$/,
    );
    expect(blockchainRecord.issuer.toLowerCase()).toBe(
      issuer.blockchainAddress.toLowerCase(),
    );
  });

  it("rejects an issuer DID mismatch", async () => {
    const blockchain = new MockBlockchainRegistry();

    const signer = {
      sign: async () => "mock-signature",
    };

    const service = new CredentialService({
      signer,
      blockchain,
    });

    const wrongIssuer: IssuerContext = {
      ...issuer,
      did: "did:kyc:bank-b",
    };

    await expect(
      service.issue(credential, wrongIssuer),
    ).rejects.toThrow(
      "Credential issuer DID does not match issuer context",
    );
  });
});