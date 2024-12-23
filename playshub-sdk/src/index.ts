import {
  createWalletClient,
  formatEther,
  Hex,
  http,
  parseAbi,
  parseEther,
  publicActions,
  WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

export interface BscUnitySdkConfig {
  privateKey: string;
  purchaseItemAddress: string;

  rpcUrl: string;
}

export default class BscUnitySdk {
  private config: BscUnitySdkConfig;
  private walletClient: WalletClient;

  constructor(config: BscUnitySdkConfig) {
    console.log("-----------BscUnitySdkConfig initialized-----------");
    console.log("config:", config);

    if (config.privateKey != "null") {
      const account = privateKeyToAccount(config.privateKey as Hex);

      const walletClient = createWalletClient({
        transport: http(config.rpcUrl),
        account,
      });

      this.walletClient = walletClient;
    }

    this.config = config;
  }

  purchaseItem = async (userId: string, itemId: string) => {
    try {
      if (this.config.privateKey == "null") {
        throw new Error("Private key is not set");
      }

      const [_, __, amount] = await this.walletClient
        .extend(publicActions)
        .readContract({
          address: this.config.purchaseItemAddress as Hex,
          abi: parseAbi([
            "function getItem(uint256 id) external view returns (uint256, string, uint256, uint8)",
          ]),
          functionName: "getItem",
          args: [BigInt(itemId)],
        });

      if ((await this.getBalance()) < parseFloat(formatEther(amount))) {
        throw new Error("Insufficient balance");
      }

      console.log("Purchasing...");
      const { request } = await this.walletClient
        .extend(publicActions)
        .simulateContract({
          account: this.walletClient.account,
          address: this.config.purchaseItemAddress as Hex,
          abi: parseAbi([
            "function purchaseItem(uint256 id, string memory userId) external payable",
          ]),
          functionName: "purchaseItem",
          args: [BigInt(itemId), userId],
          value: amount,
        });
      await this.walletClient.writeContract(request);

      console.log("Confirming...");
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log("Purchased!");
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getPublicKey = () => {
    return this.walletClient.account.address;
  };

  getBalance = async () => {
    if (!this.walletClient) {
      return 0;
    }

    const balance = await this.walletClient
      .extend(publicActions)
      .getBalance({ address: this.walletClient.account.address });
    return Number(formatEther(balance));
  };

  isInitialized = () => Boolean(this.walletClient);
}
