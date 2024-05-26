import { Test, TestingModule } from '@nestjs/testing';
import { TrafficControllerController } from './traffic-controller.controller';
import { TrafficControllerService } from './traffic-controller.service';

describe('TrafficControllerController', () => {
  let trafficControllerController: TrafficControllerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TrafficControllerController],
      providers: [TrafficControllerService],
    }).compile();

    trafficControllerController = app.get<TrafficControllerController>(TrafficControllerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(trafficControllerController.getHello()).toBe('Hello World!');
    });
  });
});
