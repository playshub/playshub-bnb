export class TelegramTransactionFoundEvent {
  userId: number;
  date: number;
  currency: string;
  amount: number;
  payload: string;
}
