import { Module } from '@nestjs/common';
import { PurchaseItemService } from './purchase-item.service';
import { ConfigModule } from '@nestjs/config';
import { EvmWsProvidersModule } from '../evm-ws-providers/evm-ws-providers.module';

@Module({
  imports: [ConfigModule, EvmWsProvidersModule],
  providers: [PurchaseItemService],
  exports: [PurchaseItemService],
})
export class PurchaseItemModule {}
