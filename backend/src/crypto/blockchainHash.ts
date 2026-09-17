import { createHash } from "node:crypto";
import { ethers } from "ethers";

const SHA256_HEX_REGEX = /^[0-9a-fA-F]{64}$/;
const BYTES32_REGEX = /^0x[0-9a-fA-F]{64}$/;

/**
 * Converts an application-level credential ID into the bytes32
 * identifier used by KYCRegistry.sol.
 *
 * Rule:
 *   bytes32CredentialId = keccak256(UTF8(credentialId))
 */
export function credentialIdToBytes32(credentialId: string): string {
  if (!credentialId) {
    throw new Error("credentialId must not be empty");
  }

  return ethers.id(credentialId);
}

/**
 * Calculates the SHA-256 digest of a canonical credential payload.
 *
 * Returns exactly 64 hexadecimal characters, without the 0x prefix.
 */
export function sha256Hex(payload: string): string {
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

/**
 * Converts a SHA-256 hexadecimal digest into the bytes32 representation
 * expected by Solidity.
 *
 * Input:
 *   64 hexadecimal characters
 *
 * Output:
 *   0x + 64 hexadecimal characters
 */
export function sha256ToBytes32(sha256Hash: string): string {
  const normalized = sha256Hash.startsWith("0x")
    ? sha256Hash.slice(2)
    : sha256Hash;

  if (!SHA256_HEX_REGEX.test(normalized)) {
    throw new Error(
      "SHA-256 hash must contain exactly 32 bytes represented as 64 hexadecimal characters"
    );
  }

  return `0x${normalized.toLowerCase()}`;
}

/**
 * Validates a Solidity bytes32 value.
 */
export function isBytes32(value: string): boolean {
  return BYTES32_REGEX.test(value);
}