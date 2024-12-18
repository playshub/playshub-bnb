import { Module } from '@nestjs/common';
import { TonWalletService } from './ton-wallet.service';
import { ConfigModule } from '@nestjs/config';
import { TonModule } from '../ton/ton.module';
import { TonWalletController } from './ton-wallet.controller';
import { HMacModule } from '../hmac/hmac.module';

@Module({
  imports: [ConfigModule, TonModule, HMacModule],
  providers: [TonWalletService],
  exports: [TonWalletService],
  controllers: [TonWalletController],
})
export class TonWalletModule {}
