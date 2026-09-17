import { createHash } from "node:crypto";
import {
  CredentialSchema,
  type Credential,
} from "./credential.schema.js";

export function canonicalizeCredential(
  credential: Credential
): string {
  const validated = CredentialSchema.parse(credential);

  return JSON.stringify({
    credentialId: validated.credentialId,
    type: validated.type,
    subject: validated.subject,
    issuer: validated.issuer,
    claims: validated.claims,
    issuanceDate: validated.issuanceDate,
    ...(validated.expirationDate !== undefined
      ? { expirationDate: validated.expirationDate }
      : {}),
  });
}

export function hashCredential(
  credential: Credential
): string {
  const canonical = canonicalizeCredential(credential);

  return createHash("sha256")
    .update(canonical, "utf8")
    .digest("hex");
}