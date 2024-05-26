import { Test, TestingModule } from '@nestjs/testing';
import { SwapiConnectorController } from './swapi-connector.controller';
import { SwapiConnectorService } from './swapi-connector.service';

describe('SwapiConnectorController', () => {
  let swapiConnectorController: SwapiConnectorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SwapiConnectorController],
      providers: [SwapiConnectorService],
    }).compile();

    swapiConnectorController = app.get<SwapiConnectorController>(SwapiConnectorController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(swapiConnectorController.getHello()).toBe('Hello World!');
    });
  });
});
