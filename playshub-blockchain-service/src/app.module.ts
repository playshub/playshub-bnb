import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

// Build-in
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
// Imports
import { EventEmitterModule } from '@nestjs/event-emitter';

import { NotificationModule } from './modules/notification/notification.module';
import { ContractSubscriberModule } from './modules/contract-subscriber/contract-subscriber.module';
import { TelegramBotModule } from './modules/telegram-bot/telegram-bot.module';
import { ObBnBCheckInSubscriberModule } from './modules/opbnb-check-in-subscriber/opbnb-check-in-subscriber.module';

@Module({
  imports: [
    // Build-in
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // Imports
    NotificationModule,
    TelegramBotModule,
    ContractSubscriberModule,
    ObBnBCheckInSubscriberModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
