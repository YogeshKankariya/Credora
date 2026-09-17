import { describe, expect, it } from "vitest";
import { EthereumBlockchainRegistry } from "./EthereumBlockchainRegistry.js";

const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
const contractAddress = process.env.KYC_REGISTRY_ADDRESS;
const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

const canRunIntegrationTest =
  Boolean(rpcUrl) &&
  Boolean(contractAddress) &&
  Boolean(privateKey);

describe.skipIf(!canRunIntegrationTest)(
  "EthereumBlockchainRegistry integration",
  () => {
    it("registers, retrieves, revokes, and retrieves a credential", async () => {
      const registry = new EthereumBlockchainRegistry({
        rpcUrl: rpcUrl!,
        contractAddress: contractAddress!,
        privateKey: privateKey!,
        network: "localhost",
      });

      const credentialId = `integration-test-${Date.now()}`;
      const credentialHash =
        "a".repeat(64);
      const issuer =
        "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

      const registration = await registry.registerCredential(
        credentialId,
        credentialHash,
        issuer
      );

      expect(registration.transactionHash).toMatch(/^0x[0-9a-f]{64}$/i);
      expect(registration.blockNumber).toBeGreaterThan(0);
      expect(registration.contractAddress).toBe(contractAddress);
      expect(registration.network).toBe("localhost");
      expect(registration.registrationStatus).toBe("CONFIRMED");

      const active =
        await registry.getCredential(credentialId);

      expect(active.credentialId).toBe(credentialId);
      expect(active.credentialHash).toBe(
        `0x${credentialHash}`
      );
      expect(active.issuer.toLowerCase()).toBe(
        issuer.toLowerCase()
      );
      expect(active.issuedAt).toBeGreaterThan(0);
      expect(active.status).toBe("ACTIVE");

      const revocation = await registry.revokeCredential(credentialId);

      expect(revocation.transactionHash).toMatch(/^0x[0-9a-f]{64}$/i);
      expect(revocation.blockNumber).toBeGreaterThan(0);

      const revoked =
        await registry.getCredential(credentialId);

      expect(revoked.credentialId).toBe(credentialId);
      expect(revoked.credentialHash).toBe(
        `0x${credentialHash}`
      );
      expect(revoked.status).toBe("REVOKED");
    });
  }
);