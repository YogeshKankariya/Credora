/**
 * Shared blockchain contracts.
 *
 * This file defines the representation boundary between the
 * application layer and the blockchain adapter.
 *
 * IMPORTANT:
 * - credentialId is the application-level string identifier.
 * - credentialHash is the SHA-256 digest represented as hex.
 * - Blockchain conversion to bytes32 is owned by the blockchain adapter.
 */

export type BlockchainCredentialStatus =
  | "ACTIVE"
  | "REVOKED"
  | "NOT_FOUND";

export interface BlockchainCredentialRecord {
  /**
   * Original application-level credential ID.
   *
   * Example:
   * KYC-2026-0001
   */
  credentialId: string;

  /**
   * SHA-256 hash of the canonical credential payload.
   *
   * Expected format:
   * 64 hexadecimal characters, optionally prefixed with 0x
   */
  credentialHash: string;

  /**
   * Ethereum-compatible blockchain address of the issuer.
   */
  issuer: string;

  /**
   * Unix timestamp returned by the blockchain.
   *
   * 0 is reserved for a non-existent blockchain record.
   */
  issuedAt: number;

  /**
   * Current blockchain registry status.
   */
  status: BlockchainCredentialStatus;
}

export interface BlockchainRegistrationResult {
  transactionHash: string;
  blockNumber: number;
  contractAddress: string;
  network: string;
  registrationStatus: "CONFIRMED";
}

export interface BlockchainRevocationResult {
  transactionHash: string;
  blockNumber: number;
}

/**
 * Application-level blockchain registry abstraction.
 *
 * Application services depend on this interface rather than directly
 * on ethers, Hardhat, RPC providers, or Solidity contracts.
 */
export interface BlockchainRegistry {
  /**
   * Register a credential on the blockchain.
   */
  registerCredential(
    credentialId: string,
    credentialHash: string,
    issuer: string
  ): Promise<BlockchainRegistrationResult>;

  /**
   * Retrieve the current blockchain record.
   *
   * A missing credential MUST return:
   * status = "NOT_FOUND"
   */
  getCredential(
    credentialId: string
  ): Promise<BlockchainCredentialRecord>;

  /**
   * Revoke a credential.
   *
   * The underlying blockchain contract enforces issuer authorization.
   */
  revokeCredential(
    credentialId: string
  ): Promise<BlockchainRevocationResult>;
}

/**
 * Blockchain representation rules.
 *
 * These constants are intentionally shared so that all modules
 * reference the same algorithm names.
 */
export const BLOCKCHAIN_RULES = {
  credentialIdAlgorithm: "keccak256",
  credentialIdEncoding: "utf8",
  credentialHashAlgorithm: "sha256",
  credentialHashRepresentation: "hex",
  credentialHashSizeBytes: 32,
  credentialIdSizeBytes: 32,
} as const;

/**
 * Converts the application credential ID into the conceptual
 * blockchain representation.
 *
 * Canonical rule:
 *
 *   bytes32CredentialId =
 *       keccak256(UTF8(credentialId))
 *
 * The actual cryptographic implementation belongs in the
 * blockchain adapter/utility implementation.
 */
export interface CredentialIdHasher {
  toBlockchainId(credentialId: string): string;
}

/**
 * Validates and converts the application SHA-256 credential hash
 * into the bytes32 representation expected by Solidity.
 *
 * Canonical rule:
 *
 *   SHA-256 digest = exactly 32 bytes
 *   Solidity representation = bytes32
 */
export interface CredentialHashEncoder {
  toBytes32(credentialHash: string): string;
}