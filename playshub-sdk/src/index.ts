import {
  Config,
  connect,
  createConfig,
  getAccount,
  http,
  disconnect,
  switchChain,
  getBalance,
  simulateContract,
  writeContract,
  getConnectors,
} from "@wagmi/core";
import { bscTestnet } from "@wagmi/core/chains";
import { formatEther } from "viem";
import { z } from "zod";
import { injected } from "@wagmi/connectors";

const purchaseItemSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  value: z.string(),
});

export interface CatBattleEvmSdkProps {
  shopAddress: string;
}

export default class CatBattleEvmSdk {
  private config: Config;
  private shopAddress: string;

  constructor({ shopAddress }: CatBattleEvmSdkProps) {
    this.shopAddress = shopAddress;
    this.config = createConfig({
      chains: [bscTestnet],
      transports: {
        [bscTestnet.id]: http(),
      },
      connectors: [injected()],
      multiInjectedProviderDiscovery: false,
    });
  }

  async connect() {
    const connectors = getConnectors(this.config);
    const connector = connectors[0];

    await connect(this.config, { connector });
    return this.getAccount();
  }

  async disconnect() {
    const connectors = getConnectors(this.config);
    const connector = connectors[0];
    // TO-DO: https://github.com/wevm/wagmi/issues/69#issuecomment-1011131480
    await disconnect(this.config, { connector });
  }

  isConnected() {
    const account = getAccount(this.config);
    return account.isConnected;
  }

  getAccount() {
    const account = getAccount(this.config);

    return this._resultToJsonString({
      address: account.address,
      chain: account.chainId === bscTestnet.id ? "BSC_TESTNET" : "UNKNOWN",
    });
  }

  switchChain() {
    switchChain(this.config, { chainId: bscTestnet.id });
  }

  async getBalance() {
    const account = getAccount(this.config);

    const balance = await getBalance(this.config, {
      address: account.address,
    });

    return this._resultToJsonString({
      balance: balance.value.toString(),
      formatter: formatEther(balance.value),
    });
  }

  async purchaseItem(args: string) {
    const parsedArgs = this._jsonStringToArgs(args);
    const { success, error } = purchaseItemSchema.safeParse(parsedArgs);

    if (!success) {
      console.error(error, args, parsedArgs);
      throw Error("Invalid args");
    }

    const abi = [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "buyerId",
            type: "string",
          },
        ],
        name: "purchaseItem",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ] as const;

    const { request } = await simulateContract(this.config, {
      abi,
      address: this.shopAddress,
      functionName: "purchaseItem",
      args: [parsedArgs.id, parsedArgs.buyerId],
      value: parsedArgs.value,
    });
    const hash = await writeContract(this.config, request);
    return hash;
  }

  private _resultToJsonString(result: null | Record<string, any>) {
    if (result == null) {
      return JSON.stringify({});
    } else if (typeof result === "object") {
      return JSON.stringify(result);
    } else {
      throw Error("Invalid result");
    }
  }

  private _jsonStringToArgs(args: string) {
    try {
      const parsedArgs = JSON.parse(args);
      if (this._isEmptyObject(parsedArgs)) {
        return undefined;
      }

      return parsedArgs;
    } catch (error) {
      throw Error("Invalid JSON string");
    }
  }

  private _isEmptyObject(obj: Record<string, any>) {
    return Object.getOwnPropertyNames(obj).length === 0;
  }
}
