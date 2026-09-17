import type {
  BlockchainCredentialRecord,
  BlockchainRegistry,
} from "@hack2ignite/shared/schemas/blockchain";

export class MockBlockchainRegistry implements BlockchainRegistry {
  private readonly credentials = new Map<
    string,
    BlockchainCredentialRecord
  >();

  async registerCredential(
    credentialId: string,
    credentialHash: string,
    issuer: string
  ): Promise<void> {
    if (this.credentials.has(credentialId)) {
      throw new Error("Credential already registered");
    }

    this.credentials.set(credentialId, {
      credentialId,
      credentialHash,
      issuer,
      issuedAt: Math.floor(Date.now() / 1000),
      status: "ACTIVE",
    });
  }

  async getCredential(
    credentialId: string
  ): Promise<BlockchainCredentialRecord> {
    const credential = this.credentials.get(credentialId);

    if (!credential) {
      return {
        credentialId,
        credentialHash: "",
        issuer: "",
        issuedAt: 0,
        status: "NOT_FOUND",
      };
    }

    return { ...credential };
  }

  async revokeCredential(credentialId: string): Promise<void> {
    const credential = this.credentials.get(credentialId);

    if (!credential) {
      throw new Error("Credential not registered");
    }

    if (credential.status === "REVOKED") {
      throw new Error("Credential already revoked");
    }

    this.credentials.set(credentialId, {
      ...credential,
      status: "REVOKED",
    });
  }
}