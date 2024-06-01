import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SwapiResourceEntity } from 'lib/common/modules/mongo/entities/swapi-resource.entity';
import { QueryResultDto } from 'lib/common/dto/query-result.dto';

@Injectable()
export class CacheManagerService {
  constructor(
    @InjectRepository(SwapiResourceEntity)
    private readonly swapiResourceRepository: Repository<SwapiResourceEntity>,
  ) {}

  async readCacheAsync(dto: QueryResultDto): Promise<QueryResultDto> {
    const resource: SwapiResourceEntity | null = await this.swapiResourceRepository.findOne({
      where: { path: dto.path },
    });

    console.log('found resource', dto.id, resource);

    dto.result = resource?.cached_result || null;
    return dto;
  }

  async updateCache(dto: QueryResultDto): Promise<void> {
    if (dto.result) {
      const existingResource: SwapiResourceEntity | null = await this.swapiResourceRepository.findOne({
        where: { path: dto.path },
      });

      const resource = existingResource || new SwapiResourceEntity();
      resource.path = dto.path;
      resource.cached_result = dto.result;
      console.log('saving data to mongo...');
      await this.swapiResourceRepository.save(resource);
      // await this.swapiResourceRepository.update('_id', resource);
      // await this.swapiResourceRepository.upsert(resource, {
      //   conflictPaths: ['path'],
      //   upsertType: 'on-conflict-do-update',
      // });
      console.log('saved data to mongo');
    }
  }
}
