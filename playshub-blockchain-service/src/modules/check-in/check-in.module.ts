import { Module } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { ConfigModule } from '@nestjs/config';
import { EvmWsProvidersModule } from '../evm-ws-providers/evm-ws-providers.module';

@Module({
  imports: [ConfigModule, EvmWsProvidersModule],
  providers: [CheckInService],
})
export class CheckInModule {}
