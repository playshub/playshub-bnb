import { Module } from '@nestjs/common';
import { ContractSubscriberService } from './contract-subscriber.service';
import { ResilientWebsocketProviderModule } from '../resilient-websocket-provider/resilient-websocket-provider.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ResilientWebsocketProviderModule, ConfigModule],
  providers: [ContractSubscriberService],
})
export class ContractSubscriberModule {}
