export const blockchainConfig = {
  rpcUrl: process.env["BLOCKCHAIN_RPC_URL"] ?? "",
  privateKey: process.env["BLOCKCHAIN_PRIVATE_KEY"] ?? "",
  contractAddress: process.env["KYC_REGISTRY_ADDRESS"] ?? "",
  network: process.env["BLOCKCHAIN_NETWORK"] ?? "localhost",
};

export default blockchainConfig;