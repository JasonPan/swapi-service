import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { firstValueFrom } from 'rxjs';
import { getQueueToken } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { RequestSchedulerController } from '../request-scheduler.controller';
import { RequestSchedulerService } from '../request-scheduler.service';
import { ScheduledRequestProcessor } from './scheduled-request-processor';
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

describe('ScheduledRequestProcessor', () => {
  let scheduledRequestsQueue: Queue<SubqueryDto>;
  let scheduledRequestProcessor: ScheduledRequestProcessor;

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
        ScheduledRequestProcessor,
      ],
    }).compile();

    scheduledRequestsQueue = app.get<Queue<SubqueryDto>>(getQueueToken('scheduled-requests'));
    scheduledRequestProcessor = app.get<ScheduledRequestProcessor>(ScheduledRequestProcessor);

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('ScheduledRequestProcessor should be defined', () => {
      expect(scheduledRequestProcessor).toBeDefined();
    });

    it('ScheduledRequestProcessor functions should be defined', () => {
      expect(scheduledRequestProcessor.process).toBeDefined();
    });
  });

  describe('process', () => {
    describe('when process is called and has hit rate limit', () => {
      let request: Job<SubqueryDto>;
      let response: void;
      const hasHitRateLimit = true;
      const targetScheduledRequestId = '652a3921-5b65-430a-85ba-a2e5eae905d3';
      const jobStub = {
        id: targetScheduledRequestId,
        data: initialSubqueriesStub()[0],
        delay: 86400 * 1000,
      };
      // const requestedAt = new Date();

      beforeEach(async () => {
        request = jobStub as any;
        jest.spyOn(scheduledRequestProcessor, 'process'); // Required for first test
        (firstValueFrom as jest.Mock).mockResolvedValueOnce(hasHitRateLimit);
        (uuidv4 as jest.Mock).mockReturnValueOnce(targetScheduledRequestId);
        response = await scheduledRequestProcessor.process(request);
      });

      it('should be called with correct parameters', () => {
        expect(scheduledRequestProcessor.process).toHaveBeenCalledWith(request);
      });

      it('should call client.send with correct parameters and return the response', async () => {
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
          request.data,
          expect.objectContaining({ delay: expect.any(Number) }),
        );
      });

      it('should not return a response', async () => {
        expect(response).toEqual(undefined);
      });
    });

    describe('when process is called and has not hit rate limit', () => {
      let request: Job<SubqueryDto>;
      let response: void;
      const hasHitRateLimit = false;
      const targetScheduledRequestId = '652a3921-5b65-430a-85ba-a2e5eae905d3';
      const jobStub = {
        id: targetScheduledRequestId,
        data: initialSubqueriesStub()[0],
        delay: 86400 * 1000,
      };
      // const requestedAt = new Date();

      beforeEach(async () => {
        request = jobStub as any;
        jest.spyOn(scheduledRequestProcessor, 'process'); // Required for first test
        (firstValueFrom as jest.Mock).mockResolvedValueOnce(hasHitRateLimit);
        (uuidv4 as jest.Mock).mockReturnValueOnce(targetScheduledRequestId);
        response = await scheduledRequestProcessor.process(request);
      });

      it('should be called with correct parameters', () => {
        expect(scheduledRequestProcessor.process).toHaveBeenCalledWith(request);
      });

      it('should call client.send with correct parameters and return the response', async () => {
        expect(mockClientProxy.send).toHaveBeenCalledWith(MICROSERVICE_SUBJECTS.MESSAGES.RATE_LIMIT_USAGE_READ, {
          // TODO: investigate bug with jest.useFakeTimers()
          // requestedAt,
          requestedAt: expect.any(Date),
        });
      });

      it('should call client.emit with correct parameters and not return the response', async () => {
        expect(mockClientProxy.emit).toHaveBeenCalledWith(
          MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_FETCH,
          request.data,
        );
      });

      it('should not return a response', async () => {
        expect(response).toEqual(undefined);
      });
    });
  });
});
