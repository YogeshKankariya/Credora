# Blockchain Specification

**Project:** Credora — Decentralized Banking Identity & KYC Verification Platform  
**Team:** 404NotFound  
**Hackathon:** Hack2Ignite 2026  
**Version:** 1.0  
**Status:** Frozen for MVP  
**Owner:** Blockchain + Integration Owner

---

## 1. Purpose

The blockchain layer provides a minimal, tamper-evident registry for issued KYC credentials.

The blockchain MUST NOT store KYC personally identifiable information (PII).

The blockchain stores only:

- Credential identifier
- Credential hash
- Issuer blockchain address
- Issuance timestamp
- Credential status

The complete credential remains off-chain.

---

## 2. Architecture

```text
React Frontend
      |
      | REST / JSON
      v
Express Backend
      |
      v
Application Services
      |
      +--------------------+
      |                    |
      v                    v
PostgreSQL          Blockchain Adapter
                           |
                           v
                    KYCRegistry.sol
                           |
                           v
                  Ethereum-compatible
                    local/test network