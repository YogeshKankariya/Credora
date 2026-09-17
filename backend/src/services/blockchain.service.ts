import { Wallet } from "ethers";
import { EthereumBlockchainRegistry } from "../blockchain/EthereumBlockchainRegistry.js";
import { blockchainConfig } from "../config/blockchain.js";
import type {
  BlockchainCredentialRecord,
  BlockchainRegistrationResult,
  BlockchainRevocationResult,
  BlockchainRegistry,
} from "@hack2ignite/shared/schemas/blockchain";

function createRegistry(): EthereumBlockchainRegistry {
  if (!blockchainConfig.rpcUrl) {
    throw new Error("BLOCKCHAIN_RPC_URL is not configured");
  }

  if (!blockchainConfig.privateKey) {
    throw new Error("BLOCKCHAIN_PRIVATE_KEY is not configured");
  }

  if (!blockchainConfig.contractAddress) {
    throw new Error("KYC_REGISTRY_ADDRESS is not configured");
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
 * Get the required issuer address, throwing if private key is not configured.
 */
export function getIssuerAddress(): string {
  const address = getExpectedIssuerAddress();
  if (!address) {
    throw new Error("BLOCKCHAIN_PRIVATE_KEY is not configured");
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

  return registry.registerCredential(
    credentialId,
    credentialHash,
    issuerAddress
  );
}

/**
 * Revoke a credential on the real blockchain.
 */
export async function revokeCredentialOnChain(
  credentialId: string
): Promise<BlockchainRevocationResult> {
  const registry = getRegistry();

  return registry.revokeCredential(credentialId);
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
  return registry.getCredential(credentialId);
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