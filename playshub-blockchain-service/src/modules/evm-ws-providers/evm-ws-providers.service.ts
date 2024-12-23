import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { createResilientProviders } from 'src/utils/resilient-websocket-provider';

const DESTROY_WEBSOCKET_INTERVAL = 5;

@Injectable()
export class EvmWsProvidersService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(EvmWsProvidersService.name);

  private providers: ethers.WebSocketProvider[];
  private readonly rpcUrls: string[];
  private swapCounter = 0;

  private providerSwapCallbacks: ((
    provider: ethers.WebSocketProvider,
  ) => void)[] = [];

  constructor(private readonly config: ConfigService) {
    const rpcUrls = this.config.get<string>('RPC_URLS')?.split(',');

    if (rpcUrls?.length === 0) {
      throw new Error('No RPC urls provided');
    }

    this.rpcUrls = rpcUrls;
  }

  onApplicationShutdown() {
    const waitForWebsocketAndDestroy = (provider: ethers.WebSocketProvider) => {
      setTimeout(() => {
        if (provider.websocket.readyState) {
          provider.destroy();
        } else {
          waitForWebsocketAndDestroy(provider);
        }
      }, DESTROY_WEBSOCKET_INTERVAL);
    };

    this.providers.forEach((provider) => {
      waitForWebsocketAndDestroy(provider);
    });
  }

  async onApplicationBootstrap() {
    this.providers = await createResilientProviders(
      this.rpcUrls,
      this.swapProviders.bind(this),
    );
  }

  private swapProviders() {
    this.swapCounter++;

    const newProvider = this._getCurrentWebSocketProvider();

    for (const providerSwapCallback of this.providerSwapCallbacks) {
      providerSwapCallback(newProvider);
    }

    this.logger.log(
      `Swapped provider to ${this.swapCounter % this.providers.length}`,
    );
  }

  private async waitOnBootstrap() {
    this.logger.debug('Waiting for service to bootstrap');
    return new Promise<void>((resolve) => {
      const checkReadyAndResolve = () => {
        const currentWebSocketProvider =
          this._getCurrentWebSocketProvider.bind(this)();
        if (
          currentWebSocketProvider &&
          currentWebSocketProvider.websocket &&
          currentWebSocketProvider.websocket.readyState
        ) {
          this.logger.debug(`Service is bootstrapped and ready`);
          resolve();
        } else {
          setTimeout(checkReadyAndResolve, 100);
        }
      };

      checkReadyAndResolve();
    });
  }

  async getCurrentWebSocketProvider(
    onSwapProvidersCallback: (provider: ethers.WebSocketProvider) => void,
  ) {
    await this.waitOnBootstrap();
    this.providerSwapCallbacks.push(onSwapProvidersCallback);

    return this._getCurrentWebSocketProvider();
  }

  private _getCurrentWebSocketProvider(): ethers.WebSocketProvider {
    return this.providers[this.swapCounter % this.providers.length];
  }
}
