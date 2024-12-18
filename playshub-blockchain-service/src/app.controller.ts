import { Controller, Get } from '@nestjs/common';

import * as packageJson from '../package.json';

@Controller()
export class AppController {
  constructor() {}

  @Get('about')
  about() {
    return { version: packageJson.version };
  }
}
