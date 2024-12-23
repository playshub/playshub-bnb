import { Module } from '@nestjs/common';
import { EvmWsProvidersService } from './evm-ws-providers.service';

@Module({
  providers: [EvmWsProvidersService],
  exports: [EvmWsProvidersService],
})
export class EvmWsProviders {}
