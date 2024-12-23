import { Module } from '@nestjs/common';
import { EvmWsProvidersService } from './evm-ws-providers.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [EvmWsProvidersService],
  exports: [EvmWsProvidersService],
})
export class EvmWsProvidersModule {}
