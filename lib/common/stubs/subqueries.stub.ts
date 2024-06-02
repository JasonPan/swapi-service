import { SubqueryDto } from '../dto';
import { getSubqueryEntities } from '.';

export const initialSubqueriesStub = () => {
  const subqueriesStub: SubqueryDto[] = completedSubqueriesStub().map((e) => {
    delete e.result;
    return e;
  });
  return subqueriesStub;
};

export const completedSubqueriesStub = () => {
  const subqueriesStub: SubqueryDto[] = getSubqueryEntities().map((e) => {
    // const dto = new SubqueryDto();
    // dto.id = e.id;
    // dto.path = e.path;
    // dto.query_id = e.query.id;
    // dto.result = e.result;
    // return dto;
    const dto: SubqueryDto = {
      id: e.id,
      path: e.path,
      query_id: e.query.id,
      result: e.result,
    };
    return dto;
  });

  return subqueriesStub;
};
