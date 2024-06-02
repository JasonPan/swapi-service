import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { QueryManagerController } from './query-manager.controller';
import { QueryManagerService } from './query-manager.service';
import {
  CreateQueryRequestDto,
  CreateQueryResponseDto,
  GetQueryRequestDto,
  QueryDto,
  SubqueryDto,
} from 'lib/common/dto';
import {
  completedSubqueriesStub,
  createCreateQueryRequestStub,
  createCreateQueryResponseFromCacheStub,
  createGetQueryRequestStub,
  createGetQueryResponseCompletedStub,
} from 'lib/common/stubs';
import { mockLogger } from 'lib/common/mocks';

jest.mock('./query-manager.service');

describe('QueryManagerController', () => {
  let queryManagerController: QueryManagerController;
  let queryManagerService: QueryManagerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QueryManagerController],
      providers: [{ provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger }, QueryManagerService],
    }).compile();

    queryManagerController = app.get<QueryManagerController>(QueryManagerController);
    queryManagerService = app.get<QueryManagerService>(QueryManagerService);

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('QueryManagerController and QueryManagerService should be defined', () => {
      expect(queryManagerController).toBeDefined();
      expect(queryManagerService).toBeDefined();
    });

    it('QueryManagerController functions should be defined', () => {
      expect(queryManagerController.processNewQueryRequestAsync).toBeDefined();
      expect(queryManagerController.handleSubqueryResultAsync).toBeDefined();
      expect(queryManagerController.getQueryRequestAsync).toBeDefined();
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
      const request: CreateQueryRequestDto = createCreateQueryRequestStub();
      const bodyParameters: CreateQueryRequestDto = request;
      let response: CreateQueryResponseDto;

      beforeEach(async () => {
        response = await queryManagerController.processNewQueryRequestAsync(bodyParameters);
      });

      it('should call queryManagerService', () => {
        expect(queryManagerService.processNewQueryRequestAsync).toHaveBeenCalledWith(request);
      });

      it('should return a response', () => {
        expect(response).toEqual(createCreateQueryResponseFromCacheStub());
      });
    });
  });

  describe('handleSubqueryResultAsync', () => {
    describe('when handleSubqueryResultAsync is called', () => {
      const request: SubqueryDto = completedSubqueriesStub()[0];
      const bodyParameters: SubqueryDto = request;
      let response: void;

      beforeEach(async () => {
        response = await queryManagerController.handleSubqueryResultAsync(bodyParameters);
      });

      it('should call queryManagerService', () => {
        expect(queryManagerService.handleSubqueryResultAsync).toHaveBeenCalledWith(request);
      });

      it('should return a response', () => {
        expect(response).toEqual(undefined);
      });
    });
  });

  describe('getQueryRequestAsync', () => {
    describe('when getQueryRequestAsync is called', () => {
      const request: GetQueryRequestDto = createGetQueryRequestStub();
      const bodyParameters: GetQueryRequestDto = request;
      let response: QueryDto;

      beforeEach(async () => {
        response = await queryManagerController.getQueryRequestAsync(bodyParameters);
      });

      it('should call queryManagerService', () => {
        expect(queryManagerService.fetchQueryResultsAsync).toHaveBeenCalledWith(request);
      });

      it('should return a response', () => {
        expect(response).toEqual(createGetQueryResponseCompletedStub());
      });
    });
  });
});
