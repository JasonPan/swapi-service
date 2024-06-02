const mockConfigValues: Record<string, string> = {
  SWAPI_BASE_URL: 'https://swapi.dev/api/',
};

export const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    const value = mockConfigValues[key];
    if (value) return value;
    else throw new Error();
  }),
};
