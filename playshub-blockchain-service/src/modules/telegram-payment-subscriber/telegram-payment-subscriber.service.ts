import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { TelegramTransactionFoundEvent } from './events/telegram-transaction-found.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TelegramPaymentSubscriberService {
  constructor(
    private readonly configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    const telegramBotToken =
      this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    const bot = new Bot(telegramBotToken);

    bot.on('pre_checkout_query', (ctx) => {
      bot.api.answerPreCheckoutQuery(ctx.update.pre_checkout_query.id, true);
    });

    bot.on(':successful_payment', (msg) => {
      const transaction = new TelegramTransactionFoundEvent();
      transaction.userId = msg.message.from.id;
      transaction.date = msg.message.date;
      transaction.currency = msg.message.successful_payment.currency;
      transaction.payload = msg.message.successful_payment.invoice_payload;
      transaction.amount = msg.message.successful_payment.total_amount;
      this.eventEmitter.emit('telegram.transaction.found', transaction);
    });

    bot.on(':text', (ctx) => {
      if (ctx.update.message.text === '/start') {
        const {
          chat: { id },
        } = ctx.message;
        const photoUrl = 'https://game.catb.io/banner.png';
        const captionDes = `📢 Welcome to PLAYS Hub games!\n\n🚀 Hurry up! Tons of games and rewards are waiting for you. The $PLAYS token will be released soon.\n\n👇 Play daily to earn big rewards!👇`;

        bot.api.sendPhoto(id, photoUrl, {
          caption: captionDes,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🤜🤛 Play Game',
                  web_app: {
                    url: 'https://game.playshub.io/',
                  },
                },
              ],
            ],
          },
        });
      }
    });

    bot.start();
  }
}
