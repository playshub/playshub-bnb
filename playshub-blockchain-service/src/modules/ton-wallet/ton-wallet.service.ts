import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  internal,
  OpenedContract,
  Sender,
  toNano,
  WalletContractV4,
} from '@ton/ton';
import { KeyPair, mnemonicToPrivateKey } from '@ton/crypto';
import { ConfigService } from '@nestjs/config';
import { TonService } from '../ton/ton.service';
import { DEFAULT_WORKCHAIN } from 'src/config/ton.config';
import { sleep } from 'src/utils';

@Injectable()
export class TonWalletService implements OnModuleInit {
  private walletV4Sender: Sender;
  private walletV4Contract: WalletContractV4;
  private walletV4OpenContract: OpenedContract<WalletContractV4>;
  private keyPair: KeyPair;

  constructor(
    private configService: ConfigService,
    private tonService: TonService,
  ) {}

  async onModuleInit() {
    const ton = this.tonService.ton;
    const mnemonics = this.configService.get<string>('MNEMONICS').split(' ');
    const keyPair = await mnemonicToPrivateKey(mnemonics);
    const walletContractV4 = WalletContractV4.create({
      workchain: DEFAULT_WORKCHAIN,
      publicKey: keyPair.publicKey,
    });
    const walletV4OpenContract = ton.open(walletContractV4);
    const walletV4Sender = walletV4OpenContract.sender(keyPair.secretKey);

    this.walletV4Sender = walletV4Sender;
    this.walletV4Contract = walletContractV4;
    this.walletV4OpenContract = walletV4OpenContract;
    this.keyPair = keyPair;
  }

  getWalletV4Sender() {
    return this.walletV4Sender;
  }

  getWalletV4Contract() {
    return this.walletV4Contract;
  }

  getWalletV4OpenContract() {
    return this.walletV4OpenContract;
  }

  async getWalletState() {
    return {
      address: this.walletV4Contract.address,
      balance: await this.walletV4OpenContract.getBalance(),
    };
  }

  async sendTon(to: string, amount: string) {
    const balance = await this.walletV4OpenContract.getBalance();

    if (balance <= toNano(amount)) {
      throw new HttpException('Insufficient Balance', HttpStatus.FORBIDDEN);
    }

    const seqno = await this.walletV4OpenContract.getSeqno();
    const transfer = this.walletV4OpenContract.createTransfer({
      seqno,
      secretKey: this.keyPair.secretKey,
      messages: [
        internal({
          to,
          value: amount,
        }),
      ],
    });

    await this.walletV4OpenContract.send(transfer);

    // TODO: return transaction hash: https://github.com/ton-org/ton/issues/30
    // Working around polling to get transaction hash
    for (let attempt = 0; attempt < 30; attempt++) {
      await sleep(2500);
      const seqnoAfter = await this.walletV4OpenContract.getSeqno();
      if (seqnoAfter > seqno) break;
    }

    const [transaction] = await this.tonService.ton.getTransactions(
      this.walletV4Contract.address,
      {
        limit: 1,
      },
    );

    return { hash: transaction.hash().toString('base64') };
  }
}
