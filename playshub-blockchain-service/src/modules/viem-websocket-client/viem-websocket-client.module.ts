import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ViemWebsocketClientService } from './viem-websocket-client.service';

@Module({
  imports: [ConfigModule],
  providers: [ViemWebsocketClientService],
})
export class ViemWebsocketClientModule {}
