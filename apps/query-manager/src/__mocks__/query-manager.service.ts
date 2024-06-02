import {
  createCreateQueryResponseFromCacheStub,
  createGetQueryResponseCompletedStub,
  createReadCacheResponseStub,
  getQueryEntity,
} from 'lib/common/stubs';

export const QueryManagerService = jest.fn().mockReturnValue({
  readCacheAsync: jest.fn().mockResolvedValue(createReadCacheResponseStub()),
  updateCache: jest.fn().mockResolvedValue(undefined),

  processNewQueryRequestAsync: jest.fn().mockResolvedValue(createCreateQueryResponseFromCacheStub()),
  handleSubqueryResultAsync: jest.fn().mockResolvedValue(undefined),
  fetchQueryResultsAsync: jest.fn().mockResolvedValue(createGetQueryResponseCompletedStub()),
  fetchQueryRequestResultsFromCache: jest.fn().mockResolvedValue(createCreateQueryResponseFromCacheStub()),
  fetchQueryRequestResultsFromDataSource: jest.fn().mockResolvedValue(createCreateQueryResponseFromCacheStub()),
  generateQueryEntityFromCreateDtoAsync: jest.fn().mockResolvedValue(getQueryEntity()),
});
