import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

import axios from 'axios';
import { UserCheckIn, UserPurchaseItem } from 'src/types/playshub';
import { sleep } from 'src/utils';

const MAX_TRIES_COUNT = 5;
@Injectable()
export class PlayshubWebhookService {
  private readonly logger = new Logger(PlayshubWebhookService.name);
  private webhookUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.webhookUrl = this.configService.get<string>(
      'PLAYSHUB_GAME_WEBHOOK_URL',
    );
  }

  @OnEvent('bsc.transactions')
  async transactionHandler(txs: UserCheckIn[] | UserPurchaseItem[]) {
    for (const tx of txs) {
      switch (tx.type) {
        case 'Check In':
          this.checkInPush(tx as UserCheckIn);
          break;
        case 'Purchase Item':
          this.purchaseItemPush(tx as UserPurchaseItem);
          break;
        default:
          this.logger.error(`Unknown transaction: ${tx}`);
      }
    }
  }

  async checkInPush(tx: UserCheckIn) {
    this.logger.debug(`Sending check-in webhook for user: ${tx.userId}`);
    return this.trySendWebhook(`${this.webhookUrl}/check-in`, {
      account_id: tx.userId.toString(),
    });
  }

  async purchaseItemPush(tx: UserPurchaseItem) {
    this.logger.debug(
      `Sending purchase-item webhook for user: ${tx.userId}, item: ${tx.itemId}`,
    );
    return this.trySendWebhook(`${this.webhookUrl}/purchase-item`, {
      account_id: tx.userId.toString(),
      item_id: tx.itemId,
    });
  }

  private async trySendWebhook(url: string, payload: any, retryCount = 0) {
    if (!this.webhookUrl) {
      return;
    }

    try {
      const res = await axios.post(url, payload);
      this.logger.debug(`Webhook sent. Data: ${JSON.stringify(res.data)}`);
    } catch (e) {
      this.logger.error(`Webhook failed to send. Error: ${e.message}`, {
        retryCount,
        url,
        payload,
      });
      this.logger.debug(e);
      this.logger.debug(
        `Status: ${e.status}, Message: ${e.statusText || e.message}`,
      );

      // Add a delay before retrying (using exponential backoff)
      const delayMs = Math.pow(2, retryCount) * 1000;
      this.logger.debug(`Retrying webhook. Attempt ${retryCount + 1}`);
      await sleep(delayMs);

      if (retryCount == MAX_TRIES_COUNT) {
        this.logger.error(`Max retry attempts reached for webhook: ${url}`);
        return;
      }

      return this.trySendWebhook(url, payload, retryCount + 1);
    }
  }
}
