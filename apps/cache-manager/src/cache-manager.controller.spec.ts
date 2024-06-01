import { Test, TestingModule } from '@nestjs/testing';
import { CacheManagerController } from './cache-manager.controller';
import { CacheManagerService } from './cache-manager.service';

describe('CacheManagerController', () => {
  let CacheManagerController: CacheManagerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CacheManagerController],
      providers: [CacheManagerService],
    }).compile();

    CacheManagerController = app.get<CacheManagerController>(CacheManagerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(CacheManagerController.getHello()).toBe('Hello World!');
    });
  });
});
