import { Test, TestingModule } from '@nestjs/testing';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { CreateQueryRequestDto, GetQueryRequestDto, QueryDto } from 'lib/common/dto';
import {
  createCreateQueryResponseStub,
  createGetQueryResponseStub,
  createCreateQueryRequestStub,
  createGetQueryRequestStub,
} from 'lib/common/stubs';
import { mockClientProxy } from 'lib/common/mocks';

jest.mock('./api-gateway.service');

describe('ApiGatewayController', () => {
  let apiGatewayController: ApiGatewayController;
  let apiGatewayService: ApiGatewayService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [ApiGatewayService, { provide: 'api-gateway', useValue: mockClientProxy }],
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
      let expectedResponse: QueryDto;

      beforeEach(async () => {
        expectedResponse = await apiGatewayController.createQueryAsync(bodyParameters);
      });

      it('should call apiGatewayService', () => {
        expect(apiGatewayService.createQueryRequestAsync).toHaveBeenCalledWith(request);
      });

      it('should return a query response', () => {
        expect(expectedResponse).toEqual(createCreateQueryResponseStub());
      });
    });
  });

  describe('getQueryAsync', () => {
    describe('when getQueryAsync is called', () => {
      const request: GetQueryRequestDto = createGetQueryRequestStub();
      const bodyParameters: GetQueryRequestDto = request;
      let expectedResponse: QueryDto;

      beforeEach(async () => {
        expectedResponse = await apiGatewayController.getQueryAsync(bodyParameters);
      });

      it('should call apiGatewayService', () => {
        expect(apiGatewayService.getQueryRequest).toHaveBeenCalledWith(request);
      });

      it('should return a query response', () => {
        expect(expectedResponse).toEqual(createGetQueryResponseStub());
      });
    });
  });
});
