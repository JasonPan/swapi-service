import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TrafficControllerController } from './traffic-controller.controller';
import { TrafficControllerService } from './traffic-controller.service';
import { mockLogger } from 'lib/common/mocks';

jest.mock('./traffic-controller.service');

describe('TrafficControllerController', () => {
  let trafficControllerController: TrafficControllerController;
  let trafficControllerService: TrafficControllerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TrafficControllerController],
      providers: [{ provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger }, TrafficControllerService],
    }).compile();

    trafficControllerController = app.get<TrafficControllerController>(TrafficControllerController);
    trafficControllerService = app.get<TrafficControllerService>(TrafficControllerService);

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('TrafficControllerController and TrafficControllerService should be defined', () => {
      expect(trafficControllerController).toBeDefined();
      expect(trafficControllerService).toBeDefined();
    });

    it('TrafficControllerController functions should be defined', () => {
      expect(trafficControllerController.getIsRateLimitedAsync).toBeDefined();
      expect(trafficControllerController.incrementRateLimitUsage).toBeDefined();
    });

    it('TrafficControllerService functions should be defined', () => {
      expect(trafficControllerService.getIsRateLimitedAsync).toBeDefined();
      expect(trafficControllerService.getSystemDownstreamUsageKey).toBeDefined();
      expect(trafficControllerService.logUsage).toBeDefined();
      expect(trafficControllerService.getUsageCount).toBeDefined();
    });
  });

  describe('getIsRateLimitedAsync', () => {
    describe('when getIsRateLimitedAsync is called', () => {
      let response: boolean;

      beforeEach(async () => {
        response = await trafficControllerController.getIsRateLimitedAsync();
      });

      it('should call trafficControllerService', () => {
        expect(trafficControllerService.getIsRateLimitedAsync).toHaveBeenCalledWith();
      });

      it('should return a response', () => {
        expect(response).toEqual(true);
      });
    });
  });
});
