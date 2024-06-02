import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom } from 'rxjs';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { CreateQueryRequestDto, CreateQueryResponseDto, GetQueryRequestDto, QueryDto } from 'lib/common/dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import {
  createCreateQueryResponseFromCacheStub,
  createGetQueryResponseCompletedStub,
  createCreateQueryRequestStub,
  createGetQueryRequestStub,
} from 'lib/common/stubs';
import { mockClientProxy } from 'lib/common/mocks';

jest.mock('rxjs', () => {
  const originalModule = jest.requireActual('rxjs');

  // Mock only `firstValueFrom` and keep the rest of the module's exports intact
  return {
    ...originalModule,
    firstValueFrom: jest.fn(() => Promise.resolve('mocked value')),
  };
});

describe('ApiGatewayService', () => {
  let apiGatewayService: ApiGatewayService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [ApiGatewayService, { provide: 'api-gateway', useValue: mockClientProxy }],
    }).compile();

    apiGatewayService = app.get<ApiGatewayService>(ApiGatewayService);

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('ApiGatewayService should be defined', () => {
      expect(apiGatewayService).toBeDefined();
    });

    it('ApiGatewayService functions should be defined', () => {
      expect(apiGatewayService.createQueryRequestAsync).toBeDefined();
      expect(apiGatewayService.getQueryRequest).toBeDefined();
    });
  });

  describe('createQueryRequestAsync', () => {
    describe('when createQueryRequestAsync is called', () => {
      const request: CreateQueryRequestDto = createCreateQueryRequestStub();

      it('should call client.send with correct parameters and return the response', async () => {
        const expectedResponse: CreateQueryResponseDto = createCreateQueryResponseFromCacheStub();

        (firstValueFrom as jest.Mock).mockResolvedValueOnce(expectedResponse);

        const response = await apiGatewayService.createQueryRequestAsync(request);

        expect(mockClientProxy.send).toHaveBeenCalledWith(MICROSERVICE_SUBJECTS.MESSAGES.QUERY_CREATE, request);
        expect(response).toEqual(expectedResponse);
      });

      it('should handle errors by throwing RpcException', async () => {
        const errorMessage = 'test error';

        (firstValueFrom as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(apiGatewayService.createQueryRequestAsync(request)).rejects.toThrow(errorMessage);
      });
    });
  });

  describe('getQueryRequest', () => {
    describe('when getQueryRequest is called', () => {
      const request: GetQueryRequestDto = createGetQueryRequestStub();

      it('should call client.send with correct parameters and return the response', async () => {
        const expectedResponse: QueryDto = createGetQueryResponseCompletedStub();

        (firstValueFrom as jest.Mock).mockResolvedValueOnce(expectedResponse);

        const response = await apiGatewayService.getQueryRequest(request);

        expect(mockClientProxy.send).toHaveBeenCalledWith(MICROSERVICE_SUBJECTS.MESSAGES.QUERY_READ, request);
        expect(response).toEqual(expectedResponse);
      });

      it('should handle errors by throwing RpcException', async () => {
        const errorMessage = 'test error';

        (firstValueFrom as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(apiGatewayService.getQueryRequest(request)).rejects.toThrow(errorMessage);
      });
    });
  });
});
