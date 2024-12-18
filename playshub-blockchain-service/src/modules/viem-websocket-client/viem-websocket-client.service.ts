import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, parseAbi, webSocket } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BscCheckInTransactionFoundEvent } from './events/bsc-check-in-transaction-found.event';

@Injectable()
export class ViemWebsocketClientService {
  private readonly logger = new Logger(ViemWebsocketClientService.name);
  private readonly checkInContractAddress: `0x${string}`;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    const wsUrl = this.configService.get<string>('OPBNB_WS_PROVIDER_URL');
    this.checkInContractAddress = this.configService.get<`0x${string}`>(
      'OPBNB_CHECK_IN_CONTRACT_ADDRESS',
    );

    const ws = createPublicClient({
      chain: polygonAmoy,
      transport: webSocket(wsUrl),
    });

    ws.watchContractEvent({
      address: this.checkInContractAddress,
      abi: parseAbi([
        'event CheckedIn(address indexed sender, address indexed token, uint256 timestamp, uint256 count)',
      ]),
      onLogs: (logs) => {
        Promise.all(
          logs.map((log) => {
            if (log.eventName === 'CheckedIn') {
              this.logger.debug(
                `Check-in event received sender: ${log.args['sender']}, timestamp: ${log.args['timestamp']}, token: ${log.args['token']}, count: ${log.args['count']}`,
              );
              this.eventEmitter.emit(
                'bsc.check-in.transaction.found',
                new BscCheckInTransactionFoundEvent(
                  log.args['sender'],
                  +log.args['timestamp'].toString(),
                  log.args['token'],
                  +log.args['count'].toString(),
                ),
              );
            }
          }),
        );
      },
    });
  }
}
