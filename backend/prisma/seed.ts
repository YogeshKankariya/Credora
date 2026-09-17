import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/database.js";
import { cryptoService } from "../src/services/crypto.service.js";

async function main() {
  console.log("🌱 Seeding database...");

  // Password for all demo accounts: Password123!
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // ─── 1. Bank A (Issuer: Demo National Bank) ──────────────────────────────────
  const bankAUser = await prisma.user.upsert({
    where: { email: "issuer@demobank.com" },
    update: {},
    create: {
      name: "Demo National Bank (Admin)",
      email: "issuer@demobank.com",
      passwordHash,
      role: "ISSUER",
    },
  });

  const bankAKeys = cryptoService.generateKeyPair();
  const bankA = await prisma.institutionProfile.upsert({
    where: { userId: bankAUser.id },
    update: {},
    create: {
      userId: bankAUser.id,
      name: "Demo National Bank",
      shortName: "DNB",
      institutionCode: "DNB-IN-BB",
      did: "did:bank:nat-001-sec",
      publicKey: bankAKeys.publicKey,
      role: "ISSUER",
      status: "ACTIVE",
      accreditedDate: new Date("2024-01-15"),
    },
  });
  console.log(`✅ Seeded Bank A (Issuer): ${bankA.name} (${bankA.did})`);

  // ─── 2. Bank B (Verifier: Demo Cooperative Bank) ────────────────────────────
  const bankBUser = await prisma.user.upsert({
    where: { email: "verifier@demobank.com" },
    update: {},
    create: {
      name: "Demo Cooperative Bank (Verifier)",
      email: "verifier@demobank.com",
      passwordHash,
      role: "VERIFIER",
    },
  });

  const bankBKeys = cryptoService.generateKeyPair();
  const bankB = await prisma.institutionProfile.upsert({
    where: { userId: bankBUser.id },
    update: {},
    create: {
      userId: bankBUser.id,
      name: "Demo Cooperative Bank",
      shortName: "DCB",
      institutionCode: "DCB-IN-02",
      did: "did:bank:coop-002-vfy",
      publicKey: bankBKeys.publicKey,
      role: "VERIFIER",
      status: "ACTIVE",
      accreditedDate: new Date("2024-06-01"),
    },
  });
  console.log(`✅ Seeded Bank B (Verifier): ${bankB.name} (${bankB.did})`);

  // ─── 3. Bank C (Demo Finance Bank) ──────────────────────────────────────────
  const bankCUser = await prisma.user.upsert({
    where: { email: "finance@demobank.com" },
    update: {},
    create: {
      name: "Demo Finance Bank (Operations)",
      email: "finance@demobank.com",
      passwordHash,
      role: "ISSUER",
    },
  });

  const bankCKeys = cryptoService.generateKeyPair();
  const bankC = await prisma.institutionProfile.upsert({
    where: { userId: bankCUser.id },
    update: {},
    create: {
      userId: bankCUser.id,
      name: "Demo Finance Bank",
      shortName: "DFB",
      institutionCode: "DFB-IN-03",
      did: "did:bank:fin-003-inst",
      publicKey: bankCKeys.publicKey,
      role: "BOTH",
      status: "ACTIVE",
      accreditedDate: new Date("2024-11-12"),
    },
  });
  console.log(`✅ Seeded Bank C: ${bankC.name} (${bankC.did})`);

  // ─── 4. Customer: Rahul Sharma ──────────────────────────────────────────────
  const customerUser = await prisma.user.upsert({
    where: { email: "rahul.sharma@demo-identity.org" },
    update: {},
    create: {
      name: "Rahul Sharma",
      email: "rahul.sharma@demo-identity.org",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const customerKeys = cryptoService.generateKeyPair();
  const customer = await prisma.customerProfile.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      did: "did:demo:7f92a8c1e92d8471bb90a42f8",
      publicKey: customerKeys.publicKey,
      dateOfBirth: new Date("1992-05-15"),
      address: "402 Skyline Boulevard, Demo Tech Park, Bangalore 560103",
      documentType: "National ID (PAN)",
      documentNumberHash: cryptoService.hashDocumentNumber("ABCDE1234F"),
      identityStatus: "VERIFIED",
      kycStatus: "VERIFIED",
      keyStatus: "ACTIVE",
    },
  });
  console.log(`✅ Seeded Customer: ${customerUser.name} (${customer.did})`);

  // ─── 5. Initial Credential (KYC-2026-000184) ───────────────────────────────
  const credentialId = "KYC-2026-000184";
  const existingCred = await prisma.credential.findUnique({ where: { credentialId } });

  if (!existingCred) {
    const issuedAt = new Date("2026-08-10T10:00:00Z");
    const expiresAt = new Date("2027-08-10T10:00:00Z");

    const payload = {
      credentialId,
      subjectDid: customer.did,
      issuerDid: bankA.did,
      credentialType: "KYC Verification",
      assuranceLevel: "Tier-1 High Assurance",
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const credentialHash = cryptoService.hashCredentialPayload(payload);
    const signature = cryptoService.signHash(credentialHash, bankAKeys.privateKey);

    const credential = await prisma.credential.create({
      data: {
        credentialId,
        customerId: customer.id,
        issuerId: bankA.id,
        subjectDid: customer.did,
        issuerDid: bankA.did,
        credentialType: "KYC Verification",
        assuranceLevel: "Tier-1 High Assurance",
        credentialHash,
        signature,
        signatureAlgorithm: "ES256K",
        publicKey: bankAKeys.publicKey,
        status: "ACTIVE",
        issuedAt,
        expiresAt,
        blockchainRecord: {
          create: {
            credentialHash,
            transactionHash: "0x7f92a8c1e92d8471bb90a42f8e48f029a738c821bd82e91a5f4e19028cb48291",
            blockNumber: 4829100n,
            contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            network: "Ethereum (Sepolia Testnet)",
            registrationStatus: "CONFIRMED",
          },
        },
      },
    });

    console.log(`✅ Seeded Initial Credential: ${credential.credentialId}`);
  }

  console.log("🚀 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
