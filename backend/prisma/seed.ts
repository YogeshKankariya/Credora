import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/database.js";
import { cryptoService } from "../src/services/crypto.service.js";

async function main() {
  console.log("🌱 Cleaning and seeding database with fresh, minimal data...");

  // Password for all demo accounts: Password123!
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // ─── 0. Wipe existing verification logs, revocations, and credentials ─────────
  await prisma.verificationLog.deleteMany({});
  await prisma.revocation.deleteMany({});
  await prisma.blockchainRecord.deleteMany({});
  await prisma.credential.deleteMany({});
  console.log("🧹 Cleared all credentials, revocations, and verification logs.");

  // Remove Bank C if it exists
  const bankCUser = await prisma.user.findUnique({ where: { email: "finance@demobank.com" } });
  if (bankCUser) {
    await prisma.institutionProfile.deleteMany({ where: { userId: bankCUser.id } });
    await prisma.user.delete({ where: { id: bankCUser.id } });
    console.log("🧹 Removed Bank C (Demo Finance Bank).");
  }

  // ─── 1. Bank A (Issuer: Demo National Bank) ──────────────────────────────────
  const bankAUser = await prisma.user.upsert({
    where: { email: "issuer@demobank.com" },
    update: { passwordHash },
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
    update: {
      name: "Demo National Bank",
      shortName: "DNB",
      institutionCode: "DNB-IN-BB",
      role: "ISSUER",
      status: "ACTIVE",
    },
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
    update: { passwordHash },
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
    update: {
      name: "Demo Cooperative Bank",
      shortName: "DCB",
      institutionCode: "DCB-IN-02",
      role: "VERIFIER",
      status: "ACTIVE",
    },
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

  // ─── 3. Customer: Rahul Sharma (Fresh, Pending KYC, No Credential) ───────────
  const customerUser = await prisma.user.upsert({
    where: { email: "rahul.sharma@demo-identity.org" },
    update: {
      name: "Rahul Sharma",
      passwordHash,
    },
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
    update: {
      identityStatus: "CREATED",
      kycStatus: "PENDING",
      keyStatus: "ACTIVE",
    },
    create: {
      userId: customerUser.id,
      did: "did:demo:7f92a8c1e92d8471bb90a42f8",
      publicKey: customerKeys.publicKey,
      dateOfBirth: new Date("1992-05-15"),
      address: "402 Skyline Boulevard, Demo Tech Park, Bangalore 560103",
      documentType: "National ID (PAN)",
      documentNumberHash: cryptoService.hashDocumentNumber("ABCDE1234F"),
      identityStatus: "CREATED",
      kycStatus: "PENDING",
      keyStatus: "ACTIVE",
    },
  });
  console.log(`✅ Seeded Customer: ${customerUser.name} (${customer.did}) — KYC Status: PENDING, No Credentials`);

  console.log("🚀 Fresh database seeding completed successfully! Only Bank A, Bank B, and Rahul Sharma exist.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
