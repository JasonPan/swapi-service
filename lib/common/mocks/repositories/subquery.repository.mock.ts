import { getSubqueryEntities } from '../../stubs';

export const mockSubqueryRepository = {
  save: jest.fn().mockResolvedValue(getSubqueryEntities()[0]),
  findOne: jest.fn(({ where }) => {
    // Mock the successful and unsuccessful database call response
    const key = where.id;
    const expectedKey = getSubqueryEntities()[0].id;
    if (key === expectedKey) return Promise.resolve(getSubqueryEntities()[0]);
    return Promise.resolve(null); // MongoDB will return null if resource/entity doesn't exist
  }),
  findOneOrFail: jest.fn(({ where }) => {
    // Mock the successful and unsuccessful database call response
    const key = where.id;
    const expectedKey = getSubqueryEntities()[0].id;
    if (key === expectedKey) return Promise.resolve(getSubqueryEntities()[0]);
    return Promise.reject();
  }),
};
