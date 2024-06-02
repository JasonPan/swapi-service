import { getSwapiResourceEntities } from '../../stubs';

export const mockSwapiResourceRepository = {
  save: jest.fn().mockResolvedValue(getSwapiResourceEntities()[0]),
  findOne: jest.fn(({ where }) => {
    // Mock the successful and unsuccessful database call response
    const key = where.path;
    const expectedKey = getSwapiResourceEntities()[0].path;
    if (key === expectedKey) return Promise.resolve(getSwapiResourceEntities()[0]);
    return Promise.resolve(null); // MongoDB will return null if resource/entity doesn't exist
  }),
};
