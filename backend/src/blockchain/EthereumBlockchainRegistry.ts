import { Contract, JsonRpcProvider, Wallet } from "ethers";
import type {
  BlockchainCredentialRecord,
  BlockchainRegistrationResult,
  BlockchainRevocationResult,
  BlockchainRegistry,
} from "@hack2ignite/shared/schemas/blockchain";
import {
  credentialIdToBytes32,
  sha256ToBytes32,
} from "../crypto/blockchainHash.js";
import { KYC_REGISTRY_ABI } from "./KYCRegistry.abi.js";

export interface EthereumBlockchainRegistryConfig {
  rpcUrl: string;
  contractAddress: string;
  privateKey: string;
  network?: string;
}

export class EthereumBlockchainRegistry
  implements BlockchainRegistry
{
  private readonly contract: Contract;
  private readonly contractAddress: string;
  private readonly network: string;

  constructor(config: EthereumBlockchainRegistryConfig) {
    const provider = new JsonRpcProvider(config.rpcUrl);
    const wallet = new Wallet(config.privateKey, provider);

    this.contract = new Contract(
      config.contractAddress,
      KYC_REGISTRY_ABI,
      wallet
    );
    this.contractAddress = config.contractAddress;
    this.network = config.network ?? "unknown";
  }

  async registerCredential(
    credentialId: string,
    credentialHash: string,
    issuer: string
  ): Promise<BlockchainRegistrationResult> {
    const blockchainCredentialId =
      credentialIdToBytes32(credentialId);

    const blockchainCredentialHash =
      sha256ToBytes32(credentialHash);

    const tx = await this.contract.getFunction("registerCredential")(
      blockchainCredentialId,
      blockchainCredentialHash,
      issuer
    );

    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Blockchain registration transaction was not mined");
    }

    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      contractAddress: this.contractAddress,
      network: this.network,
      registrationStatus: "CONFIRMED",
    };
  }

  async getCredential(
    credentialId: string
  ): Promise<BlockchainCredentialRecord> {
    const blockchainCredentialId =
      credentialIdToBytes32(credentialId);

    const result = await this.contract.getFunction("verifyCredential")(
      blockchainCredentialId
    );

    const issuedAt = Number(result[2]);

    if (issuedAt === 0) {
      return {
        credentialId,
        credentialHash: "",
        issuer: "",
        issuedAt: 0,
        status: "NOT_FOUND",
      };
    }

    return {
      credentialId,
      credentialHash: result[0],
      issuer: result[1],
      issuedAt,
      status: Number(result[3]) === 0
        ? "ACTIVE"
        : "REVOKED",
    };
  }

  async revokeCredential(
    credentialId: string
  ): Promise<BlockchainRevocationResult> {
    const blockchainCredentialId =
      credentialIdToBytes32(credentialId);

    const tx = await this.contract.getFunction("revokeCredential")(
      blockchainCredentialId
    );

    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error("Blockchain revocation transaction was not mined");
    }

    return {
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
    };
  }
}