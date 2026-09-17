import type { BlockchainRegistry } from "@hack2ignite/shared/schemas/blockchain";
import { canonicalizeCredential, hashCredential } from "./credential.canonical.js";
import type { Credential } from "./credential.schema.js";
import type { IssuerContext } from "./issuer.js";

export interface CredentialSigner {
  sign(payload: string): Promise<string>;
}

export interface IssuedCredential extends Credential {
  signature: {
    algorithm: string;
    value: string;
  };
}

export interface CredentialServiceDependencies {
  signer: CredentialSigner;
  blockchain: BlockchainRegistry;
}

export class CredentialService {
  constructor(
    private readonly dependencies: CredentialServiceDependencies,
  ) {}

  async issue(
    credential: Credential,
    issuer: IssuerContext,
  ): Promise<IssuedCredential> {
    if (credential.issuer.did !== issuer.did) {
      throw new Error("Credential issuer DID does not match issuer context");
    }

    const canonicalPayload = canonicalizeCredential(credential);
    const credentialHash = hashCredential(credential);

    const signature = await this.dependencies.signer.sign(
      canonicalPayload,
    );

    const issuedCredential: IssuedCredential = {
      ...credential,
      signature: {
        algorithm: "SHA256",
        value: signature,
      },
    };

    await this.dependencies.blockchain.registerCredential(
      credential.credentialId,
      credentialHash,
      issuer.blockchainAddress,
    );

    return issuedCredential;
  }
}