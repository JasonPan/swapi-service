import { Column, Entity, ObjectIdColumn, Unique } from 'typeorm';

// @Entity({ name: 'swapi_resource' })
@Entity({ name: 'resourceCollection' })
export class SwapiResourceEntity {
  @Unique(['path'])
  @ObjectIdColumn()
  path: string;

  @Column({ nullable: true, type: 'json' })
  cached_result?: any;
}
