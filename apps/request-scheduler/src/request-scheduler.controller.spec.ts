import { Test, TestingModule } from '@nestjs/testing';
import { RequestSchedulerController } from './request-scheduler.controller';
import { RequestSchedulerService } from './request-scheduler.service';

describe('RequestSchedulerController', () => {
  let requestSchedulerController: RequestSchedulerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RequestSchedulerController],
      providers: [RequestSchedulerService],
    }).compile();

    requestSchedulerController = app.get<RequestSchedulerController>(RequestSchedulerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(requestSchedulerController.getHello()).toBe('Hello World!');
    });
  });
});
