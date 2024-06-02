import { Test, TestingModule } from '@nestjs/testing';
import { SwapiConnectorController } from './swapi-connector.controller';
import { SwapiConnectorService } from './swapi-connector.service';
import { SubqueryDto } from 'lib/common/dto';
import { initialSubqueriesStub } from 'lib/common/stubs';

jest.mock('./swapi-connector.service');

describe('SwapiConnectorController', () => {
  let swapiConnectorController: SwapiConnectorController;
  let swapiConnectorService: SwapiConnectorService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SwapiConnectorController],
      providers: [SwapiConnectorService],
    }).compile();

    swapiConnectorController = app.get<SwapiConnectorController>(SwapiConnectorController);
    swapiConnectorService = app.get<SwapiConnectorService>(SwapiConnectorService);

    jest.clearAllMocks();
  });

  describe('Validate dependencies are defined', () => {
    it('SwapiConnectorController and SwapiConnectorService should be defined', () => {
      expect(swapiConnectorController).toBeDefined();
      expect(swapiConnectorService).toBeDefined();
    });

    it('SwapiConnectorController functions should be defined', () => {
      expect(swapiConnectorController.fetchData).toBeDefined();
    });

    it('SwapiConnectorService functions should be defined', () => {
      expect(swapiConnectorService.fetchDataAsync).toBeDefined();
    });
  });

  describe('fetchData', () => {
    describe('when fetchData is called', () => {
      const request: SubqueryDto = initialSubqueriesStub()[0];
      const bodyParameters: SubqueryDto = request;
      let response: void;

      beforeEach(async () => {
        response = await swapiConnectorController.fetchData(bodyParameters);
      });

      it('should call swapiConnectorService', () => {
        expect(swapiConnectorService.fetchDataAsync).toHaveBeenCalledWith(request);
      });

      it('should return a response', () => {
        expect(response).toEqual(undefined);
      });
    });
  });
});
