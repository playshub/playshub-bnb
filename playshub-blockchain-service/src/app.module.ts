import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

// Build-in
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
// Imports
import { EventEmitterModule } from '@nestjs/event-emitter';

import { NotificationModule } from './modules/notification/notification.module';
import { TelegramBotModule } from './modules/telegram-bot/telegram-bot.module';
import { CheckInModule } from './modules/check-in/check-in.module';
import { PurchaseItemModule } from './modules/purchase-item/purchase-item.module';

@Module({
  imports: [
    // Build-in
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // Imports
    NotificationModule,
    TelegramBotModule,
    CheckInModule,
    PurchaseItemModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
