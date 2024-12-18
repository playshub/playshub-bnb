import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTransaction } from './entities/account-transaction.entity';
import { AccountTransactionService } from './account-transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountTransaction])],
  providers: [AccountTransactionService],
})
export class AccountTransactionModule {}
