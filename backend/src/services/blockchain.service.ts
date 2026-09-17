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

function getIssuerAddress(): string {
  if (!blockchainConfig.privateKey) {
    return "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  }

  const wallet = new Wallet(blockchainConfig.privateKey);
  return wallet.address;
}

/**
 * Register a credential on the real Ethereum-compatible blockchain.
 */
export async function registerCredential(
  credentialId: string,
  credentialHash: string,
  issuer?: string
): Promise<BlockchainRegistrationResult> {
  const registry = createRegistry();
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
  const registry = createRegistry();

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
  const registry = createRegistry();

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
  registerCredential,
  revokeCredentialOnChain,
  isCredentialOnChain,
  getCredentialOnChain,
};

export default blockchainService;