# Credora

### Decentralized Banking Identity & KYC Verification Platform

> **"Verify Once. Trust Across the Circle."**

---

**Team:** 404NotFound  
**Hackathon:** Hack2Ignite 2026  
**Organizer:** G H Raisoni International Skill Tech University  

---

## 1. Project Overview

**Credora** is a proof-of-concept decentralized identity and KYC verification platform engineered for participating financial institutions. In traditional banking, financial institutions conduct repetitive, paper-based, and expensive customer due diligence for the same customer. Credora demonstrates a reusable digital credential model utilizing an **off-chain/on-chain separation**:

1. **Bank A (Issuer):** Audits synthetic customer identity details, generates a digitally signed verifiable credential off-chain, and registers its cryptographic fingerprint (SHA-256 hash formatted as `bytes32`) on an Ethereum-compatible smart contract registry.
2. **Bank B (Verifier):** Independently evaluates the credential via a 6-point verification pipeline (checking payload structure, issuer authorization, ECDSA signature validity, hash integrity, on-chain registration, and active status) without requiring direct access to Bank A's internal customer database.
3. **On-Chain Revocation:** If a credential is compromised or revoked by the issuing institution, its status is updated to `REVOKED` on the smart contract registry and in the database, causing subsequent verification checks for active status to fail.

---

## 2. Problem Statement

Customer onboarding across modern financial institutions faces several structural challenges:

- **Redundant Customer Due Diligence:** Customers must repeatedly produce and upload identity documentation (PAN, national IDs, addresses) every time they open an account or engage with a new bank.
- **High Operational Costs:** Institutions bear substantial recurring expenses for document validation, manual review, and third-party verification agencies.
- **Centralized Data Exposure:** Repeatedly transferring and storing raw identity documents across multiple institutional silos increases the risk of data breaches and credential theft.
- **Fragmented Revocation Information:** When an identity credential is found to be compromised or invalid at one institution, other institutions lack an independent mechanism to detect that the credential is no longer active.

---

## 3. Proposed Solution

Credora establishes a shared trust circle among institutions using public-key cryptography and a minimal smart contract registry:

- **Strict Off-Chain / On-Chain Separation:** Personally Identifiable Information (PII) and raw identity attributes remain strictly off-chain in private institutional storage (PostgreSQL in this prototype). PII is never recorded on the blockchain.
- **Cryptographic Anchoring:** The smart contract registry stores only a non-reversible `bytes32` hash of the credential payload, the issuer's Ethereum address, an issuance timestamp, and a status enum (`ACTIVE` or `REVOKED`).
- **Independent 6-Point Verification:** Relying institutions verify credentials mathematically using public-key cryptography (ECDSA secp256k1) and compare the hash directly against the blockchain registry without querying the issuing bank's private records.

---

## 4. Key Features

- **Lifecycle Workflow:** Demonstrates the end-to-end flow: Customer Registration → Bank A Review & Approval → Off-Chain Credential Signing → Smart Contract Registration → Bank B Independent Verification → Credential Revocation.
- **6-Point Verification Pipeline:**
  1. **Structure Check:** Validates canonical payload schema and essential metadata fields.
  2. **Issuer Check:** Confirms the issuing entity exists in the accredited institution registry with status `ACTIVE` and an appropriate role (`ISSUER` or `BOTH`).
  3. **Signature Check:** Validates the ECDSA secp256k1 digital signature against the issuer's public key.
  4. **Hash Integrity Check:** Recomputes the canonical SHA-256 payload hash and confirms it matches the stored hash.
  5. **Blockchain Registry Check:** Verifies the credential exists on-chain, the on-chain hash matches the application hash, and the issuer address matches the registered authority.
  6. **Active Status Check:** Enforces that the database record is `ACTIVE`, expiration is in the future, no revocation record exists, and the on-chain status is `ACTIVE`.
