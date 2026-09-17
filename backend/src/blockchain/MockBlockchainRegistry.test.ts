import { describe, expect, it } from "vitest";
import { MockBlockchainRegistry } from "./MockBlockchainRegistry.js";

describe("MockBlockchainRegistry", () => {
  it("registers and retrieves a credential", async () => {
    const registry = new MockBlockchainRegistry();

    await registry.registerCredential(
      "KYC-2026-0001",
      "a".repeat(64),
      "0xIssuer"
    );

    const result = await registry.getCredential("KYC-2026-0001");

    expect(result.credentialId).toBe("KYC-2026-0001");
    expect(result.credentialHash).toBe("a".repeat(64));
    expect(result.issuer).toBe("0xIssuer");
    expect(result.status).toBe("ACTIVE");
    expect(result.issuedAt).toBeGreaterThan(0);
  });

  it("returns NOT_FOUND for an unknown credential", async () => {
    const registry = new MockBlockchainRegistry();

    const result = await registry.getCredential("UNKNOWN");

    expect(result.status).toBe("NOT_FOUND");
    expect(result.issuedAt).toBe(0);
  });

  it("rejects duplicate registration", async () => {
    const registry = new MockBlockchainRegistry();

    await registry.registerCredential(
      "KYC-2026-0001",
      "a".repeat(64),
      "0xIssuer"
    );

    await expect(
      registry.registerCredential(
        "KYC-2026-0001",
        "b".repeat(64),
        "0xIssuer"
      )
    ).rejects.toThrow("Credential already registered");
  });

  it("revokes a credential", async () => {
    const registry = new MockBlockchainRegistry();

    await registry.registerCredential(
      "KYC-2026-0001",
      "a".repeat(64),
      "0xIssuer"
    );

    await registry.revokeCredential("KYC-2026-0001");

    const result = await registry.getCredential("KYC-2026-0001");

    expect(result.status).toBe("REVOKED");
  });

  it("rejects revocation of an unknown credential", async () => {
    const registry = new MockBlockchainRegistry();

    await expect(
      registry.revokeCredential("UNKNOWN")
    ).rejects.toThrow("Credential not registered");
  });
});