export const initialVerificationHistory = [
  {
    id: 'VFY-9021',
    credentialId: 'KYC-2026-000184',
    subject: 'Rahul Sharma',
    institution: 'Demo Cooperative Bank',
    purpose: 'New High-Yield Savings Account Onboarding',
    timestamp: 'Today, 11:42 AM',
    result: 'VERIFIED',
    status: 'PASS',
    verifierDid: 'did:bank:coop-002-vfy',
    checks: {
      structure: true,
      issuer: true,
      signature: true,
      hashIntegrity: true,
      blockchain: true,
      statusActive: true
    }
  },
  {
    id: 'VFY-8840',
    credentialId: 'KYC-2026-000184',
    subject: 'Rahul Sharma',
    institution: 'Demo Finance Bank',
    purpose: 'Mortgage Loan Pre-Approval Evaluation',
    timestamp: 'Yesterday, 3:18 PM',
    result: 'VERIFIED',
    status: 'PASS',
    verifierDid: 'did:bank:fin-003-inst',
    checks: {
      structure: true,
      issuer: true,
      signature: true,
      hashIntegrity: true,
      blockchain: true,
      statusActive: true
    }
  },
  {
    id: 'VFY-8102',
    credentialId: 'KYC-2026-000184',
    subject: 'Rahul Sharma',
    institution: 'Demo National Bank',
    purpose: 'Initial Identity Audit & Credential Minting',
    timestamp: '12 Sep 2026, 10:15 AM',
    result: 'ISSUED',
    status: 'PASS',
    verifierDid: 'did:bank:nat-001-sec',
    checks: {
      structure: true,
      issuer: true,
      signature: true,
      hashIntegrity: true,
      blockchain: true,
      statusActive: true
    }
  },
  {
    id: 'VFY-7941',
    credentialId: 'KYC-2026-000185',
    subject: 'Priya Mehta',
    institution: 'Demo Cooperative Bank',
    purpose: 'Commercial Trading Account Activation',
    timestamp: '15 Sep 2026, 02:40 PM',
    result: 'VERIFIED',
    status: 'PASS',
    verifierDid: 'did:bank:coop-002-vfy',
    checks: {
      structure: true,
      issuer: true,
      signature: true,
      hashIntegrity: true,
      blockchain: true,
      statusActive: true
    }
  }
];