- **Smart Contract Revocation:** Smart contract (`KYCRegistry.sol`) restricts revocation authority to the original registering issuer address (`require(msg.sender == credential.issuer)`).
- **Verifier-Isolated Audit Logging:** Each verification attempt is logged in PostgreSQL with individual boolean flags for all six verification checks. Access to history (`GET /api/verification/history`) is scoped to the authenticated verifier's user ID.
- **Interactive Multi-Role Portal:** Provides distinct interfaces for Customers, Bank A (Issuer), and Bank B (Verifier) with pre-seeded demonstration accounts.

---

## 📸 Prototype Screenshots

### 1. Landing Page & Lifecycle Overview
![Landing Page](docs/screenshots/01-landing-page.png)
*Credora landing page highlighting the "Verify once. Trust many times." value proposition and the verifiable banking credential lifecycle.*

### 2. Customer Identity Wallet & Dashboard
![Customer Dashboard](docs/screenshots/02-customer-dashboard.png)
*Customer portal showing identity verification status, decentralized identifier (DID), active KYC credential, and issuing bank details.*

### 3. Verifiable KYC Credential Details
![Credential Details](docs/screenshots/03-credential-details.png)
*Cryptographically signed verifiable credential displaying the SHA-256 payload hash, ECDSA secp256k1 digital signature, and blockchain anchor status.*

### 4. Bank A (Issuer) — Pending KYC Review Queue
![Bank A Pending KYC](docs/screenshots/04-bank-a-pending-kyc.png)
*Bank A compliance officer dashboard reviewing synthetic customer profile details and document OCR verification before approval.*

### 5. Bank A (Issuer) — Issued Credential & Registry Anchor
![Bank A Issued Credential](docs/screenshots/05-bank-a-issued-credential.png)
*Bank A interface confirming successful credential minting, status activation, and registry anchoring on the smart contract.*

### 6. Bank B (Verifier) — Independent 6-Point Verification (Pass)
![Bank B Verification Pass](docs/screenshots/06-bank-b-verification-pass.png)
*Bank B verifier portal demonstrating successful execution of all six cryptographic audit checks without querying Bank A's private database.*

### 7. Tamper Detection & Integrity Failure Demo
![Tampering Detection](docs/screenshots/07-tampering-detection.png)
*Demonstration of instant cryptographic tamper detection: altering customer data causes the recomputed SHA-256 hash to diverge and signature verification to fail immediately.*

---

## 5. System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Layer (React / Vite)"]
        CustomerUI["Customer Portal"]
        BankAUI["Bank A (Issuer Portal)"]
        BankBUI["Bank B (Verifier Portal)"]
    end

    subgraph Backend["API Layer (Node.js / Express / TypeScript)"]
        AuthRouter["Auth & Role Middleware"]
        CredService["Credential Service"]
        KYCService["KYC Service"]
        VerifyService["6-Point Verification Service"]
        BlockService["Blockchain Service & Registry Adapter"]
    end

    subgraph OffChain["Off-Chain Storage (PostgreSQL / Prisma)"]
        UserTable[("Users & Profiles")]
        CredTable[("Credentials & Signatures")]
        RevokeTable[("Revocations")]
        AuditTable[("Verification Logs")]
    end

    subgraph OnChain["On-Chain Registry (Ethereum / Hardhat)"]
        Contract["KYCRegistry.sol\n- credentialId (bytes32)\n- credentialHash (bytes32)\n- issuer (address)\n- status (ACTIVE | REVOKED)"]
    end

    CustomerUI -->|Register & View Profile| AuthRouter
    BankAUI -->|Approve KYC| KYCService
    BankAUI -->|Issue Credential| CredService
    CredService -->|Store Off-Chain Credential| CredTable
    CredService -->|Register Hash & ID| BlockService
    BlockService -->|registerCredential| Contract

    BankBUI -->|Verify Credential| VerifyService
    VerifyService -->|Read Credential & Status| CredTable
    VerifyService -->|Query On-Chain Record| BlockService
    BlockService -->|verifyCredential| Contract
    VerifyService -->|Log Verification Attempt| AuditTable

    BankAUI -->|Revoke Credential| BlockService
    BlockService -->|revokeCredential| Contract
    BlockService -->|Update Status & Record| RevokeTable
