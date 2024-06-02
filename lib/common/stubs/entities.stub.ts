import { QueryEntity, SubqueryEntity, SwapiResourceEntity } from '../entities';

const swapiResource: SwapiResourceEntity = {
  _id: '9d58b5b9-ca1a-47af-baa6-df4eef0d1c2c',
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
};

const query: QueryEntity = {
  id: '5f394e43-e874-432f-8c27-1548283aca41',
  subqueries: [],
  callback_url: 'http://localhost:3000',
  status: 'PENDING',
};
const subquery: SubqueryEntity = {
  id: '00a2e39d-b9aa-4cec-8f0f-1f1983d8fffa',
  query,
  path: swapiResource.path,
  result: swapiResource.cached_result,
};
query.subqueries = [subquery];

export const getQueryEntity = (): QueryEntity => {
  const entity = new QueryEntity();
  entity.id = query.id;
  entity.subqueries = query.subqueries;
  entity.callback_url = query.callback_url;
  entity.status = query.status;

  return entity;
};

export const getSubqueryEntity = (): SubqueryEntity => {
  const entity = new SubqueryEntity();
  entity.id = subquery.id;
  entity.query = query;
  entity.path = subquery.path;
  entity.result = subquery.result;

  return entity;
};

export const getSwapiResourceEntity = (): SwapiResourceEntity => {
  const entity = new SwapiResourceEntity();
  entity._id = swapiResource._id;
  entity.path = swapiResource.path;
  entity.cached_result = swapiResource.cached_result;

  return entity;
};
