import { GetQueryRequestDto, QueryDto, CreateQueryRequestDto, CreateQueryResponseDto } from '../dto';

export const createGetQueryRequestStub = () => {
  const getQueryRequestStub: GetQueryRequestDto = {
    id: 'test',
  };

  return getQueryRequestStub;
};

export const createGetQueryResponseStub = () => {
  const getQueryResponseStub: QueryDto = createCreateQueryResponseStub();
  return getQueryResponseStub;
};

export const createCreateQueryRequestStub = () => {
  const getQueryRequestStub: CreateQueryRequestDto = {
    subqueries: ['people/1', 'planets/3', 'starships/9'],
    callbackUrl: 'http://localhost:3000',
  };

  return getQueryRequestStub;
};

export const createCreateQueryResponseStub = () => {
  const getQueryRequestStub: CreateQueryResponseDto = {
    id: 'aa32f05d-f5a5-4092-985e-141155a93ad8',
    subqueries: [
      {
        id: '9d58b5b9-ca1a-47af-baa6-df4eef0d1c2c',
        path: 'people/1',
        result: {
          name: 'Luke Skywalker',
          height: '172',
          mass: '77',
          hair_color: 'blond',
          skin_color: 'fair',
          eye_color: 'blue',
          birth_year: '19BBY',
          gender: 'male',
          homeworld: 'https://swapi.dev/api/planets/1/',
          films: [
            'https://swapi.dev/api/films/1/',
            'https://swapi.dev/api/films/2/',
            'https://swapi.dev/api/films/3/',
            'https://swapi.dev/api/films/6/',
          ],
          species: [],
          vehicles: ['https://swapi.dev/api/vehicles/14/', 'https://swapi.dev/api/vehicles/30/'],
          starships: ['https://swapi.dev/api/starships/12/', 'https://swapi.dev/api/starships/22/'],
          created: '2014-12-09T13:50:51.644000Z',
          edited: '2014-12-20T21:17:56.891000Z',
          url: 'https://swapi.dev/api/people/1/',
        },
        query_id: 'aa32f05d-f5a5-4092-985e-141155a93ad8',
      },
      {
        id: '85bff72b-bf8f-4752-862d-2e1b6a8a452e',
        path: 'starships/9',
        result: {
          name: 'Death Star',
          model: 'DS-1 Orbital Battle Station',
          manufacturer: 'Imperial Department of Military Research, Sienar Fleet Systems',
          cost_in_credits: '1000000000000',
          length: '120000',
          max_atmosphering_speed: 'n/a',
          crew: '342,953',
          passengers: '843,342',
          cargo_capacity: '1000000000000',
          consumables: '3 years',
          hyperdrive_rating: '4.0',
          MGLT: '10',
          starship_class: 'Deep Space Mobile Battlestation',
          pilots: [],
          films: ['https://swapi.dev/api/films/1/'],
          created: '2014-12-10T16:36:50.509000Z',
          edited: '2014-12-20T21:26:24.783000Z',
          url: 'https://swapi.dev/api/starships/9/',
        },
        query_id: 'aa32f05d-f5a5-4092-985e-141155a93ad8',
      },
      {
        id: 'ac31166e-34f2-4b08-92c6-9a8688df4dd4',
        path: 'planets/3',
        result: {
          name: 'Yavin IV',
          rotation_period: '24',
          orbital_period: '4818',
          diameter: '10200',
          climate: 'temperate, tropical',
          gravity: '1 standard',
          terrain: 'jungle, rainforests',
          surface_water: '8',
          population: '1000',
          residents: [],
          films: ['https://swapi.dev/api/films/1/'],
          created: '2014-12-10T11:37:19.144000Z',
          edited: '2014-12-20T20:58:18.421000Z',
          url: 'https://swapi.dev/api/planets/3/',
        },
        query_id: 'aa32f05d-f5a5-4092-985e-141155a93ad8',
      },
    ],
    callbackUrl: 'http://localhost:3000',
    status: 'COMPLETED',
  };

  return getQueryRequestStub;
};
