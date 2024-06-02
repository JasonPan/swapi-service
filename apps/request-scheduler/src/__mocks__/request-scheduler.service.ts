export const RequestSchedulerService = jest.fn().mockReturnValue({
  scheduleRequestAsync: jest.fn().mockResolvedValue(undefined),
});
