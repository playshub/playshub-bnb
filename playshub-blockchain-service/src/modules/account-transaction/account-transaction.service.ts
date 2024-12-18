import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TransactionFoundEvent } from '../account-subscriber/events/transaction-found.event';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountTransaction } from './entities/account-transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountTransactionService {
  constructor(
    @InjectRepository(AccountTransaction)
    private accountTransactionRepository: Repository<AccountTransaction>,
  ) {}
  @OnEvent('transaction.found')
  async save(tx: TransactionFoundEvent) {
    const newTransaction = this.accountTransactionRepository.create({
      hash: tx.hash,
      timestamp: tx.timestamp,
      lt: tx.lt,
      totalFees: tx.totalFees,
      source: tx.source,
      destination: tx.destination,
      value: tx.value,
      message: tx.message,
    });
    await this.accountTransactionRepository.save(newTransaction);
  }
}
