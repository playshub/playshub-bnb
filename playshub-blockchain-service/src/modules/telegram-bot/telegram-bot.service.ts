import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TelegramBotService {
  constructor(
    private readonly configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    const telegramBotToken =
      this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    const bot = new Bot(telegramBotToken);

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
                    url: 'https://bsc.playshub.io/',
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
