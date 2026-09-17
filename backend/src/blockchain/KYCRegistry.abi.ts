export const KYC_REGISTRY_ABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "credentialId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "credentialHash",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "issuer",
        type: "address",
      },
    ],
    name: "registerCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "credentialId",
        type: "bytes32",
      },
    ],
    name: "verifyCredential",
    outputs: [
      {
        internalType: "bytes32",
        name: "credentialHash",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "issuedAt",
        type: "uint256",
      },
      {
        internalType: "enum KYCRegistry.Status",
        name: "status",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "credentialId",
        type: "bytes32",
      },
    ],
    name: "revokeCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;