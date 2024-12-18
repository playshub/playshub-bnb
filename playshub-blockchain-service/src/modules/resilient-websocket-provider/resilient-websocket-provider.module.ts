import { Module } from '@nestjs/common';
import { BscResilientWebsocketProviderService } from './bsc-resilient-websocket-provider.service';
import { OpBnBResilientWebsocketProviderService } from './opbnb-resilient-websocket-provider.service';

@Module({
  providers: [
    BscResilientWebsocketProviderService,
    OpBnBResilientWebsocketProviderService,
  ],
  exports: [
    BscResilientWebsocketProviderService,
    OpBnBResilientWebsocketProviderService,
  ],
})
export class ResilientWebsocketProviderModule {}
