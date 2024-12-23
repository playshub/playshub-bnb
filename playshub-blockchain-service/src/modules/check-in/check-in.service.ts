import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EvmWsProvidersService } from '../evm-ws-providers/evm-ws-providers.service';
import { ethers } from 'ethers';
import { CheckInAbi } from './abis/checkInAbi';

@Injectable()
export class CheckInService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CheckInService.name);

  private readonly checkInAddress: string;
  private provider: ethers.WebSocketProvider;
  private checkInAddressContract: ethers.Contract;

  constructor(
    private readonly configService: ConfigService,
    private readonly evmWsProvidersService: EvmWsProvidersService,
  ) {
    this.checkInAddress = this.configService.get<string>('CHECK_IN_ADDRESS');

    if (!this.checkInAddress) {
      throw new Error('Check-in address is not provided');
    }
  }

  async onApplicationBootstrap() {
    this.provider =
      await this.evmWsProvidersService.getCurrentWebSocketProvider(
        async (provider) => {
          this.provider = provider;
          await this.subscribeToCheckIn();
        },
      );

    await this.subscribeToCheckIn();
  }

  async onCheckIn(...args) {
    console.log('Check-in event:', args);
  }

  async subscribeToCheckIn() {
    this.checkInAddressContract = new ethers.Contract(
      this.checkInAddress,
      CheckInAbi,
      this.provider,
    );

    this.checkInAddressContract.on('CheckedIn', this.onCheckIn.bind(this));
  }
}
