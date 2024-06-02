import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CacheManagerController } from './cache-manager.controller';
import { CacheManagerService } from './cache-manager.service';
import { SubqueryDto } from 'lib/common/dto';
import {
  createReadCacheRequestStub,
  createReadCacheResponseStub,
  createUpdateCacheRequestStub,
} from 'lib/common/stubs';
import { mockLogger } from 'lib/common/mocks';

jest.mock('./cache-manager.service');

describe('CacheManagerController', () => {
  let cacheManagerController: CacheManagerController;
  let cacheManagerService: CacheManagerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CacheManagerController],
      providers: [{ provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger }, CacheManagerService],
    }).compile();

    cacheManagerController = app.get<CacheManagerController>(CacheManagerController);
    cacheManagerService = app.get<CacheManagerService>(CacheManagerService);

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('CacheManagerController and CacheManagerService should be defined', () => {
      expect(cacheManagerController).toBeDefined();
      expect(cacheManagerService).toBeDefined();
    });

    it('CacheManagerController functions should be defined', () => {
      expect(cacheManagerController.readCacheAsync).toBeDefined();
      expect(cacheManagerController.updateCache).toBeDefined();
    });

    it('CacheManagerService functions should be defined', () => {
      expect(cacheManagerService.readCacheAsync).toBeDefined();
      expect(cacheManagerService.updateCache).toBeDefined();
    });
  });

  describe('readCacheAsync', () => {
    describe('when readCacheAsync is called', () => {
      const request: SubqueryDto = createReadCacheRequestStub();
      const bodyParameters: SubqueryDto = request;
      let response: SubqueryDto;

      beforeEach(async () => {
        response = await cacheManagerController.readCacheAsync(bodyParameters);
      });

      it('should call cacheManagerService', () => {
        expect(cacheManagerService.readCacheAsync).toHaveBeenCalledWith(request);
      });

      it('should return a response', () => {
        expect(response).toEqual(createReadCacheResponseStub());
      });
    });
  });

  describe('updateCache', () => {
    describe('when updateCache is called', () => {
      const request: SubqueryDto = createUpdateCacheRequestStub();
      const bodyParameters: SubqueryDto = request;
      let response: void;

      beforeEach(async () => {
        response = await cacheManagerController.updateCache(bodyParameters);
      });

      it('should call cacheManagerService', () => {
        expect(cacheManagerService.updateCache).toHaveBeenCalledWith(request);
      });

      it('should not return a response', () => {
        expect(response).toEqual(undefined);
      });
    });
  });
});
