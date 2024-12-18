import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface HmacPayload {
  method: string;
  url: string;
  host: string;
  timestamp: number;
  contentHash?: string;
}

@Injectable()
export class HmacService {
  private hmacSecret: string;

  constructor(private configService: ConfigService) {
    this.hmacSecret = this.configService.get<string>('HMAC_HASH_SECRET');
  }

  verifySignature(payload: HmacPayload, signature: string) {
    const requiredSignature = crypto
      .createHmac('sha256', this.hmacSecret)
      .update(this.payloadToString(payload))
      .digest('base64');

    return requiredSignature === signature;
  }

  private payloadToString({
    method,
    url,
    host,
    timestamp,
    contentHash,
  }: HmacPayload) {
    if (contentHash) {
      return `${method};${url};${timestamp};${host};${contentHash}`;
    }

    return `${method};${url};${timestamp};${host}`;
  }
}
