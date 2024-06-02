import { SubqueryDto } from '../dto';

const subqueryStub: SubqueryDto = {
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
};

export const createReadCacheRequestStub = (): SubqueryDto => {
  const stub = { ...subqueryStub };
  delete stub['result'];
  return stub;
};

export const createReadCacheResponseStub = (): SubqueryDto => {
  const stub = { ...subqueryStub };
  return stub;
};

export const createUpdateCacheRequestStub = (): SubqueryDto => {
  const stub = { ...subqueryStub };
  return stub;
};
