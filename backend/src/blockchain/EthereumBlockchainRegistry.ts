import { Contract, JsonRpcProvider, Wallet } from "ethers";
import type {
  BlockchainCredentialRecord,
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
}

export class EthereumBlockchainRegistry
  implements BlockchainRegistry
{
  private readonly contract: Contract;

  constructor(config: EthereumBlockchainRegistryConfig) {
    const provider = new JsonRpcProvider(config.rpcUrl);
    const wallet = new Wallet(config.privateKey, provider);

    this.contract = new Contract(
      config.contractAddress,
      KYC_REGISTRY_ABI,
      wallet
    );
  }

  async registerCredential(
    credentialId: string,
    credentialHash: string,
    issuer: string
  ): Promise<void> {
    const blockchainCredentialId =
      credentialIdToBytes32(credentialId);

    const blockchainCredentialHash =
      sha256ToBytes32(credentialHash);

    const tx = await this.contract.getFunction("registerCredential")(
      blockchainCredentialId,
      blockchainCredentialHash,
      issuer
    );

    await tx.wait();
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
  ): Promise<void> {
    const blockchainCredentialId =
      credentialIdToBytes32(credentialId);

    const tx = await this.contract.getFunction("revokeCredential")(
      blockchainCredentialId
    );

    await tx.wait();
  }
}