```

### Off-Chain vs. On-Chain Separation

| Data Element | Stored Off-Chain (PostgreSQL) | Stored On-Chain (`KYCRegistry.sol`) | Purpose |
| :--- | :---: | :---: | :--- |
| Customer Name, DOB, Address | **Yes** | **No** | Privacy protection; sensitive PII is kept off-chain |
| Document Number Hash | **Yes** | **No** | Document identity verification without plain text storage |
| Canonical Credential Payload | **Yes** | **No** | Full credential payload retained off-chain |
| ECDSA secp256k1 Signature | **Yes** | **No** | Digital signature verified using issuer public key |
| Credential ID (`bytes32`) | **Yes** | **Yes** | Unique identifier linking off-chain record to on-chain proof |
| Credential Hash (`bytes32`) | **Yes** | **Yes** | Tamper-evident cryptographic fingerprint |
| Issuer Address (`address`) | **Yes** | **Yes** | Authority identifier for issuance and revocation checks |
| Credential Status (`ACTIVE`/`REVOKED`) | **Yes** | **Yes** | Current lifecycle status recorded on-chain and in database |

---

## 6. End-to-End Workflow

1. **Customer Registration:**  
   The customer creates an account via `POST /api/auth/register`. A `CustomerProfile` is generated with initial status `kycStatus: "PENDING"`.
2. **Bank A Review & KYC Approval:**  
   Bank A reviews the submitted customer application and calls `POST /api/kyc/:customerId/approve`, updating `kycStatus = "VERIFIED"` and `identityStatus = "VERIFIED"`.
3. **Off-Chain Credential Minting:**  
   Bank A calls `POST /api/credentials` with the customer's profile UUID. The service compiles a canonical payload, computes its SHA-256 hash, and signs the hash using Bank A's private key (`ES256K`).
4. **On-Chain Blockchain Registration:**  
   The backend translates the SHA-256 hash to a 0x-prefixed `bytes32` value via `sha256ToBytes32()` and invokes `KYCRegistry.sol::registerCredential()`. The confirmed transaction hash and block number are saved in the database.
5. **Bank B Independent Verification:**  
   Bank B requests verification via `POST /api/verification/verify`. The verification service executes the 6-point verification sequence. When all checks pass, the overall result is `"PASS"`.
6. **Credential Revocation:**  
   When Bank A revokes a credential via `POST /api/credentials/:credentialId/revoke`, the controller verifies institution ownership, invokes `KYCRegistry.sol::revokeCredential()` on-chain, and executes a PostgreSQL transaction updating `Credential.status = "REVOKED"` and creating a `Revocation` record.
7. **Re-Verification Behavior:**  
   When Bank B verifies the revoked credential again, Checks 1–5 (Structure, Issuer, Signature, Hash Integrity, and Blockchain Registry existence) evaluate whether the credential was authentically created and anchored. However, **Check 6 (Status Active)** evaluates both database status and on-chain status (`onChainStatus === "ACTIVE"`). Because the credential was marked `REVOKED`, Check 6 fails, and the overall verification result returns `"FAIL"`.

---

## 7. Technology Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS, Lucide Icons, React Router DOM v6
- **Backend API:** Node.js, Express 5, TypeScript 7, Zod validation, bcrypt, jsonwebtoken, CORS, dotenv
- **Database & ORM:** PostgreSQL 16 (via Docker or local instance), Prisma ORM 6
- **Blockchain & Smart Contracts:** Solidity `^0.8.34`, Hardhat 3, Hardhat Toolbox, Ethers.js v6
- **Cryptography:** ECDSA (secp256k1) signatures, SHA-256 hashing (`crypto` module & `blockchainHash.ts`)
- **Testing & Tooling:** Vitest 5, Mocha/Chai (Hardhat test suite)

---

## 8. Repository Structure

```text
Credora/
├── package.json               # Root workspace configuration (npm workspaces)
├── docker-compose.yml         # Local PostgreSQL 16 container definition
├── README.md                  # Project documentation
│
├── backend/                   # Node.js + Express + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema (User, CustomerProfile, Credential, etc.)
│   │   └── seed.ts            # Database seed script with demo personas
│   ├── src/
│   │   ├── app.ts             # Express app setup and middleware configuration
│   │   ├── server.ts          # Server entry point and database connection management
│   │   ├── blockchain/        # EthereumBlockchainRegistry adapter & ABI bindings
│   │   ├── config/            # Database and blockchain environment configuration
│   │   ├── controllers/       # Auth, Credential, Verification, and Revocation controllers
│   │   ├── crypto/            # Hash utilities (blockchainHash.ts) & crypto service
│   │   ├── middleware/        # JWT auth and role validation middleware
│   │   ├── routes/            # Express route declarations
│   │   ├── services/          # Verification, credential, blockchain, and KYC services
│   │   └── utils/             # API response and parameter helpers
│   ├── package.json           # Backend dependencies and scripts
│   └── .env.example           # Backend environment variable template
│
├── blockchain/                # Smart contract & Hardhat environment
│   ├── contracts/
│   │   └── KYCRegistry.sol    # Smart contract for credential registry and revocation
│   ├── scripts/
│   │   └── deploy.ts          # Contract deployment script
│   ├── test/
│   │   └── KYCRegistry.ts     # Smart contract test suite
│   ├── hardhat.config.ts      # Hardhat configuration
│   └── package.json           # Blockchain dependencies and scripts
│
├── frontend/                  # React + Vite web application
│   ├── src/
│   │   ├── components/        # Common UI components, modals, and status badges
│   │   ├── context/           # KYCContext.jsx (application state and API integration)
│   │   ├── pages/             # Customer, Issuer (Bank A), and Verifier (Bank B) views
│   │   └── services/          # HTTP API client (api.js)
│   ├── package.json           # Frontend dependencies and scripts
│   └── vite.config.js         # Vite configuration
│
└── shared/                    # Shared TypeScript schemas & interfaces
    └── schemas/
        └── blockchain.ts      # BlockchainRegistry interface and shared types
