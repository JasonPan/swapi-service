export const mockClientProxy = {
  send: jest.fn().mockImplementation(() => ({
    pipe: jest.fn().mockReturnThis(),
    toPromise: jest.fn(),
  })),
  emit: jest.fn().mockImplementation(() => ({
    pipe: jest.fn().mockReturnThis(),
    toPromise: jest.fn(),
  })),
};
