import { Test, TestingModule } from '@nestjs/testing';
import { QueryManagerController } from './query-manager.controller';
import { QueryManagerService } from './query-manager.service';

describe('QueryManagerController', () => {
  let queryManagerController: QueryManagerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QueryManagerController],
      providers: [QueryManagerService],
    }).compile();

    queryManagerController = app.get<QueryManagerController>(QueryManagerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(queryManagerController.getHello()).toBe('Hello World!');
    });
  });
});
