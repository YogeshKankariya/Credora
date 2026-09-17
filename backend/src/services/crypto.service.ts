import crypto from "crypto";

/**
 * CryptoService
 *
 * Provides real SHA-256 hashing and ECDSA (secp256k1) signing/verification.
 * This replaces the frontend mock that used Math.random() for signatures.
 *
 * Key generation uses Node's built-in `crypto` module — no external deps needed.
 */

// ─── Key Generation ───────────────────────────────────────────────────────────

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Generate an EC key pair (secp256k1 curve).
 * Returns PEM-encoded public and private keys.
 */
export function generateKeyPair(): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "secp256k1",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

// ─── DID Generation ───────────────────────────────────────────────────────────

/**
 * Generate a DID from a public key using the did:demo: method.
 * Format: did:demo:<first-16-hex-chars-of-sha256(publicKey)>
 */
export function generateDID(publicKey: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(publicKey)
    .digest("hex")
    .slice(0, 16);
  return `did:demo:${hash}`;
}

/**
 * Generate a DID for an institution.
 * Format: did:bank:<institutionCode>-<hash>
 */
export function generateInstitutionDID(institutionCode: string, publicKey: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(publicKey)
    .digest("hex")
    .slice(0, 8);
  return `did:bank:${institutionCode.toLowerCase()}-${hash}`;
}

// ─── Hashing ─────────────────────────────────────────────────────────────────

/**
 * Create a canonical (deterministic) JSON string from credential data.
 * Keys are sorted to ensure the same data always produces the same hash.
 */
export function canonicalize(data: Record<string, unknown>): string {
  return JSON.stringify(data, Object.keys(data).sort());
}

/**
 * Compute SHA-256 hash of a string.
 * Returns hex-encoded digest.
 */
export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Hash a credential payload:
 * 1. Canonicalize the payload (sorted keys)
 * 2. SHA-256 hash the canonical string
 */
export function hashCredentialPayload(payload: Record<string, unknown>): string {
  const canonical = canonicalize(payload);
  return sha256(canonical);
}

// ─── Signing ─────────────────────────────────────────────────────────────────

/**
 * Sign a hash with an ECDSA private key (secp256k1).
 * Returns base64-encoded DER signature.
 */
export function signHash(hash: string, privateKeyPem: string): string {
  const sign = crypto.createSign("SHA256");
  sign.update(hash);
  sign.end();
  return sign.sign(privateKeyPem, "base64");
}

/**
 * Verify an ECDSA signature.
 * Returns true if the signature is valid for the given hash and public key.
 */
export function verifySignature(
  hash: string,
  signature: string,
  publicKeyPem: string
): boolean {
  try {
    const verify = crypto.createVerify("SHA256");
    verify.update(hash);
    verify.end();
    return verify.verify(publicKeyPem, signature, "base64");
  } catch {
    return false;
  }
}

// ─── Document Number Hashing ──────────────────────────────────────────────────

/**
 * Hash a document number for safe storage.
 * Uses SHA-256 — document number is never stored in plain text.
 */
export function hashDocumentNumber(documentNumber: string): string {
  return sha256(documentNumber.toUpperCase().trim());
}

// ─── Credential ID Generation ─────────────────────────────────────────────────

/**
 * Generate a human-readable credential ID.
 * Format: KYC-<YEAR>-<6-digit-padded-number>
 */
export function generateCredentialId(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const seq = String(sequenceNumber).padStart(6, "0");
  return `KYC-${year}-${seq}`;
}

export const cryptoService = {
  generateKeyPair,
  generateDID,
  generateInstitutionDID,
  canonicalize,
  sha256,
  hashCredentialPayload,
  signHash,
  verifySignature,
  hashDocumentNumber,
  generateCredentialId,
};

export default cryptoService;
