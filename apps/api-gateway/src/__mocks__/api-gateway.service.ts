import { createCreateQueryResponseFromCacheStub, createGetQueryResponseCompletedStub } from 'lib/common/stubs';

export const ApiGatewayService = jest.fn().mockReturnValue({
  createQueryRequestAsync: jest.fn().mockResolvedValue(createCreateQueryResponseFromCacheStub()),
  getQueryRequest: jest.fn().mockResolvedValue(createGetQueryResponseCompletedStub()),
});
