// Blockchain config — will be populated when ethers.js integration begins
export const blockchainConfig = {
  rpcUrl: process.env["BLOCKCHAIN_RPC_URL"] ?? "",
  privateKey: process.env["BLOCKCHAIN_PRIVATE_KEY"] ?? "",
  contractAddress: process.env["CONTRACT_ADDRESS"] ?? "",
  network: process.env["BLOCKCHAIN_NETWORK"] ?? "localhost",
};

export default blockchainConfig;
