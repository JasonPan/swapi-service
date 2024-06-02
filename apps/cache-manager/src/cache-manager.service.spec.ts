import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManagerController } from './cache-manager.controller';
import { CacheManagerService } from './cache-manager.service';
import { SubqueryDto } from 'lib/common/dto';
import { SwapiResourceEntity } from 'lib/common/entities';
import {
  createReadCacheResponseStub,
  createReadCacheRequestStub,
  createUpdateCacheRequestStub,
  getSwapiResourceEntity,
} from 'lib/common/stubs';
import { mockClientProxy, mockSwapiResourceRepository } from 'lib/common/mocks';

describe('CacheManagerService', () => {
  let cacheManagerService: CacheManagerService;
  let swapiResourceRepository: Repository<SwapiResourceEntity>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CacheManagerController],
      providers: [
        CacheManagerService,
        { provide: 'cache-manager', useValue: mockClientProxy },
        { provide: getRepositoryToken(SwapiResourceEntity), useValue: mockSwapiResourceRepository },
      ],
    }).compile();

    cacheManagerService = app.get<CacheManagerService>(CacheManagerService);
    swapiResourceRepository = app.get<Repository<SwapiResourceEntity>>(getRepositoryToken(SwapiResourceEntity));

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('CacheManagerService should be defined', () => {
      expect(cacheManagerService).toBeDefined();
    });

    it('CacheManagerService functions should be defined', () => {
      expect(cacheManagerService.readCacheAsync).toBeDefined();
      expect(cacheManagerService.updateCache).toBeDefined();
    });
  });

  describe('readCacheAsync', () => {
    describe('when readCacheAsync is called', () => {
      let request: SubqueryDto;
      let result: SubqueryDto;

      beforeEach(async () => {
        request = createReadCacheRequestStub();
        jest.spyOn(cacheManagerService, 'readCacheAsync'); // Required for first test
        result = await cacheManagerService.readCacheAsync(request);
      });

      it('should be called with dto', () => {
        expect(cacheManagerService.readCacheAsync).toHaveBeenCalledWith(request);
      });

      it('should call swapiResourceRepository and get entity', () => {
        expect(swapiResourceRepository.findOne).toHaveBeenCalledWith({ where: { path: request.path } });
      });

      it('should not return a result', async () => {
        expect(result).toEqual(createReadCacheResponseStub());
      });

      it('should handle errors by throwing RpcException', async () => {
        const errorMessage = 'test error';

        (swapiResourceRepository.findOne as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(cacheManagerService.readCacheAsync(request)).rejects.toThrow(errorMessage);
      });
    });
  });

  describe('updateCache', () => {
    describe('when updateCache is called', () => {
      let request: SubqueryDto;
      let result: void;

      beforeEach(async () => {
        request = createUpdateCacheRequestStub();
        jest.spyOn(cacheManagerService, 'updateCache'); // Required for first test
        result = await cacheManagerService.updateCache(request);
      });

      it('should be called with dto', () => {
        expect(cacheManagerService.updateCache).toHaveBeenCalledWith(request);
      });

      it('should call swapiResourceRepository and save entity', () => {
        expect(swapiResourceRepository.save).toHaveBeenCalledWith(getSwapiResourceEntity());
      });

      it('should not return a result', async () => {
        expect(result).toEqual(undefined);
      });

      it('should handle errors by throwing RpcException', async () => {
        const errorMessage = 'test error';

        (swapiResourceRepository.save as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(cacheManagerService.updateCache(request)).rejects.toThrow(errorMessage);
      });
    });
  });
});
