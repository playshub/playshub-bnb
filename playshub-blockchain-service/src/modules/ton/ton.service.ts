import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TonClient } from '@ton/ton';

@Injectable()
export class TonService {
  private _ton: TonClient;

  constructor(private configService: ConfigService) {
    const isMainnet = this.configService.get<string>('IS_MAINNET') === 'true';
    const apiKey = this.configService.get<string>('API_KEY');

    this._ton = isMainnet
      ? new TonClient({
          endpoint: 'https://toncenter.com/api/v2/jsonRPC',
          apiKey,
        })
      : new TonClient({
          endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
          apiKey,
        });
  }

  public get ton(): TonClient {
    return this._ton;
  }
}
