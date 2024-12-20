import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

// Build-in
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
// Imports
import { EventEmitterModule } from '@nestjs/event-emitter';

import { NotificationModule } from './modules/notification/notification.module';
import { ContractSubscriberModule } from './modules/contract-subscriber/contract-subscriber.module';
import { TelegramPaymentSubscriberModule } from './modules/telegram-payment-subscriber/telegram-payment-subscriber.module';
import { ObBnBCheckInSubscriberModule } from './modules/opbnb-check-in-subscriber/opbnb-check-in-subscriber.module';

@Module({
  imports: [
    // Build-in
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // Imports
    NotificationModule,
    ContractSubscriberModule,
    TelegramPaymentSubscriberModule,
    ObBnBCheckInSubscriberModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
