/**
 * CredentialService
 *
 * Core service for issuing KYC credentials.
 * Flow:
 *   Customer + Institution
 *        ↓
 *   Build canonical payload
 *        ↓
 *   SHA-256(payload) → credentialHash
 *        ↓
 *   ECDSA sign(hash, issuerPrivateKey) → signature
 *        ↓
 *   Save Credential to PostgreSQL
 *        ↓
 *   Register hash on blockchain
 *        ↓
 *   Save BlockchainRecord
 *        ↓
 *   Return full credential
 */

import prisma from "../config/database.js";
import { cryptoService } from "./crypto.service.js";
import { blockchainService } from "./blockchain.service.js";
import type { CustomerProfile, InstitutionProfile } from "@prisma/client";

export interface IssueCredentialInput {
  customer: CustomerProfile;
  institution: InstitutionProfile;
  credentialType: string;
  assuranceLevel: string;
  expiresInDays: number;
}

async function issue(input: IssueCredentialInput) {
  const { customer, institution, credentialType, assuranceLevel, expiresInDays } = input;

  // ── 1. Generate credential ID ──────────────────────────────────────────────
  const count = await prisma.credential.count();
  const credentialId = cryptoService.generateCredentialId(count + 1);

  // ── 2. Build canonical payload ─────────────────────────────────────────────
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

  const payload = {
    credentialId,
    subjectDid: customer.did,
    issuerDid: institution.did,
    credentialType,
    assuranceLevel,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // ── 3. Hash the payload (SHA-256) ──────────────────────────────────────────
  const credentialHash = cryptoService.hashCredentialPayload(payload);

  // ── 4. Sign the hash with the issuer's private key ─────────────────────────
  // The issuer private key is read from env — never stored in DB
  const issuerPrivateKey = process.env["ISSUER_PRIVATE_KEY"];

  let signature: string;
  if (issuerPrivateKey) {
    signature = cryptoService.signHash(credentialHash, issuerPrivateKey);
  } else {
    // Development fallback — generate a one-time key pair for this credential.
    // In production, ISSUER_PRIVATE_KEY must be set.
    console.warn("[credential.service] ISSUER_PRIVATE_KEY not set — using ephemeral key pair for development");
    const keyPair = cryptoService.generateKeyPair();
    signature = cryptoService.signHash(credentialHash, keyPair.privateKey);
  }

  // ── 5. Save credential to PostgreSQL ───────────────────────────────────────
  const credential = await prisma.credential.create({
    data: {
      credentialId,
      customerId: customer.id,
      issuerId: institution.id,
      subjectDid: customer.did,
      issuerDid: institution.did,
      credentialType,
      assuranceLevel,
      credentialHash,
      signature,
      signatureAlgorithm: "ES256K",
      publicKey: institution.publicKey,
      status: "ACTIVE",
      issuedAt,
      expiresAt,
    },
    include: {
      customer: { include: { user: { select: { name: true } } } },
      issuer: { select: { name: true, did: true } },
    },
  });

  // ── 6. Register on blockchain (stub — replace with real ethers.js) ─────────
  try {
    const blockchainResult = await blockchainService.registerCredential(credentialHash);
    await prisma.blockchainRecord.create({
      data: {
        credentialId: credential.id,
        credentialHash,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: BigInt(blockchainResult.blockNumber),
        contractAddress: blockchainResult.contractAddress,
        network: blockchainResult.network,
        registrationStatus: blockchainResult.registrationStatus,
      },
    });
  } catch (err) {
    // Blockchain failure doesn't block credential issuance — log and continue
    console.error("[credential.service] Blockchain registration failed:", err);
    await prisma.blockchainRecord.create({
      data: {
        credentialId: credential.id,
        credentialHash,
        registrationStatus: "FAILED",
      },
    });
  }

  // ── 7. Return the full credential ──────────────────────────────────────────
  return prisma.credential.findUnique({
    where: { id: credential.id },
    include: {
      customer: { include: { user: { select: { name: true, email: true } } } },
      issuer: { select: { name: true, did: true, publicKey: true } },
      blockchainRecord: true,
    },
  });
}

export const credentialService = { issue };
export default credentialService;
