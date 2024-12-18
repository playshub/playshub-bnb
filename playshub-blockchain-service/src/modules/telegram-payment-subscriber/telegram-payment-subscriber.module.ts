import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramPaymentSubscriberService } from './telegram-payment-subscriber.service';

@Module({
  imports: [ConfigModule],
  providers: [TelegramPaymentSubscriberService],
})
export class TelegramPaymentSubscriberModule {}
