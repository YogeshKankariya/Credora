import { describe, expect, it } from "vitest";
import {
  credentialIdToBytes32,
  isBytes32,
  sha256Hex,
  sha256ToBytes32,
} from "./blockchainHash.js";

describe("blockchain hash utilities", () => {
  it("converts a credential ID deterministically to bytes32", () => {
    const first = credentialIdToBytes32("KYC-2026-0001");
    const second = credentialIdToBytes32("KYC-2026-0001");

    expect(first).toBe(second);
    expect(isBytes32(first)).toBe(true);
  });

  it("produces different IDs for different credential IDs", () => {
    const first = credentialIdToBytes32("KYC-2026-0001");
    const second = credentialIdToBytes32("KYC-2026-0002");

    expect(first).not.toBe(second);
  });

  it("calculates a deterministic SHA-256 hash", () => {
    const hash = sha256Hex("test-payload");

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("converts a SHA-256 hash to bytes32", () => {
    const hash = sha256Hex("test-payload");
    const bytes32 = sha256ToBytes32(hash);

    expect(bytes32).toHaveLength(66);
    expect(isBytes32(bytes32)).toBe(true);
  });

  it("accepts a SHA-256 hash with 0x prefix", () => {
    const hash = `0x${sha256Hex("test-payload")}`;

    expect(sha256ToBytes32(hash)).toBe(hash);
  });

  it("rejects an invalid SHA-256 hash", () => {
    expect(() => sha256ToBytes32("invalid")).toThrow();
  });

  it("rejects an empty credential ID", () => {
    expect(() => credentialIdToBytes32("")).toThrow();
  });
});