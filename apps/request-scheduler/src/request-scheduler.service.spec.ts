import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { firstValueFrom } from 'rxjs';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { RequestSchedulerController } from './request-scheduler.controller';
import { RequestSchedulerService } from './request-scheduler.service';
import { SubqueryDto } from 'lib/common/dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import { initialSubqueriesStub } from 'lib/common/stubs';
import { mockClientProxy, mockLogger, mockQueue } from 'lib/common/mocks';

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

describe('RequestSchedulerService', () => {
  let requestSchedulerService: RequestSchedulerService;
  let scheduledRequestsQueue: Queue<SubqueryDto>;

  beforeAll(() => {
    jest.useFakeTimers();
    // TODO: investigate bug with jest.useFakeTimers()
  });

  afterAll(() => {
    jest.useRealTimers();
    // TODO: investigate bug with jest.useFakeTimers()
  });

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RequestSchedulerController],
      providers: [
        RequestSchedulerService,
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
        { provide: 'request-scheduler', useValue: mockClientProxy },
        { provide: 'BullQueue_scheduled-requests', useValue: mockQueue },
      ],
    }).compile();

    requestSchedulerService = app.get<RequestSchedulerService>(RequestSchedulerService);
    scheduledRequestsQueue = app.get<Queue<SubqueryDto>>(getQueueToken('scheduled-requests'));

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('RequestSchedulerService should be defined', () => {
      expect(requestSchedulerService).toBeDefined();
    });

    it('RequestSchedulerService functions should be defined', () => {
      expect(requestSchedulerService.scheduleRequestAsync).toBeDefined();
    });
  });

  describe('scheduleRequestAsync', () => {
    describe('when scheduleRequestAsync is called and has hit rate limit', () => {
      let request: SubqueryDto;
      let response: void;
      const hasHitRateLimit = true;
      const targetScheduledRequestId = '652a3921-5b65-430a-85ba-a2e5eae905d3';

      beforeEach(async () => {
        request = initialSubqueriesStub()[0];
        // jest.useFakeTimers().setSystemTime(new Date('2024-06-02'));
        jest.spyOn(requestSchedulerService, 'scheduleRequestAsync'); // Required for first test
        (firstValueFrom as jest.Mock).mockResolvedValueOnce(hasHitRateLimit);
        (uuidv4 as jest.Mock).mockReturnValueOnce(targetScheduledRequestId);
        response = await requestSchedulerService.scheduleRequestAsync(request);
      });

      it('should be called with correct parameters', () => {
        expect(requestSchedulerService.scheduleRequestAsync).toHaveBeenCalledWith(request);
      });

      it('should call client.send with correct parameters and return the response', async () => {
        // const requestedAt = new Date();
        expect(mockClientProxy.send).toHaveBeenCalledWith(MICROSERVICE_SUBJECTS.MESSAGES.RATE_LIMIT_USAGE_READ, {
          // TODO: investigate bug with jest.useFakeTimers()
          // requestedAt,
          requestedAt: expect.any(Date),
        });
      });

      it('should not call client.emit', async () => {
        expect(mockClientProxy.emit).not.toHaveBeenCalledWith(
          MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_FETCH,
          request,
        );
      });

      it('should call scheduledRequestsQueue and add request to the message queue', async () => {
        expect(scheduledRequestsQueue.add).toHaveBeenCalledWith(
          targetScheduledRequestId,
          request,
          expect.objectContaining({ delay: expect.any(Number) }),
        );
      });

      it('should not return a response', async () => {
        expect(response).toEqual(undefined);
      });
    });

    describe('when scheduleRequestAsync is called and has not hit rate limit', () => {
      let request: SubqueryDto;
      let response: void;
      const hasHitRateLimit = false;

      beforeEach(async () => {
        request = initialSubqueriesStub()[0];
        // jest.useFakeTimers().setSystemTime(new Date('2024-06-02'));
        jest.spyOn(requestSchedulerService, 'scheduleRequestAsync'); // Required for first test
        (firstValueFrom as jest.Mock).mockResolvedValueOnce(hasHitRateLimit);
        response = await requestSchedulerService.scheduleRequestAsync(request);
      });

      it('should be called with correct parameters', () => {
        expect(requestSchedulerService.scheduleRequestAsync).toHaveBeenCalledWith(request);
      });

      it('should call client.send with correct parameters and return the response', async () => {
        // const requestedAt = new Date();
        expect(mockClientProxy.send).toHaveBeenCalledWith(MICROSERVICE_SUBJECTS.MESSAGES.RATE_LIMIT_USAGE_READ, {
          // TODO: investigate bug with jest.useFakeTimers()
          // requestedAt,
          requestedAt: expect.any(Date),
        });
      });

      it('should call client.emit with correct parameters and not return the response', async () => {
        expect(mockClientProxy.emit).toHaveBeenCalledWith(MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_FETCH, request);
      });

      it('should not return a response', async () => {
        expect(response).toEqual(undefined);
      });
    });
  });
});
