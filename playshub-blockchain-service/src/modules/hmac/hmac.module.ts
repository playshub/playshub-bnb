import { Module } from '@nestjs/common';
import { HmacService } from './hmac.service';
import { ConfigModule } from '@nestjs/config';
import { HmacGuard } from './hmac.guard';

@Module({
  imports: [ConfigModule],
  providers: [HmacService, HmacGuard],
  exports: [HmacGuard, HmacService],
})
export class HMacModule {}
