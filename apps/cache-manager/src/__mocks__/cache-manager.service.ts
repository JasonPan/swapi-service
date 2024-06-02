import { createReadCacheResponseStub } from 'lib/common/stubs';

export const CacheManagerService = jest.fn().mockReturnValue({
  readCacheAsync: jest.fn().mockResolvedValue(createReadCacheResponseStub()),
  updateCache: jest.fn().mockResolvedValue(undefined),
});
