import { completedSubqueriesStub, getQueryEntity, initialSubqueriesStub } from '.';
import { GetQueryRequestDto, QueryDto, CreateQueryRequestDto, CreateQueryResponseDto } from '../dto';

export const createGetQueryRequestStub = () => {
  const getQueryRequestStub: GetQueryRequestDto = {
    id: getQueryEntity().id,
  };

  return getQueryRequestStub;
};

export const createGetQueryResponseCompletedStub = () => {
  const getQueryResponseStub: QueryDto = createCreateQueryResponseFromCacheStub();
  return getQueryResponseStub;
};

export const createGetQueryResponsePendingStub = () => {
  const getQueryResponseStub: QueryDto = createCreateQueryResponseNoCacheStub();
  return getQueryResponseStub;
};

export const createCreateQueryRequestStub = () => {
  const getQueryRequestStub: CreateQueryRequestDto = {
    subqueries: ['people/1', 'starships/9', 'planets/3'],
    callbackUrl: 'http://localhost:3000',
  };

  return getQueryRequestStub;
};

export const createCreateQueryResponseFromCacheStub = () => {
  const getQueryRequestStub: CreateQueryResponseDto = {
    id: 'aa32f05d-f5a5-4092-985e-141155a93ad8',
    subqueries: completedSubqueriesStub(),
    callbackUrl: 'http://localhost:3000',
    status: 'COMPLETED',
  };

  return getQueryRequestStub;
};

export const createCreateQueryResponseNoCacheStub = () => {
  const getQueryRequestStub: CreateQueryResponseDto = {
    id: 'aa32f05d-f5a5-4092-985e-141155a93ad8',
    subqueries: initialSubqueriesStub(),
    callbackUrl: 'http://localhost:3000',
    status: 'PENDING',
  };

  return getQueryRequestStub;
};
