import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TonWalletService } from './ton-wallet.service';
import { SendTonDto } from './dtos/send-ton.dto';
import { fromNano } from '@ton/core';
import { HmacGuard } from '../hmac/hmac.guard';

@Controller('wallets/v4')
export class TonWalletController {
  constructor(private tonWalletService: TonWalletService) {}

  @Get('/')
  async wallet() {
    const state = await this.tonWalletService.getWalletState();
    return {
      address: state.address.toString(),
      balance: fromNano(state.balance),
    };
  }

  @UseGuards(HmacGuard)
  @Post('/send')
  async send(@Body() args: SendTonDto) {
    return this.tonWalletService.sendTon(args.to, args.amount);
  }
}
