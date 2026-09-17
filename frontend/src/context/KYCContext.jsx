import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers } from '../data/users';
import { initialBanks } from '../data/banks';
import { initialCredentials } from '../data/credentials';
import { initialVerificationHistory } from '../data/verificationHistory';

const KYCContext = createContext();

const STORAGE_KEYS = {
  USERS: 'decentralized_kyc_users',
  BANKS: 'decentralized_kyc_banks',
  CREDENTIALS: 'decentralized_kyc_credentials',
  HISTORY: 'decentralized_kyc_history',
  ROLE: 'decentralized_kyc_role',
  ACTIVE_CUSTOMER: 'decentralized_kyc_active_customer',
  ACTIVE_BANK: 'decentralized_kyc_active_bank',
};

export const KYCProvider = ({ children }) => {
  // Load from localStorage or fall back to initial data
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [banks, setBanks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANKS);
    return saved ? JSON.parse(saved) : initialBanks;
  });

  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    return saved ? JSON.parse(saved) : initialCredentials;
  });

  const [verificationHistory, setVerificationHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : initialVerificationHistory;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ROLE) || 'customer';
  });

  const [activeCustomerId, setActiveCustomerId] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CUSTOMER) || 'CUST-001';
  });

  const [activeBankId, setActiveBankId] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BANK) || 'BANK-001';
  });

  const [toasts, setToasts] = useState([]);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(verificationHistory));
  }, [verificationHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CUSTOMER, activeCustomerId);
  }, [activeCustomerId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BANK, activeBankId);
  }, [activeBankId]);

  // Toast helper
  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper getters
  const currentCustomer = users.find((u) => u.id === activeCustomerId) || users[0];
  const currentBank = banks.find((b) => b.id === activeBankId) || banks[0];
  const customerCredential = credentials.find((c) => c.customerId === currentCustomer.id);

  // Approve Customer KYC
  const approveCustomerKYC = (customerId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === customerId) {
          return {
            ...u,
            kycStatus: 'Verified',
            identityStatus: 'Verified',
            keyStatus: 'Hardware Enclave Secured',
          };
        }
        return u;
      })
    );
    addToast('KYC Verification Successful. Customer marked as Verified.', 'success');
  };

  // Reject Customer KYC
  const rejectCustomerKYC = (customerId, reason = 'Document clarification required') => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === customerId) {
          return {
            ...u,
            kycStatus: 'Rejected',
            identityStatus: 'Action Required',
          };
        }
        return u;
      })
    );
    addToast(`Customer KYC rejected: ${reason}`, 'error');
  };

  // Issue Credential
  const issueCredential = (customerId, issuingBank = 'Demo National Bank') => {
    const customer = users.find((u) => u.id === customerId);
    if (!customer) return null;

    const pad = (credentials.length + 184).toString().padStart(6, '0');
    const newCredentialId = `KYC-2026-${pad}`;
    const hexRandom = Math.random().toString(16).substring(2, 10);
    const hexTail = Math.random().toString(16).substring(2, 8);

    const newCred = {
      id: newCredentialId,
      subject: customer.name,
      customerId: customer.id,
      subjectDid: customer.did,
      issuer: issuingBank,
      issuerDid: 'did:bank:nat-001-sec',
      credentialType: 'KYC Verification',
      level: 'Tier-1 High Assurance',
      issuedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'ACTIVE',
      verificationCount: 0,
      credentialHash: `${hexRandom}e48f029a738c821bd82e91a5f4e19028cb482910a9c849182347${hexTail}`,
      shortHash: `${hexRandom}...${hexTail}`,
      signature: `MEQCID${hexRandom.slice(0, 4)}...valid...${hexTail.slice(0, 4)} Valid secp256k1`,
      signatureAlgorithm: 'ECDSA (secp256k1) + SHA-256',
      blockchainRegistration: 'Confirmed',
      blockchainTxHash: `0x${hexRandom}${hexTail}a99182374bb08291a8e847101859c01824761019a8274618293746a102`,
      blockNumber: 4829100 + credentials.length,
      revocationReason: null,
      revokedAt: null
    };

    setCredentials((prev) => [newCred, ...prev]);

    // Update customer's current credential id
    setUsers((prev) =>
      prev.map((u) => (u.id === customerId ? { ...u, currentCredentialId: newCredentialId, kycStatus: 'Verified' } : u))
    );

    // Add activity to history
    const historyEntry = {
      id: `VFY-${Date.now().toString().slice(-4)}`,
      credentialId: newCredentialId,
      subject: customer.name,
      institution: issuingBank,
      purpose: 'Initial Identity Audit & Credential Minting',
      timestamp: 'Just now',
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
    };
    setVerificationHistory((prev) => [historyEntry, ...prev]);

    addToast(`Credential ${newCredentialId} issued successfully!`, 'success');
    return newCred;
  };

  // Revoke Credential
  const revokeCredential = (credentialId, reason = 'Customer request or policy compliance refresh') => {
    const cred = credentials.find((c) => c.id === credentialId);
    if (!cred) return;

    const revokedTime = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setCredentials((prev) =>
      prev.map((c) =>
        c.id === credentialId
          ? {
              ...c,
              status: 'REVOKED',
              revocationReason: reason,
              revokedAt: revokedTime,
            }
          : c
      )
    );

    // Log history
    const historyEntry = {
      id: `VFY-${Date.now().toString().slice(-4)}`,
      credentialId: cred.id,
      subject: cred.subject,
      institution: cred.issuer,
      purpose: `Institutional Revocation Registry: ${reason}`,
      timestamp: 'Just now',
      result: 'REVOKED',
      status: 'FAIL',
      verifierDid: cred.issuerDid,
      checks: {
        structure: true,
        issuer: true,
        signature: true,
        hashIntegrity: true,
        blockchain: true,
        statusActive: false
      }
    };
    setVerificationHistory((prev) => [historyEntry, ...prev]);

    addToast(`Credential ${credentialId} revoked successfully. Future verifications will fail.`, 'warning');
  };

  // Verify Credential (used by Bank Verifier)
  const verifyCredentialRecord = (credentialId, verifierBankName = 'Demo Cooperative Bank', isTampered = false) => {
    const cleanId = (credentialId || '').trim();
    const cred = credentials.find((c) => c.id.toLowerCase() === cleanId.toLowerCase());

    if (!cred) {
      return {
        found: false,
        overall: 'FAIL',
        message: 'Credential not found on decentralized network registry.',
        checks: {
          structure: false,
          issuer: false,
          signature: false,
          hashIntegrity: false,
          blockchain: false,
          statusActive: false
        }
      };
    }

    // If tampered simulation is passed
    if (isTampered) {
      return {
        found: true,
        credential: cred,
        overall: 'FAIL',
        failureStep: 'signature',
        message: 'Credential hash mismatch: Payload content has been tampered with and digital signature is invalid.',
        checks: {
          structure: true,
          issuer: true,
          signature: false,
          hashIntegrity: false,
          blockchain: true,
          statusActive: cred.status === 'ACTIVE'
        }
      };
    }

    const isRevoked = cred.status === 'REVOKED';

    const result = {
      found: true,
      credential: cred,
      overall: isRevoked ? 'FAIL' : 'PASS',
      failureStep: isRevoked ? 'status' : null,
      message: isRevoked
        ? 'This credential cannot be accepted because it has been revoked by the issuing institution.'
        : 'Credential successfully verified on decentralized network.',
      checks: {
        structure: true,
        issuer: true,
        signature: true,
        hashIntegrity: true,
        blockchain: true,
        statusActive: !isRevoked
      }
    };

    // Increment count and record in history
    setCredentials((prev) =>
      prev.map((c) => (c.id === cred.id ? { ...c, verificationCount: c.verificationCount + 1 } : c))
    );

    const historyEntry = {
      id: `VFY-${Date.now().toString().slice(-4)}`,
      credentialId: cred.id,
      subject: cred.subject,
      institution: verifierBankName,
      purpose: 'Customer Cross-Institutional Onboarding',
      timestamp: 'Just now',
      result: isRevoked ? 'REJECTED' : 'VERIFIED',
      status: isRevoked ? 'FAIL' : 'PASS',
      verifierDid: 'did:bank:coop-002-vfy',
      checks: result.checks
    };

    setVerificationHistory((prev) => [historyEntry, ...prev]);

    return result;
  };

  // Reset to original synthetic defaults
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.BANKS);
    localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CUSTOMER);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_BANK);

    setUsers(initialUsers);
    setBanks(initialBanks);
    setCredentials(initialCredentials);
    setVerificationHistory(initialVerificationHistory);
    setCurrentRole('customer');
    setActiveCustomerId('CUST-001');
    setActiveBankId('BANK-001');

    addToast('Demo environment reset to initial synthetic state.', 'info');
  };

  return (
    <KYCContext.Provider
      value={{
        users,
        banks,
        credentials,
        verificationHistory,
        currentRole,
        setCurrentRole,
        activeCustomerId,
        setActiveCustomerId,
        activeBankId,
        setActiveBankId,
        currentCustomer,
        currentBank,
        customerCredential,
        approveCustomerKYC,
        rejectCustomerKYC,
        issueCredential,
        revokeCredential,
        verifyCredentialRecord,
        resetDemoData,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </KYCContext.Provider>
  );
};

export const useKYC = () => {
  const context = useContext(KYCContext);
  if (!context) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
};