```

---

## 9. Getting Started / Local Setup

Follow these steps to run the complete stack locally. Each long-running service should run in its own terminal window.

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Docker Desktop:** Optional; used if running PostgreSQL via `docker-compose.yml` (a local PostgreSQL service on port 5432 can be used instead)
- **Git**

### Installation

Clone the repository and install workspace dependencies:

```bash
git clone https://github.com/YogeshKankariya/Credora.git
cd Credora
npm install
```

---

### Step 1: Start Database (Terminal 1)

Using Docker from the project root:

```bash
docker compose up -d postgres
```

*Note: If running a local PostgreSQL instance without Docker, ensure a database named `kyc_db` exists and is accessible with credentials matching your backend configuration.*

---

### Step 2: Start Local Blockchain & Deploy Contract (Terminal 2)

1. Start the local Hardhat node:
   ```bash
   cd blockchain
   npx hardhat node
   ```
   *Keep this process running. The local JSON-RPC server will listen at `http://127.0.0.1:8545` and display local test accounts and private keys.*

2. In a second terminal, compile and deploy the `KYCRegistry` contract:
   ```bash
   cd blockchain
   npx hardhat compile
   npx hardhat run scripts/deploy.ts --network localhost
   ```
   *Note the printed contract address (e.g. `KYCRegistry deployed to: 0x...`) for your backend `.env` configuration.*

---

### Step 3: Configure Environment & Start Backend (Terminal 3)

1. Create `backend/.env` from the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*

2. Open `backend/.env` and configure local values:
   - Ensure `DATABASE_URL` matches your PostgreSQL connection.
   - Set `BLOCKCHAIN_RPC_URL="http://127.0.0.1:8545"`.
   - Set `BLOCKCHAIN_PRIVATE_KEY` to one of the local test account private keys displayed by the Hardhat node.
   - Set `KYC_REGISTRY_ADDRESS` to the address output by `deploy.ts`.
   - Set `ISSUER_PRIVATE_KEY` and `ISSUER_PUBLIC_KEY` for off-chain credential signing (PEM format; or leave blank to use auto-generated ephemeral development keys).

