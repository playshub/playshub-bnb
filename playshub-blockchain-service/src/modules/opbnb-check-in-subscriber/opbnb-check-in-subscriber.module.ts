import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ObBnBCheckInSubscriberService } from './opbnb-check-in-subscriber.service';
import { ResilientWebsocketProviderModule } from '../resilient-websocket-provider/resilient-websocket-provider.module';

@Module({
  imports: [ResilientWebsocketProviderModule, ConfigModule],
  providers: [ObBnBCheckInSubscriberService],
})
export class ObBnBCheckInSubscriberModule {}
