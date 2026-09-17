import { describe, expect, it } from "vitest";
import {
  canonicalizeCredential,
  hashCredential,
} from "./credential.canonical.js";

const credential = {
  credentialId: "cred-001",
  type: "KYC_CREDENTIAL" as const,
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
    documentType: "PAN" as const,
    documentNumber: "ABCDE1234F",
    address: "Pune",
    kycStatus: "VERIFIED" as const,
  },
  issuanceDate: "2026-09-17T00:00:00.000Z",
};

describe("credential canonicalization", () => {
  it("produces deterministic output", () => {
    const first = canonicalizeCredential(credential);
    const second = canonicalizeCredential(credential);

    expect(first).toBe(second);
  });

  it("produces a SHA-256 hash", () => {
    const hash = hashCredential(credential);

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes the hash when credential data changes", () => {
    const original = hashCredential(credential);

    const modified = hashCredential({
      ...credential,
      claims: {
        ...credential.claims,
        address: "Mumbai",
      },
    });

    expect(modified).not.toBe(original);
  });
});