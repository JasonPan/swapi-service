import { Controller, Inject, LoggerService, UseInterceptors, UsePipes } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SwapiConnectorService } from './swapi-connector.service';
import { SubqueryDto } from 'lib/common/dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import { RpcLoggingInterceptor } from 'lib/common/interceptors/rpc-logging.interceptor';
import { RpcDtoValidationPipe } from 'lib/common/pipes/rpc-dto-validation.pipe';

@UseInterceptors(RpcLoggingInterceptor)
@UsePipes(new RpcDtoValidationPipe())
@Controller()
export class SwapiConnectorController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    private readonly swapiConnectorService: SwapiConnectorService,
  ) {}

  @EventPattern(MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_FETCH)
  fetchData(@Payload() dto: SubqueryDto): void {
    this.logger.log('received fetch request');
    this.swapiConnectorService.fetchDataAsync(dto);
  }
}
