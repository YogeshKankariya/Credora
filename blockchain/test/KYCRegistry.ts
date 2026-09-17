import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("KYCRegistry", function () {
  async function deployRegistry() {
    const [issuer, otherAccount] = await ethers.getSigners();

    const registry = await ethers.deployContract("KYCRegistry");

    return {
      registry,
      issuer,
      otherAccount,
    };
  }

  it("registers a credential", async function () {
    const { registry, issuer } = await deployRegistry();

    const credentialId = ethers.id("credential-001");
    const credentialHash = ethers.id("credential-hash-001");

    await registry.registerCredential(
      credentialId,
      credentialHash,
      issuer.address
    );

    const record = await registry.verifyCredential(credentialId);

    expect(record[0]).to.equal(credentialHash);
    expect(record[1]).to.equal(issuer.address);
    expect(record[3]).to.equal(0n); // ACTIVE
  });

  it("rejects duplicate credential registration", async function () {
    const { registry, issuer } = await deployRegistry();

    const credentialId = ethers.id("credential-001");
    const credentialHash = ethers.id("credential-hash-001");

    await registry.registerCredential(
      credentialId,
      credentialHash,
      issuer.address
    );

    await expect(
      registry.registerCredential(
        credentialId,
        credentialHash,
        issuer.address
      )
    ).to.be.revertedWith("Credential already registered");
  });

  it("allows only the issuer to revoke", async function () {
    const { registry, issuer, otherAccount } = await deployRegistry();

    const credentialId = ethers.id("credential-001");
    const credentialHash = ethers.id("credential-hash-001");

    await registry.registerCredential(
      credentialId,
      credentialHash,
      issuer.address
    );

    await expect(
      registry
        .connect(otherAccount)
        .revokeCredential(credentialId)
    ).to.be.revertedWith("Only issuer can revoke");
  });

  it("revokes an active credential", async function () {
    const { registry, issuer } = await deployRegistry();

    const credentialId = ethers.id("credential-001");
    const credentialHash = ethers.id("credential-hash-001");

    await registry.registerCredential(
      credentialId,
      credentialHash,
      issuer.address
    );

    await registry.revokeCredential(credentialId);

    const record = await registry.verifyCredential(credentialId);

    expect(record[3]).to.equal(1n); // REVOKED
  });
});