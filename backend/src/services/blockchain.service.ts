/**
 * BlockchainService
 *
 * Stub for on-chain credential registration and revocation.
 * Will be replaced with real ethers.js calls when the smart contract is deployed.
 *
 * Current behavior: simulates a blockchain transaction with a fake tx hash
 * so the rest of the system can be developed and tested without a live chain.
 */

import crypto from "crypto";

export interface BlockchainRegistrationResult {
  transactionHash: string;
  blockNumber: number;
  contractAddress: string;
  network: string;
  registrationStatus: "CONFIRMED" | "PENDING" | "FAILED";
}

export interface BlockchainRevocationResult {
  transactionHash: string;
  success: boolean;
}

/**
 * Register a credential hash on the blockchain.
 *
 * STUB: Returns a simulated transaction result.
 * Replace with: await contract.registerCredential(credentialHash);
 */
export async function registerCredential(
  credentialHash: string
): Promise<BlockchainRegistrationResult> {
  // TODO: Replace with real ethers.js call
  // const provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);
  // const wallet = new ethers.Wallet(blockchainConfig.privateKey, provider);
  // const contract = new ethers.Contract(blockchainConfig.contractAddress, ABI, wallet);
  // const tx = await contract.registerCredential(credentialHash);
  // const receipt = await tx.wait();

  // Simulate blockchain latency
  await new Promise((resolve) => setTimeout(resolve, 100));

  const fakeHash = "0x" + crypto.randomBytes(32).toString("hex");
  const fakeBlock = Math.floor(Math.random() * 1_000_000) + 4_000_000;

  console.log(`[blockchain.stub] Registered credential hash ${credentialHash.slice(0, 16)}... → tx ${fakeHash.slice(0, 16)}...`);

  return {
    transactionHash: fakeHash,
    blockNumber: fakeBlock,
    contractAddress: process.env["CONTRACT_ADDRESS"] ?? "0x0000000000000000000000000000000000000000",
    network: process.env["BLOCKCHAIN_NETWORK"] ?? "localhost",
    registrationStatus: "CONFIRMED",
  };
}

/**
 * Revoke a credential hash on the blockchain.
 *
 * STUB: Returns a simulated revocation transaction.
 * Replace with: await contract.revokeCredential(credentialHash);
 */
export async function revokeCredentialOnChain(
  credentialHash: string
): Promise<BlockchainRevocationResult> {
  // TODO: Replace with real ethers.js call

  await new Promise((resolve) => setTimeout(resolve, 100));

  const fakeHash = "0x" + crypto.randomBytes(32).toString("hex");

  console.log(`[blockchain.stub] Revoked credential hash ${credentialHash.slice(0, 16)}... → tx ${fakeHash.slice(0, 16)}...`);

  return { transactionHash: fakeHash, success: true };
}

/**
 * Check if a credential hash is registered on the blockchain.
 *
 * STUB: Always returns true for existing hashes.
 * Replace with: return await contract.isRegistered(credentialHash);
 */
export async function isCredentialOnChain(
  _credentialHash: string
): Promise<boolean> {
  // TODO: Replace with real ethers.js call
  await new Promise((resolve) => setTimeout(resolve, 50));
  return true; // Stub always passes blockchain check
}

export const blockchainService = {
  registerCredential,
  revokeCredentialOnChain,
  isCredentialOnChain,
};

export default blockchainService;
