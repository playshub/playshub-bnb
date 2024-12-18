import { Module } from '@nestjs/common';
import { TonModule } from '../ton/ton.module';
import { AccountSubscriberService } from './account-subscriber.service';
import { TonWalletModule } from '../ton-wallet/ton-wallet.module';

@Module({
  imports: [TonModule, TonWalletModule],
  providers: [AccountSubscriberService],
})
export class AccountSubscriberModule {}
