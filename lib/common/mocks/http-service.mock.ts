export const mockHttpService = {
  axiosRef: {
    get: jest.fn(() => Promise.resolve()),
    post: jest.fn(() => Promise.resolve()),
  },
};
