import { CatBattleShop__factory } from '@cuonghx.ngen/cat-battle-contracts';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BscResilientWebsocketProviderService } from '../resilient-websocket-provider/bsc-resilient-websocket-provider.service';
import { BscTransactionFoundEvent } from './events/bsc-transaction-found.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Provider } from 'ethers';

@Injectable()
export class ContractSubscriberService {
  private logger = new Logger(ContractSubscriberService.name);

  private shopContractAddress: string;
  private wsUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly resilientWebsocketProviderService: BscResilientWebsocketProviderService,
    private eventEmitter: EventEmitter2,
  ) {
    this.shopContractAddress = this.configService.get<string>(
      'BSC_SHOP_CONTRACT_ADDRESS',
    );
    this.wsUrl = this.configService.get<string>('BSC_WS_PROVIDER_URL');
    this.subscribe();
  }

  async subscribe() {
    const provider = await this.createResilientProvider();
    if (provider) {
      provider.on(
        {
          address: this.shopContractAddress,
          topics: [
            CatBattleShop__factory.createInterface().getEvent('ItemPurchased')
              .topicHash,
          ],
        },
        (log) => {
          const parsedLog =
            CatBattleShop__factory.createInterface().parseLog(log);

          const transaction = new BscTransactionFoundEvent();
          transaction.hash = log.transactionHash;
          transaction.block = log.blockNumber;
          transaction.from = parsedLog.args[0];
          transaction.id = parsedLog.args[1].toString();
          transaction.name = parsedLog.args[2];
          transaction.price = parsedLog.args[3].toString();
          transaction.userId = parsedLog.args[4];

          this.logger.debug(transaction);
          this.eventEmitter.emit('bsc.transaction.found', transaction);
        },
      );
    }
  }

  async createResilientProvider(): Promise<Provider | undefined> {
    const provider = await this.resilientWebsocketProviderService.connect(
      this.wsUrl,
    );
    if (provider) {
      const originalOn = provider.on.bind(provider);
      provider.on = (event, listener) => {
        this.resilientWebsocketProviderService.subscriptions.add({
          event,
          listener,
        });
        return originalOn(event, listener);
      };

      return provider;
    }
  }
}
