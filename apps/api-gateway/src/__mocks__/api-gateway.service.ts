import { createCreateQueryResponseStub, createGetQueryResponseStub } from 'lib/common/stubs';

export const ApiGatewayService = jest.fn().mockReturnValue({
  createQueryRequestAsync: jest.fn().mockResolvedValue(createCreateQueryResponseStub()),
  getQueryRequest: jest.fn().mockResolvedValue(createGetQueryResponseStub()),
});
