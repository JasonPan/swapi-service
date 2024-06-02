import { QueryEntity, SubqueryEntity, SwapiResourceEntity } from '../entities';

const swapiResources: SwapiResourceEntity[] = [
  {
    _id: '00a2e39d-b9aa-4cec-8f0f-1f1983d8fffa',
    path: 'people/1',
    cached_result: {
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
  },
  {
    _id: '88fdc14d-1d2c-4d33-aff1-12af46d01d9a',
    path: 'starships/9',
    cached_result: {
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
  },
  {
    _id: '1d3a0aad-91e4-4ab0-a724-1d5a9ac8b480',
    path: 'planets/3',
    cached_result: {
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
  },
].map((e) => {
  const entity = new SwapiResourceEntity();
  entity._id = e._id;
  entity.path = e.path;
  entity.cached_result = e.cached_result;

  return entity;
});

const query = new QueryEntity();
query.id = 'aa32f05d-f5a5-4092-985e-141155a93ad8';
query.subqueries = [];
query.callback_url = 'http://localhost:3000';
query.status = 'COMPLETED';

const subqueries: SubqueryEntity[] = [
  {
    id: '9d58b5b9-ca1a-47af-baa6-df4eef0d1c2c',
    path: 'people/1',
    result: swapiResources[0].cached_result,
    query,
  },
  {
    id: '85bff72b-bf8f-4752-862d-2e1b6a8a452e',
    path: 'starships/9',
    result: swapiResources[1].cached_result,
    query,
  },
  {
    id: 'ac31166e-34f2-4b08-92c6-9a8688df4dd4',
    path: 'planets/3',
    result: swapiResources[2].cached_result,
    query,
  },
].map((e) => {
  const entity = new SubqueryEntity();
  entity.id = e.id;
  entity.query = query;
  entity.path = e.path;
  entity.result = e.result;

  return entity;
});
query.subqueries = subqueries;

const queryWithoutResults = new QueryEntity();
queryWithoutResults.id = 'aa32f05d-f5a5-4092-985e-141155a93ad8';
queryWithoutResults.subqueries = [];
queryWithoutResults.callback_url = 'http://localhost:3000';
queryWithoutResults.status = 'PENDING';

const subqueriesWithoutResults: SubqueryEntity[] = subqueries.map((e) => {
  const entity = new SubqueryEntity();
  entity.id = e.id;
  entity.query = queryWithoutResults;
  entity.path = e.path;

  return entity;
});
queryWithoutResults.subqueries = subqueriesWithoutResults;

export const getQueryEntity = (): QueryEntity => {
  return query;
};

export const getSubqueryEntities = (): SubqueryEntity[] => {
  return subqueries;
};

export const getQueryEntityWithoutResults = (): QueryEntity => {
  return queryWithoutResults;
};

export const getSubqueryEntitiesWithoutResults = (): SubqueryEntity[] => {
  return subqueriesWithoutResults;
};

export const getSwapiResourceEntities = (): SwapiResourceEntity[] => {
  return swapiResources;
};
