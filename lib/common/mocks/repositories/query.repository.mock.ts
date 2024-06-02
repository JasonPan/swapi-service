import { getQueryEntity } from '../../stubs';

export const mockQueryRepository = {
  save: jest.fn().mockResolvedValue(getQueryEntity()),
  findOne: jest.fn(({ where }) => {
    // Mock the successful and unsuccessful database call response
    const key = where.id;
    const expectedKey = getQueryEntity().id;
    if (key === expectedKey) return Promise.resolve(getQueryEntity());
    return Promise.resolve(null); // MongoDB will return null if resource/entity doesn't exist
  }),
  findOneOrFail: jest.fn(({ where }) => {
    // Mock the successful and unsuccessful database call response
    const key = where.id;
    const expectedKey = getQueryEntity().id;
    if (key === expectedKey) return Promise.resolve(getQueryEntity());
    return Promise.reject();
  }),
};
