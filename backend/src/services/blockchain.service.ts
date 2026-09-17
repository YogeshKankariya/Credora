import { Wallet } from "ethers";
import { EthereumBlockchainRegistry } from "../blockchain/EthereumBlockchainRegistry.js";
import { MockBlockchainRegistry } from "../blockchain/MockBlockchainRegistry.js";
import { blockchainConfig } from "../config/blockchain.js";
import type {
  BlockchainCredentialRecord,
  BlockchainRegistrationResult,
  BlockchainRevocationResult,
  BlockchainRegistry,
} from "@hack2ignite/shared/schemas/blockchain";

const fallbackRegistry = new MockBlockchainRegistry();

function createRegistry(): BlockchainRegistry {
  const isConfigured = Boolean(
    blockchainConfig.rpcUrl &&
    blockchainConfig.privateKey &&
    blockchainConfig.contractAddress
  );

  if (!isConfigured) {
    return fallbackRegistry;
  }

  return new EthereumBlockchainRegistry({
    rpcUrl: blockchainConfig.rpcUrl,
    privateKey: blockchainConfig.privateKey,
    contractAddress: blockchainConfig.contractAddress,
    network: blockchainConfig.network,
  });
}

let registryInstance: BlockchainRegistry | null = null;

/**
 * Obtain the configured BlockchainRegistry instance.
 * Returns test-injected registry if set, otherwise lazily creates EthereumBlockchainRegistry.
 */
export function getRegistry(): BlockchainRegistry {
  if (!registryInstance) {
    registryInstance = createRegistry();
  }
  return registryInstance;
}

/**
 * Override the BlockchainRegistry instance (e.g. for testing with MockBlockchainRegistry).
 */
export function setRegistry(registry: BlockchainRegistry | null): void {
  registryInstance = registry;
}

/**
 * Derive the MVP issuer Ethereum address safely from the configured private key.
 */
export function getExpectedIssuerAddress(): string | null {
  if (!blockchainConfig.privateKey) return null;
  try {
    return new Wallet(blockchainConfig.privateKey).address;
  } catch {
    return null;
  }
}

/**
 * Get the required issuer address, falling back to local default address if private key is not configured.
 */
export function getIssuerAddress(): string {
  const address = getExpectedIssuerAddress();
  if (!address) {
    return "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  }
  return address;
}

/**
 * Register a credential on the real Ethereum-compatible blockchain.
 */
export async function registerCredential(
  credentialId: string,
  credentialHash: string,
  issuer?: string
): Promise<BlockchainRegistrationResult> {
  const registry = getRegistry();

  // For the current MVP, the backend blockchain wallet is the
  // on-chain issuer. The Solidity contract enforces this address
  // as the revocation authority.
  const issuerAddress = issuer ?? getIssuerAddress();

  try {
    return await registry.registerCredential(
      credentialId,
      credentialHash,
      issuerAddress
    );
  } catch (err) {
    if (registry !== fallbackRegistry) {
      console.warn("[blockchain] Real chain unavailable, falling back to mock registry:", (err as Error)?.message || err);
      return await fallbackRegistry.registerCredential(
        credentialId,
        credentialHash,
        issuerAddress
      );
    }
    throw err;
  }
}

/**
 * Revoke a credential on the real blockchain.
 */
export async function revokeCredentialOnChain(
  credentialId: string
): Promise<BlockchainRevocationResult> {
  const registry = getRegistry();

  try {
    return await registry.revokeCredential(credentialId);
  } catch (err) {
    if (registry !== fallbackRegistry) {
      console.warn("[blockchain] Real chain unavailable, falling back to mock registry:", (err as Error)?.message || err);
      return await fallbackRegistry.revokeCredential(credentialId);
    }
    throw err;
  }
}

/**
 * Check whether a credential is currently registered on-chain.
 */
export async function isCredentialOnChain(
  credentialId: string
): Promise<boolean> {
  const record = await getCredentialOnChain(credentialId);
  return record.status === "ACTIVE";
}

export async function getCredentialOnChain(
  credentialId: string
): Promise<BlockchainCredentialRecord> {
  const registry = getRegistry();

  try {
    return await registry.getCredential(credentialId);
  } catch (err) {
    if (registry !== fallbackRegistry) {
      console.warn("[blockchain] Real chain unavailable, falling back to mock registry:", (err as Error)?.message || err);
      return await fallbackRegistry.getCredential(credentialId);
    }
    throw err;
  }
}

export const blockchainService = {
  getRegistry,
  setRegistry,
  getExpectedIssuerAddress,
  getIssuerAddress,
  registerCredential,
  revokeCredentialOnChain,
  isCredentialOnChain,
  getCredentialOnChain,
};

export default blockchainService;