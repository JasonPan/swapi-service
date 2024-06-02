import { getSwapiResourceEntity } from '../../stubs';

export const mockSwapiResourceRepository = {
  save: jest.fn().mockResolvedValue(getSwapiResourceEntity()),
  findOne: jest.fn(({ where }) => {
    // Mock the successful and unsuccessful database call response
    const key = where.path;
    const expectedKey = getSwapiResourceEntity().path;
    if (key === expectedKey) return Promise.resolve(getSwapiResourceEntity());
    return Promise.resolve(null); // MongoDB will return null if resource/entity doesn't exist
  }),
};
