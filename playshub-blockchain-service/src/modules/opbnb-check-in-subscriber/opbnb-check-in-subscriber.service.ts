import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BscCheckInTransactionFoundEvent } from './events/bsc-check-in-transaction-found.event';

import { Contract, Provider } from 'ethers';
import { OpBnBResilientWebsocketProviderService } from '../resilient-websocket-provider/opbnb-resilient-websocket-provider.service';

@Injectable()
export class ObBnBCheckInSubscriberService {
  private readonly logger = new Logger(ObBnBCheckInSubscriberService.name);
  private readonly checkInContractAddress: `0x${string}`;
  private readonly wsUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly resilientWebsocketProviderService: OpBnBResilientWebsocketProviderService,
  ) {
    this.wsUrl = this.configService.get<string>('OPBNB_WS_PROVIDER_URL');
    this.checkInContractAddress = this.configService.get<`0x${string}`>(
      'OPBNB_CHECK_IN_CONTRACT_ADDRESS',
    );
    this.subscribe();
  }

  async subscribe() {
    const contract = new Contract(this.checkInContractAddress, [
      'event CheckedIn(address indexed sender, address indexed token, uint256 timestamp, uint256 count)',
    ]);

    const provider = await this.createResilientProvider();
    if (provider) {
      provider.on(
        {
          address: this.checkInContractAddress,
          topics: [contract.interface.getEvent('CheckedIn').topicHash],
        },
        (log) => {
          const parsedLog = contract.interface.parseLog(log);

          this.logger.debug(
            `Check-in event received sender: ${parsedLog.args[0]}, timestamp: ${parsedLog.args[2]}, token: ${parsedLog.args[1]}, count: ${parsedLog.args[3]}`,
          );
          this.eventEmitter.emit(
            'bsc.check-in.transaction.found',
            new BscCheckInTransactionFoundEvent(
              parsedLog.args[0],
              +parsedLog.args[2].toString(),
              parsedLog.args[1],
              +parsedLog.args[3].toString(),
            ),
          );
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
