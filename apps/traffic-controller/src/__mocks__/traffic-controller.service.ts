export const TrafficControllerService = jest.fn().mockReturnValue({
  getIsRateLimitedAsync: jest.fn().mockResolvedValue(true),
  getSystemDownstreamUsageKey: jest.fn().mockReturnValue({
    prefix: 'system',
    key: 'usage_log',
  }),
  logUsage: jest.fn().mockResolvedValue(undefined),
  getUsageCount: jest.fn().mockResolvedValue(100),
});
