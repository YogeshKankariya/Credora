import { z } from "zod";

export const CredentialClaimsSchema = z.object({
  fullName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  documentType: z.enum(["PAN", "AADHAAR", "PASSPORT"]),
  documentNumber: z.string().min(1),
  address: z.string().min(1),
  kycStatus: z.literal("VERIFIED"),
});

export const CredentialSchema = z.object({
  credentialId: z.string().min(1),
  type: z.literal("KYC_CREDENTIAL"),
  subject: z.object({
    did: z.string().min(1),
  }),
  issuer: z.object({
    did: z.string().min(1),
    name: z.string().min(1),
  }),
  claims: CredentialClaimsSchema,
  issuanceDate: z.string().min(1),
  expirationDate: z.string().optional(),
});

export type Credential = z.infer<typeof CredentialSchema>;