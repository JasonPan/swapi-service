import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RequestSchedulerController } from './request-scheduler.controller';
import { RequestSchedulerService } from './request-scheduler.service';
import { SubqueryDto } from 'lib/common/dto';
import { initialSubqueriesStub } from 'lib/common/stubs';
import { mockLogger } from 'lib/common/mocks';

jest.mock('./request-scheduler.service');

describe('RequestSchedulerController', () => {
  let requestSchedulerController: RequestSchedulerController;
  let requestSchedulerService: RequestSchedulerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RequestSchedulerController],
      providers: [{ provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger }, RequestSchedulerService],
    }).compile();

    requestSchedulerController = app.get<RequestSchedulerController>(RequestSchedulerController);
    requestSchedulerService = app.get<RequestSchedulerService>(RequestSchedulerService);

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('RequestSchedulerController and RequestSchedulerService should be defined', () => {
      expect(requestSchedulerController).toBeDefined();
      expect(requestSchedulerService).toBeDefined();
    });

    it('RequestSchedulerController functions should be defined', () => {
      expect(requestSchedulerController.scheduleRequest).toBeDefined();
    });

    it('RequestSchedulerService functions should be defined', () => {
      expect(requestSchedulerService.scheduleRequestAsync).toBeDefined();
    });
  });

  describe('scheduleRequest', () => {
    describe('when scheduleRequest is called', () => {
      const request: SubqueryDto = initialSubqueriesStub()[0];
      const bodyParameters: SubqueryDto = request;
      let response: void;

      beforeEach(async () => {
        response = await requestSchedulerController.scheduleRequest(bodyParameters);
      });

      it('should call requestSchedulerService', () => {
        expect(requestSchedulerService.scheduleRequestAsync).toHaveBeenCalledWith(request);
      });

      it('should return a response', () => {
        expect(response).toEqual(undefined);
      });
    });
  });
});
