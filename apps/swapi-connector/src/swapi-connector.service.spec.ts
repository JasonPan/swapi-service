import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { SwapiConnectorController } from './swapi-connector.controller';
import { SwapiConnectorService } from './swapi-connector.service';
import { SubqueryDto } from 'lib/common/dto';
import { MICROSERVICE_SUBJECTS } from 'lib/common/constants';
import { completedSubqueriesStub, initialSubqueriesStub } from 'lib/common/stubs';
import { mockClientProxy, mockConfigService, mockHttpService, mockLogger } from 'lib/common/mocks';
import { ConfigService } from '@nestjs/config';

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

describe('SwapiConnectorService', () => {
  let swapiConnectorService: SwapiConnectorService;

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
      controllers: [SwapiConnectorController],
      providers: [
        SwapiConnectorService,
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
        { provide: 'swapi-connector', useValue: mockClientProxy },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    swapiConnectorService = app.get<SwapiConnectorService>(SwapiConnectorService);

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('SwapiConnectorService should be defined', () => {
      expect(swapiConnectorService).toBeDefined();
    });

    it('SwapiConnectorService functions should be defined', () => {
      expect(swapiConnectorService.fetchDataAsync).toBeDefined();
    });
  });

  describe('fetchDataAsync', () => {
    describe('when fetchDataAsync is called and data is present in cache', () => {
      let request: SubqueryDto;
      let response: void;

      beforeEach(async () => {
        request = initialSubqueriesStub()[0];
        jest.spyOn(swapiConnectorService, 'fetchDataAsync'); // Required for first test
        (firstValueFrom as jest.Mock).mockResolvedValueOnce(completedSubqueriesStub()[0]);
        response = await swapiConnectorService.fetchDataAsync(request);
      });

      it('should be called with correct parameters', () => {
        expect(swapiConnectorService.fetchDataAsync).toHaveBeenCalledWith(request);
      });

      it('should call client.send with correct parameters and return the response', async () => {
        expect(mockClientProxy.send).toHaveBeenCalledWith(MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ, request);
      });

      it('should call client.emit with correct parameters and not return the response', async () => {
        expect(mockClientProxy.emit).not.toHaveBeenCalledWith(
          MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_RECEIVE,
          completedSubqueriesStub()[0],
        );
      });

      it('should not return a response', async () => {
        expect(response).toEqual(undefined);
      });
    });
  });

  describe('fetchDataAsync', () => {
    describe('when fetchDataAsync is called and data is not present in cache', () => {
      let request: SubqueryDto;
      let response: void;

      beforeEach(async () => {
        request = initialSubqueriesStub()[0];
        jest.spyOn(swapiConnectorService, 'fetchDataAsync'); // Required for first test
        (firstValueFrom as jest.Mock).mockResolvedValueOnce(initialSubqueriesStub()[0]);
        (mockHttpService.axiosRef.get as jest.Mock).mockResolvedValueOnce(completedSubqueriesStub()[0]);
        response = await swapiConnectorService.fetchDataAsync(request);
      });

      it('should be called with correct parameters', () => {
        expect(swapiConnectorService.fetchDataAsync).toHaveBeenCalledWith(request);
      });

      it('should call client.send with correct parameters and return the response', async () => {
        expect(mockClientProxy.send).toHaveBeenCalledWith(MICROSERVICE_SUBJECTS.MESSAGES.CACHE_READ, request);
      });

      it('should call SWAPI HTTP service with correct parameters and return the response', async () => {
        expect(mockHttpService.axiosRef.get).toHaveBeenCalledWith(
          expect.stringContaining(request.path),
          expect.any(Object),
        );
      });

      it('should call client.emit with correct parameters and not return the response', async () => {
        expect(mockClientProxy.emit).not.toHaveBeenCalledWith(
          MICROSERVICE_SUBJECTS.EVENTS.SUBQUERY_RESULT_RECEIVE,
          completedSubqueriesStub()[0],
        );
      });

      it('should not return a response', async () => {
        expect(response).toEqual(undefined);
      });
    });
  });
});
