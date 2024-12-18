import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'account_transactions' })
export class AccountTransaction {
  @PrimaryColumn()
  hash: string;

  @Column()
  timestamp: number;

  @Column()
  lt: string;

  @Column()
  totalFees: string;

  @Column()
  source: string;

  @Column()
  destination: string;

  @Column()
  value: string;

  @Column()
  message: string;
}