3. Run database migrations and seed demo data:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend starts on `http://localhost:5000` (Health check: `http://localhost:5000/health`).*

---

### Step 4: Start Frontend Application (Terminal 4)

From the project root:

```bash
cd frontend
npm run dev
```

*Open your browser and navigate to `http://localhost:5173`.*

---

### Running Automated Tests

Run backend unit and controller tests:

```bash
cd backend
npx vitest run
```

Run smart contract tests:

```bash
cd blockchain
npx hardhat test
```

---

## 10. Environment Configuration

### Backend Environment Variables (`backend/.env`)

| Variable Name | Purpose | Example Value (Safe Placeholder) |
| :--- | :--- | :--- |
| `PORT` | Port on which the Express server listens | `5000` |
| `NODE_ENV` | Application environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:<password>@localhost:5432/kyc_db?schema=public` |
| `JWT_SECRET` | Secret key used to sign session tokens | `<your_jwt_secret_min_32_characters>` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `CLIENT_URL` | Allowed CORS origin for the frontend | `http://localhost:5173` |
| `BLOCKCHAIN_RPC_URL` | JSON-RPC provider URL | `http://127.0.0.1:8545` |
| `BLOCKCHAIN_PRIVATE_KEY` | Hex private key used by backend to sign registry transactions | `<local_test_account_private_key_hex>` |
| `KYC_REGISTRY_ADDRESS` | Deployed address of `KYCRegistry.sol` | `<deployed_contract_address_0x...>` |
| `BLOCKCHAIN_NETWORK` | Label for the target blockchain network | `localhost` |
| `ISSUER_PRIVATE_KEY` | PEM-encoded ECDSA (secp256k1) private key (PKCS#8) for off-chain credential signing | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"` |
| `ISSUER_PUBLIC_KEY` | PEM-encoded ECDSA (secp256k1) public key (SPKI) corresponding to `ISSUER_PRIVATE_KEY` | `"-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"` |

### Notes on Local Keys

- **`BLOCKCHAIN_PRIVATE_KEY`:** When running `npx hardhat node`, Hardhat outputs 20 pre-funded test accounts with their private keys. Select one of these local keys for local development. Never use mainnet keys or real funds.
- **`ISSUER_PRIVATE_KEY` & `ISSUER_PUBLIC_KEY`:** These represent the institution's signing key pair used off-chain by `cryptoService.signHash()` and `cryptoService.verifySignature()`. They must be PEM-encoded EC keys (secp256k1 curve with PKCS#8 private key encoding and SPKI public key encoding), not hex strings. If `ISSUER_PRIVATE_KEY` is omitted in `backend/.env`, `credential.service.ts` falls back to generating an ephemeral key pair at runtime for development and testing.
- **Fallback Behavior:** If `BLOCKCHAIN_RPC_URL`, `BLOCKCHAIN_PRIVATE_KEY`, or `KYC_REGISTRY_ADDRESS` are not configured, `blockchainService` defaults to an in-memory `MockBlockchainRegistry` for lightweight local testing.

---

## 11. Demo Walkthrough

The platform includes pre-seeded demonstration accounts:

| Role | Email | Password | Identifier / Code |
| :--- | :--- | :--- | :--- |
| **Bank A (Issuer)** | `issuer@demobank.com` | `Password123!` | Demo National Bank (`DNB-IN-BB`) |
| **Bank B (Verifier)** | `verifier@demobank.com` | `Password123!` | Demo Cooperative Bank (`DCB-IN-02`) |
| **Bank C (Both)** | `finance@demobank.com` | `Password123!` | Demo Finance Bank (`DFB-IN-03`) |
| **Customer** | `rahul.sharma@demo-identity.org` | `Password123!` | Rahul Sharma |

*Note on Seeded Credential:* `seed.ts` creates initial record `KYC-2026-000184` in the database. For full on-chain verification of new credentials, use the UI flow below to issue a fresh credential anchored to your running Hardhat contract.

### Suggested Demonstration Script

1. **Customer Step:**  
   Log in as Customer (or register a new customer profile). Review identity attributes stored in the off-chain customer profile.
2. **Bank A (Issuer) Approval & Credential Issuance:**  
   Switch to **Bank A**. Open the KYC review queue, approve the customer's pending KYC (`POST /api/kyc/:customerId/approve`), and open the Issue Credential view. Click **Issue Credential**. The backend generates the canonical payload, signs the hash with Bank A's private key, registers the hash on `KYCRegistry.sol`, and returns the minted credential.
3. **Bank B (Verifier) Independent Verification:**  
   Switch to **Bank B**. Navigate to the Verification view, enter the credential ID, and run verification. All 6 check indicators evaluate to `true`, resulting in an overall status of `"PASS"`.
4. **Bank A Credential Revocation:**  
   Switch back to **Bank A**. Select the issued credential and submit a revocation reason. The smart contract executes `revokeCredential()`, and the database updates `Credential.status = "REVOKED"` with the transaction reference.
5. **Bank B Re-Verification:**  
   Return to **Bank B** and verify the credential again. Checks 1–5 succeed (validating origin and payload integrity), while **Check 6 (Status Active)** fails due to the `REVOKED` status on-chain and in the database. The overall result returns `"FAIL"`.

---

## 12. Security & Privacy Considerations

- **Data Minimization:** No customer PII is stored on-chain. Only cryptographic hashes, timestamps, status values, and Ethereum addresses are anchored to the contract.
- **Integrity Validation:** Any alteration to customer profile attributes or credential fields causes SHA-256 hash recalculation (Check 4) or signature verification (Check 3) to fail.
- **Tenant Authorization:** The revocation controller checks that the authenticated user belongs to the institution that issued the credential (`institution.id === credential.issuerId`) before initiating a revocation transaction.
- **Verifier Scoping:** Verification history endpoints filter queries by the authenticated user's ID (`where: { verifierId }`) to prevent unauthorized cross-institution log retrieval.

---

## 13. Scope & Limitations

- **Prototype Context:** This project is a proof-of-concept developed for Hack2Ignite 2026; it is not intended for production financial infrastructure or regulatory compliance.
- **Synthetic Data:** Uses synthetic identity attributes for demonstration purposes; it does not connect to actual government identity registries (e.g. UIDAI, DigiLocker).
- **Custodial Backend Relay:** The prototype uses a configured backend wallet to relay smart contract transactions rather than browser-based Web3 wallets (MetaMask).
- **Network Scope:** Tested and designed for local Ethereum test environments (Hardhat).

---

## 14. Future Enhancements

- [ ] **Zero-Knowledge Proofs (zk-SNARKs):** Enable selective disclosure (e.g. Proving age threshold without revealing date of birth).
- [ ] **W3C Verifiable Credentials (VC) Compliance:** Align credential JSON schemas with formal W3C VC and DID standards.
- [ ] **Decentralized Document Storage:** Evaluate encrypted decentralized storage networks for off-chain credential exchange.
- [ ] **Client-Side Signatures:** Enable end-user hardware key or mobile wallet signing for credential presentation.

---

## 15. Team: 404NotFound

Developed by **Team 404NotFound** for **Hack2Ignite 2026** at **G H Raisoni International Skill Tech University**:

1. **Yogesh Kankariya**
2. **Harshwardhan Mehetre**
3. **Nandini Srivastava**
4. **Khushi Yadav**

---

## 16. Demo Links & Video

- **Live Demonstration:** *[To be updated upon deployment]*
- **Video Walkthrough:** [Watch Credora Video Walkthrough](https://youtu.be/I_iYFgWi7D4)
- **Project Repository:** [https://github.com/YogeshKankariya/Credora](https://github.com/YogeshKankariya/Credora)

---

## 17. License

This project is developed as a hackathon submission and prototype for Hack2Ignite 2026. The repository is private and does not include a root open-source license file (sub-package manifests such as `backend/package.json` declare development licenses for their respective dependencies).
