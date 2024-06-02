import { Controller, Inject, LoggerService, UseInterceptors, UsePipes } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CacheManagerService } from './cache-manager.service';
import { SubqueryDto } from 'lib/common/dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import { RpcLoggingInterceptor } from 'lib/common/interceptors/rpc-logging.interceptor';
import { RpcDtoValidationPipe } from 'lib/common/pipes/rpc-dto-validation.pipe';

@UseInterceptors(RpcLoggingInterceptor)
@UsePipes(new RpcDtoValidationPipe())
@Controller()
export class CacheManagerController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    private readonly cacheManagerService: CacheManagerService,
  ) {}

  @MessagePattern(MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ)
  async readCacheAsync(@Payload() dto: SubqueryDto): Promise<SubqueryDto> {
    this.logger.log('received cache read request');
    return this.cacheManagerService.readCacheAsync(dto);
  }

  @EventPattern(MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_RECEIVE)
  updateCache(@Payload() dto: SubqueryDto): void {
    this.logger.log('received results');
    this.cacheManagerService.updateCache(dto);
  }
}
