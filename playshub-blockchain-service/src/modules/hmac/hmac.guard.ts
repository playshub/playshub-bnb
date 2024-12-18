import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HmacService } from './hmac.service';

@Injectable()
export class HmacGuard implements CanActivate {
  constructor(private hmacService: HmacService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const method = request.method;
    const body = request.body;
    const url = request.url;
    const host = request.get('host');
    const timestamp = request.headers['x-timestamp'];
    const signature = request.headers['x-signature'];

    if (!timestamp || !signature) {
      throw new UnauthorizedException('Missing signature!');
    }

    const now = new Date().getTime();

    // Allow five minutes request
    if (now - timestamp > 300000) {
      throw new UnauthorizedException('Request too old!');
    }

    const verify = this.hmacService.verifySignature(
      {
        method,
        url,
        host,
        timestamp,
        contentHash: body ? JSON.stringify(body) : undefined,
      },
      signature,
    );

    if (!verify) {
      throw new UnauthorizedException('Invalid signature!');
    }

    return true;
  }
}
