import { Controller, UseInterceptors, UsePipes } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CacheManagerService } from './cache-manager.service';
import { SubqueryDto } from 'lib/common/dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import { RpcLoggingInterceptor } from 'lib/common/interceptors/rpc-logging.interceptor';
import { RpcDtoValidationPipe } from 'lib/common/pipes/rpc-dto-validation.pipe';

@UseInterceptors(RpcLoggingInterceptor)
@UsePipes(new RpcDtoValidationPipe())
@Controller()
export class CacheManagerController {
  constructor(private readonly cacheManagerService: CacheManagerService) {}

  @MessagePattern(MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ)
  async readCacheAsync(@Payload() dto: SubqueryDto): Promise<SubqueryDto> {
    console.log('received cache read request');
    return this.cacheManagerService.readCacheAsync(dto);
  }

  @EventPattern(MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_RECEIVE)
  updateCache(@Payload() dto: SubqueryDto): void {
    console.log('received results');
    this.cacheManagerService.updateCache(dto);
  }
}
