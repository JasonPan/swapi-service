import { Logger, ValidationPipe } from '@nestjs/common';

export class RpcDtoValidationPipe extends ValidationPipe {
  private readonly logger = new Logger(RpcDtoValidationPipe.name);

  constructor() {
    super({
      transform: true,
    });
  }
}
