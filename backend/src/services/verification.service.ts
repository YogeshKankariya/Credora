/**
 * VerificationService
 *
 * Performs the six-point credential verification that the frontend already
 * renders in VerificationResultCard and VerificationStepper.
 *
 * Checks (in order):
 *   1. Structure     — credential exists and is well-formed
 *   2. Issuer        — issuer is in trusted institutions list
 *   3. Signature     — ECDSA signature is mathematically valid
 *   4. Hash Integrity — recomputed SHA-256 matches stored hash
 *   5. Blockchain    — credential hash exists on chain
 *   6. Status Active — credential is not revoked or expired
 *
 * Every verification attempt is recorded in verification_logs.
 */

import prisma from "../config/database.js";
import { cryptoService } from "./crypto.service.js";
import { blockchainService } from "./blockchain.service.js";

export interface VerificationInput {
  credentialId: string;
  purpose: string;
  verifierId: string;
}

export interface VerificationChecks {
  structure: boolean;
  issuer: boolean;
  signature: boolean;
  hashIntegrity: boolean;
  blockchain: boolean;
  statusActive: boolean;
}

export interface VerificationResult {
  overall: "PASS" | "FAIL";
  credentialId: string;
  checks: VerificationChecks;
  logId: string;
}

async function verify(input: VerificationInput): Promise<VerificationResult> {
  const { credentialId, purpose, verifierId } = input;

  const checks: VerificationChecks = {
    structure: false,
    issuer: false,
    signature: false,
    hashIntegrity: false,
    blockchain: false,
    statusActive: false,
  };

  // ── Check 1: Structure ────────────────────────────────────────────────────
  const credential = await prisma.credential.findUnique({
    where: { credentialId },
    include: {
      issuer: true,
      revocation: true,
    },
  });

  if (
    credential &&
    credential.credentialHash &&
    credential.signature &&
    credential.subjectDid &&
    credential.issuerDid
  ) {
    checks.structure = true;
  }

  if (!credential || !checks.structure) {
    // Can't do any further checks without a valid credential
    return await saveAndReturn(checks, credentialId, purpose, verifierId, null);
  }

  // ── Check 2: Issuer ───────────────────────────────────────────────────────
  const trustedIssuer = await prisma.institutionProfile.findUnique({
    where: { id: credential.issuerId },
  });

  if (trustedIssuer && trustedIssuer.status === "ACTIVE") {
    checks.issuer = true;
  }

  // ── Check 3: Signature ────────────────────────────────────────────────────
  const signatureValid = cryptoService.verifySignature(
    credential.credentialHash,
    credential.signature,
    credential.publicKey
  );
  checks.signature = signatureValid;

  // ── Check 4: Hash Integrity ───────────────────────────────────────────────
  const expectedPayload = {
    credentialId: credential.credentialId,
    subjectDid: credential.subjectDid,
    issuerDid: credential.issuerDid,
    credentialType: credential.credentialType,
    assuranceLevel: credential.assuranceLevel,
    issuedAt: credential.issuedAt.toISOString(),
    expiresAt: credential.expiresAt.toISOString(),
  };

  const recomputedHash = cryptoService.hashCredentialPayload(expectedPayload);
  checks.hashIntegrity = recomputedHash === credential.credentialHash;

  // ── Check 5: Blockchain ───────────────────────────────────────────────────
  try {
    checks.blockchain = await blockchainService.isCredentialOnChain(credential.credentialHash);
  } catch {
    checks.blockchain = false;
  }

  // ── Check 6: Status Active ────────────────────────────────────────────────
  const now = new Date();
  const isNotRevoked = credential.status !== "REVOKED";
  const isNotExpired = credential.expiresAt > now;
  checks.statusActive = isNotRevoked && isNotExpired;

  return await saveAndReturn(checks, credentialId, purpose, verifierId, credential.id);
}

async function saveAndReturn(
  checks: VerificationChecks,
  credentialId: string,
  purpose: string,
  verifierId: string,
  dbCredentialId: string | null
): Promise<VerificationResult> {
  const overall = Object.values(checks).every(Boolean) ? "PASS" : "FAIL";

  // Increment verification count on the credential (only if it exists)
  if (dbCredentialId) {
    await prisma.credential.update({
      where: { id: dbCredentialId },
      data: { verificationCount: { increment: 1 } },
    });
  }

  // Resolve the credential's DB id for the log foreign key
  let credentialDbId = dbCredentialId;
  if (!credentialDbId) {
    const found = await prisma.credential.findUnique({ where: { credentialId } });
    credentialDbId = found?.id ?? null;
  }

  if (!credentialDbId) {
    // Can't log without a valid credential FK — return result without log
    return { overall, credentialId, checks, logId: "unlogged" };
  }

  const log = await prisma.verificationLog.create({
    data: {
      credentialId: credentialDbId,
      verifierId,
      purpose,
      result: overall,
      status: overall === "PASS" ? "SUCCESS" : "FAILED",
      structureCheck: checks.structure,
      issuerCheck: checks.issuer,
      signatureCheck: checks.signature,
      hashIntegrityCheck: checks.hashIntegrity,
      blockchainCheck: checks.blockchain,
      statusActiveCheck: checks.statusActive,
    },
  });

  return { overall, credentialId, checks, logId: log.id };
}

export const verificationService = { verify };
export default verificationService;
