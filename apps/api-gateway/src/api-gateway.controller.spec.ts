import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { CreateQueryRequestDto, GetQueryRequestDto, QueryDto } from 'lib/common/dto';
import {
  createCreateQueryResponseFromCacheStub,
  createGetQueryResponseCompletedStub,
  createCreateQueryRequestStub,
  createGetQueryRequestStub,
} from 'lib/common/stubs';
import { mockClientProxy, mockLogger } from 'lib/common/mocks';

jest.mock('./api-gateway.service');

describe('ApiGatewayController', () => {
  let apiGatewayController: ApiGatewayController;
  let apiGatewayService: ApiGatewayService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [
        ApiGatewayService,
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
        { provide: 'api-gateway', useValue: mockClientProxy },
      ],
    }).compile();

    apiGatewayController = app.get<ApiGatewayController>(ApiGatewayController);
    apiGatewayService = app.get<ApiGatewayService>(ApiGatewayService);

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('ApiGatewayController and ApiGatewayService should be defined', () => {
      expect(apiGatewayController).toBeDefined();
      expect(apiGatewayService).toBeDefined();
    });

    it('ApiGatewayController functions should be defined', () => {
      // expect(apiGatewayController.getGraphQlQueryResponseAsync).toBeDefined();
      expect(apiGatewayController.createQueryAsync).toBeDefined();
      expect(apiGatewayController.getQueryAsync).toBeDefined();
    });

    it('ApiGatewayService functions should be defined', () => {
      expect(apiGatewayService.createQueryRequestAsync).toBeDefined();
      expect(apiGatewayService.getQueryRequest).toBeDefined();
    });
  });

  describe('createQueryAsync', () => {
    describe('when createQueryAsync is called', () => {
      const request: CreateQueryRequestDto = createCreateQueryRequestStub();
      const bodyParameters: CreateQueryRequestDto = request;
      let response: QueryDto;

      beforeEach(async () => {
        response = await apiGatewayController.createQueryAsync(bodyParameters);
      });

      it('should call apiGatewayService', () => {
        expect(apiGatewayService.createQueryRequestAsync).toHaveBeenCalledWith(request);
      });

      it('should return a query response', () => {
        expect(response).toEqual(createCreateQueryResponseFromCacheStub());
      });
    });
  });

  describe('getQueryAsync', () => {
    describe('when getQueryAsync is called', () => {
      const request: GetQueryRequestDto = createGetQueryRequestStub();
      const bodyParameters: GetQueryRequestDto = request;
      let response: QueryDto;

      beforeEach(async () => {
        response = await apiGatewayController.getQueryAsync(bodyParameters);
      });

      it('should call apiGatewayService', () => {
        expect(apiGatewayService.getQueryRequest).toHaveBeenCalledWith(request);
      });

      it('should return a query response', () => {
        expect(response).toEqual(createGetQueryResponseCompletedStub());
      });
    });
  });
});
