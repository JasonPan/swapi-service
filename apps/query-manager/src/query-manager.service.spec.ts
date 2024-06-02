import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { QueryManagerController } from './query-manager.controller';
import { QueryManagerService } from './query-manager.service';
import {
  CreateQueryRequestDto,
  CreateQueryResponseDto,
  GetQueryRequestDto,
  QueryDto,
  SubqueryDto,
} from 'lib/common/dto';
import { QueryEntity, SubqueryEntity } from 'lib/common/entities';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import {
  completedSubqueriesStub,
  createCreateQueryRequestStub,
  createCreateQueryResponseFromCacheStub,
  createCreateQueryResponseNoCacheStub,
  createGetQueryRequestStub,
  createGetQueryResponseCompletedStub,
  getQueryEntity,
  getQueryEntityWithoutResults,
  initialSubqueriesStub,
} from 'lib/common/stubs';
import { mockClientProxy, mockHttpService, mockQueryRepository, mockSubqueryRepository } from 'lib/common/mocks';

jest.mock('rxjs', () => {
  const originalModule = jest.requireActual('rxjs');

  // Mock only `firstValueFrom` and keep the rest of the module's exports intact
  return {
    ...originalModule,
    firstValueFrom: jest.fn(() => Promise.resolve('mocked value')),
  };
});

jest.mock('uuid', () => {
  const originalModule = jest.requireActual('uuid');

  // Mock only `v4` and keep the rest of the module's exports intact
  return {
    ...originalModule,
    v4: jest.fn(() => 'mocked value'),
  };
});

