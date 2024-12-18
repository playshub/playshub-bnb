import { IsTonAddress } from 'src/common/validators/is-ton-address.class-validator';
import { IsTonNano } from 'src/common/validators/is-ton-nano.class-validator';

export class SendTonDto {
  @IsTonAddress()
  to: string;

  @IsTonNano()
  amount: string;
}
