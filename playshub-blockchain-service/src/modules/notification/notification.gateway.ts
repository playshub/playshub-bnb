import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TransactionFoundEvent } from '../account-subscriber/events/transaction-found.event';
import { OnEvent } from '@nestjs/event-emitter';
import { BscTransactionFoundEvent } from '../contract-subscriber/events/bsc-transaction-found.event';
import { TelegramTransactionFoundEvent } from '../telegram-payment-subscriber/events/telegram-transaction-found.event';
import { BscCheckInTransactionFoundEvent } from '../viem-websocket-client/events/bsc-check-in-transaction-found.event';

@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  @OnEvent('transaction.found')
  async push(tx: TransactionFoundEvent) {
    this.server.emit('transaction.found', tx);
  }

  @OnEvent('bsc.transaction.found')
  async bscTransactionFoundHandler(tx: BscTransactionFoundEvent) {
    this.server.emit('bsc.transaction.found', tx);
  }

  @OnEvent('telegram.transaction.found')
  async telegramTransactionFoundHandler(tx: TelegramTransactionFoundEvent) {
    this.server.emit('telegram.transaction.found', tx);
  }

  @OnEvent('bsc.check-in.transaction.found')
  async bscCheckInTransactionFoundHandler(tx: BscCheckInTransactionFoundEvent) {
    this.server.emit('bsc.check-in.transaction.found', tx);
  }
}
