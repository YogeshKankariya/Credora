import { Wallet } from "ethers";
import { EthereumBlockchainRegistry } from "../blockchain/EthereumBlockchainRegistry.js";
import { blockchainConfig } from "../config/blockchain.js";
import type {
  BlockchainCredentialRecord,
  BlockchainRegistrationResult,
  BlockchainRevocationResult,
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

function getIssuerAddress(): string {
  if (!blockchainConfig.privateKey) {
    throw new Error("BLOCKCHAIN_PRIVATE_KEY is not configured");
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
  const registry = createRegistry();

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
  const registry = createRegistry();
  return registry.getCredential(credentialId);
}

export const blockchainService = {
  registerCredential,
  revokeCredentialOnChain,
  isCredentialOnChain,
  getCredentialOnChain,
};

export default blockchainService;