import { Module } from '@nestjs/common';
import { TonService } from './ton.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [TonService],
  exports: [TonService],
})
export class TonModule {}