describe('QueryManagerService', () => {
  let queryManagerService: QueryManagerService;
  let queryRepository: Repository<QueryEntity>;
  let subqueryRepository: Repository<SubqueryEntity>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QueryManagerController],
      providers: [
        QueryManagerService,
        { provide: 'query-manager', useValue: mockClientProxy },
        { provide: getRepositoryToken(QueryEntity), useValue: mockQueryRepository },
        { provide: getRepositoryToken(SubqueryEntity), useValue: mockSubqueryRepository },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    queryManagerService = app.get<QueryManagerService>(QueryManagerService);
    queryRepository = app.get<Repository<QueryEntity>>(getRepositoryToken(QueryEntity));
    subqueryRepository = app.get<Repository<SubqueryEntity>>(getRepositoryToken(SubqueryEntity));

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('QueryManagerService should be defined', () => {
      expect(queryManagerService).toBeDefined();
    });

    it('QueryManagerService functions should be defined', () => {
      expect(queryManagerService.processNewQueryRequestAsync).toBeDefined();
      expect(queryManagerService.handleSubqueryResultAsync).toBeDefined();
      expect(queryManagerService.fetchQueryResultsAsync).toBeDefined();

      expect(queryManagerService.fetchQueryRequestResultsFromCache).toBeDefined();
      expect(queryManagerService.fetchQueryRequestResultsFromDataSource).toBeDefined();

      expect(queryManagerService.generateQueryEntityFromCreateDtoAsync).toBeDefined();
    });
  });

  describe('processNewQueryRequestAsync', () => {
    describe('when processNewQueryRequestAsync is called', () => {
      let request: CreateQueryRequestDto;
      let response: CreateQueryResponseDto;

      beforeEach(async () => {
        request = createCreateQueryRequestStub();
        jest.spyOn(queryManagerService, 'processNewQueryRequestAsync'); // Required for first test
        // const cachedResponse = createCreateQueryResponseNoCacheStub();
        const cachedResponse = createCreateQueryResponseFromCacheStub();
        (firstValueFrom as jest.Mock)
          .mockResolvedValueOnce(cachedResponse.subqueries[0])
          .mockResolvedValueOnce(cachedResponse.subqueries[1])
          .mockResolvedValueOnce(cachedResponse.subqueries[2]);
        (uuidv4 as jest.Mock)
          .mockReturnValueOnce(cachedResponse.subqueries[0].id)
          .mockReturnValueOnce(cachedResponse.subqueries[1].id)
          .mockReturnValueOnce(cachedResponse.subqueries[2].id)
          .mockReturnValueOnce(cachedResponse.id);
        response = await queryManagerService.processNewQueryRequestAsync(request);
      });

      it('should be called with dto', () => {
        expect(queryManagerService.processNewQueryRequestAsync).toHaveBeenCalledWith(request);
      });

      it('should call client.send with correct parameters', async () => {
        expect(mockClientProxy.send).toHaveBeenCalledTimes(3);

        // TODO: check whether we actually need to be concerned about race conditions here; if not, this can be simplified.
        const requestSubqueries = initialSubqueriesStub();
        const subqueryComparator = (a: SubqueryDto, b: SubqueryDto) => a.id.localeCompare(b.id);
        const observedCalls = (mockClientProxy.send.mock.calls as [string, SubqueryDto][]).sort((a, b) =>
          subqueryComparator(a[1], b[1]),
        );
        const expectedCalls = requestSubqueries
          .sort(subqueryComparator)
          .map((sq) => [MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ, sq]);
        expect(observedCalls).toEqual(expectedCalls);
      });

      it('should return a response', async () => {
        expect(response).toEqual(createCreateQueryResponseFromCacheStub());
      });

      it('should handle errors by throwing RpcException', async () => {
        const errorMessage = 'test error';

        (firstValueFrom as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(queryManagerService.processNewQueryRequestAsync(request)).rejects.toThrow(errorMessage);
      });
    });
  });

  describe('handleSubqueryResultAsync', () => {
    describe('when handleSubqueryResultAsync is called', () => {
      let request: SubqueryDto;
      let response: void;

      beforeEach(async () => {
        request = completedSubqueriesStub()[0];
        jest.spyOn(queryManagerService, 'handleSubqueryResultAsync'); // Required for first test
        // const cachedResponse = createCreateQueryResponseNoCacheStub();
        const cachedResponse = createCreateQueryResponseFromCacheStub();
        (firstValueFrom as jest.Mock)
          .mockResolvedValueOnce(cachedResponse.subqueries[0])
          .mockResolvedValueOnce(cachedResponse.subqueries[1])
          .mockResolvedValueOnce(cachedResponse.subqueries[2]);
        response = await queryManagerService.handleSubqueryResultAsync(request);
      });

      it('should be called with dto', () => {
        expect(queryManagerService.handleSubqueryResultAsync).toHaveBeenCalledWith(request);
      });

      it('should call client.send with correct parameters', async () => {
        expect(mockClientProxy.send).toHaveBeenCalledTimes(3);

        // TODO: check whether we actually need to be concerned about race conditions here; if not, this can be simplified.
        const requestSubqueries = initialSubqueriesStub();
        const subqueryComparator = (a: SubqueryDto, b: SubqueryDto) => a.id.localeCompare(b.id);
        const observedCalls = (mockClientProxy.send.mock.calls as [string, SubqueryDto][]).sort((a, b) =>
          subqueryComparator(a[1], b[1]),
        );
        const expectedCalls = requestSubqueries
          .sort(subqueryComparator)
          .map((sq) => [MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ, sq]);
        expect(observedCalls).toEqual(expectedCalls);
      });

      it('should not return a response', async () => {
        expect(response).toEqual(undefined);
      });

      it('should handle errors by throwing RpcException', async () => {
        const errorMessage = 'test error';

        (queryRepository.findOneOrFail as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(queryManagerService.handleSubqueryResultAsync(request)).rejects.toThrow(errorMessage);
      });

      it('should safely ignore an unreachable callback URL', async () => {
        (mockHttpService.axiosRef.post as jest.Mock).mockRejectedValueOnce({ response: { status: 404 } });
        await expect(queryManagerService.handleSubqueryResultAsync(request)).resolves.toEqual(undefined);
      });
    });
  });

  describe('fetchQueryResultsAsync', () => {
    describe('when fetchQueryResultsAsync is called', () => {
      let request: GetQueryRequestDto;
      let response: QueryDto;

      beforeEach(async () => {
        request = createGetQueryRequestStub();
        jest.spyOn(queryManagerService, 'fetchQueryResultsAsync'); // Required for first test
        response = await queryManagerService.fetchQueryResultsAsync(request);
      });

      it('should be called with dto', () => {
        expect(queryManagerService.fetchQueryResultsAsync).toHaveBeenCalledWith(request);
      });

      it('should call queryRepository and get entity', () => {
        expect(queryRepository.findOneOrFail).toHaveBeenCalledWith({ where: { id: request.id } });
      });

      it('should return a response', async () => {
        expect(response).toEqual(createGetQueryResponseCompletedStub());
      });

      it('should handle errors by throwing RpcException', async () => {
        const errorMessage = 'test error';

        (queryRepository.findOneOrFail as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(queryManagerService.fetchQueryResultsAsync(request)).rejects.toThrow(errorMessage);
      });
    });
  });

  describe('fetchQueryRequestResultsFromCache', () => {
    describe('when fetchQueryRequestResultsFromCache is called and is looking for all results to exist', () => {
      let request: QueryEntity;
      let response: CreateQueryResponseDto | null;

      beforeEach(async () => {
        request = getQueryEntity();
        jest.spyOn(queryManagerService, 'fetchQueryRequestResultsFromCache'); // Required for first test
        // const cachedResponse = createCreateQueryResponseNoCacheStub();
        const cachedResponse = createCreateQueryResponseFromCacheStub();
        cachedResponse.subqueries[2].result = null;
        (firstValueFrom as jest.Mock)
          .mockResolvedValueOnce(cachedResponse.subqueries[0])
          .mockResolvedValueOnce(cachedResponse.subqueries[1])
          .mockResolvedValueOnce(cachedResponse.subqueries[2]);
        response = await queryManagerService.fetchQueryRequestResultsFromCache(request, true);
      });

      it('should be called with correct parameters', () => {
        expect(queryManagerService.fetchQueryRequestResultsFromCache).toHaveBeenCalledWith(request, true);
      });

      it('should call client.send with correct parameters', async () => {
        expect(mockClientProxy.send).toHaveBeenCalledTimes(3);

        // TODO: check whether we actually need to be concerned about race conditions here; if not, this can be simplified.
        const requestSubqueries = initialSubqueriesStub();
        const subqueryComparator = (a: SubqueryDto, b: SubqueryDto) => a.id.localeCompare(b.id);
        const observedCalls = (mockClientProxy.send.mock.calls as [string, SubqueryDto][]).sort((a, b) =>
          subqueryComparator(a[1], b[1]),
        );
        const expectedCalls = requestSubqueries
          .sort(subqueryComparator)
          .map((sq) => [MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ, sq]);
        expect(observedCalls).toEqual(expectedCalls);
      });

      it('should return a response', async () => {
        expect(response).toEqual(null);
      });

      it('should handle errors by throwing RpcException', async () => {
        const errorMessage = 'test error';

        (firstValueFrom as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(queryManagerService.fetchQueryRequestResultsFromCache(request, true)).rejects.toThrow(
          errorMessage,
        );
      });
    });

    describe('when fetchQueryRequestResultsFromCache is called and is not looking for all results to exist', () => {
      let request: QueryEntity;
      let response: CreateQueryResponseDto | null;

      beforeEach(async () => {
        request = getQueryEntity();
        jest.spyOn(queryManagerService, 'fetchQueryRequestResultsFromCache'); // Required for first test
        // const cachedResponse = createCreateQueryResponseNoCacheStub();
        const cachedResponse = createCreateQueryResponseFromCacheStub();
        cachedResponse.subqueries[2].result = null;
        (firstValueFrom as jest.Mock)
          .mockResolvedValueOnce(cachedResponse.subqueries[0])
          .mockResolvedValueOnce(cachedResponse.subqueries[1])
          .mockResolvedValueOnce(cachedResponse.subqueries[2]);
        response = await queryManagerService.fetchQueryRequestResultsFromCache(request, false);
      });

      it('should be called with correct parameters', () => {
        expect(queryManagerService.fetchQueryRequestResultsFromCache).toHaveBeenCalledWith(request, false);
      });

      it('should call client.send with correct parameters', async () => {
        expect(mockClientProxy.send).toHaveBeenCalledTimes(3);

        // TODO: check whether we actually need to be concerned about race conditions here; if not, this can be simplified.
        const requestSubqueries = initialSubqueriesStub();
        const subqueryComparator = (a: SubqueryDto, b: SubqueryDto) => a.id.localeCompare(b.id);
        const observedCalls = (mockClientProxy.send.mock.calls as [string, SubqueryDto][]).sort((a, b) =>
          subqueryComparator(a[1], b[1]),
        );
        const expectedCalls = requestSubqueries
          .sort(subqueryComparator)
          .map((sq) => [MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ, sq]);
        expect(observedCalls).toEqual(expectedCalls);
      });

      it('should return a response', async () => {
        const expectedResponse = createCreateQueryResponseFromCacheStub();
        expectedResponse.subqueries[2].result = null;
        expect(response).toEqual(expectedResponse);
      });

      it('should handle errors by throwing RpcException', async () => {
        const errorMessage = 'test error';

        (firstValueFrom as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(queryManagerService.fetchQueryRequestResultsFromCache(request, false)).rejects.toThrow(
          errorMessage,
        );
      });
    });
  });

  describe('fetchQueryRequestResultsFromDataSource', () => {
    describe('when fetchQueryRequestResultsFromDataSource is called', () => {
      let request: QueryEntity;
      let response: CreateQueryResponseDto;

      beforeEach(async () => {
        request = getQueryEntityWithoutResults();
        jest.spyOn(queryManagerService, 'fetchQueryRequestResultsFromDataSource'); // Required for first test
        (queryRepository.save as jest.Mock).mockResolvedValueOnce(getQueryEntityWithoutResults());
        response = await queryManagerService.fetchQueryRequestResultsFromDataSource(request);
      });

      it('should be called with correct parameters', () => {
        expect(queryManagerService.fetchQueryRequestResultsFromDataSource).toHaveBeenCalledWith(request);
      });

      it('should call client.emit with correct parameters and not return the response', async () => {
        expect(mockClientProxy.emit).toHaveBeenCalledTimes(3);

        expect(mockClientProxy.emit.mock.calls).toEqual(
          initialSubqueriesStub().map((e) => [MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_SCHEDULE_FETCH, e]),
        );
      });

      it('should return a response', async () => {
        const expectedResponse = createCreateQueryResponseNoCacheStub();
        expect(response).toEqual(expectedResponse);
      });

      it('should handle query errors by throwing RpcException', async () => {
        const errorMessage = 'test error';

        (queryRepository.save as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(queryManagerService.fetchQueryRequestResultsFromDataSource(request)).rejects.toThrow(errorMessage);
      });

      it('should handle subquery errors by throwing RpcException', async () => {
        const errorMessage = 'test error';

        (subqueryRepository.save as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(queryManagerService.fetchQueryRequestResultsFromDataSource(request)).rejects.toThrow(errorMessage);
      });
    });
  });

  describe('generateQueryEntityFromCreateDtoAsync', () => {
    describe('when generateQueryEntityFromCreateDtoAsync is called', () => {
      let request: CreateQueryRequestDto;
      let response: QueryEntity;
      const expectedResponse: QueryEntity = getQueryEntityWithoutResults();

      beforeEach(async () => {
        request = createCreateQueryRequestStub();
        jest.spyOn(queryManagerService, 'generateQueryEntityFromCreateDtoAsync'); // Required for first test
        (uuidv4 as jest.Mock)
          .mockReturnValueOnce(expectedResponse.subqueries[0].id)
          .mockReturnValueOnce(expectedResponse.subqueries[1].id)
          .mockReturnValueOnce(expectedResponse.subqueries[2].id)
          .mockReturnValueOnce(expectedResponse.id);
        response = await queryManagerService.generateQueryEntityFromCreateDtoAsync(request);
      });

      it('should be called with dto', () => {
        expect(queryManagerService.generateQueryEntityFromCreateDtoAsync).toHaveBeenCalledWith(request);
      });

      it('should return a response', async () => {
        expect(response).toEqual(expectedResponse);
      });
    });
  });
});
