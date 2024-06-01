import { Column, Entity, ObjectIdColumn, Unique } from 'typeorm';

@Unique(['_id', 'path'])
// @Entity({ name: 'swapi_resource' })
@Entity({ name: 'resourceCollection' })
export class SwapiResourceEntity {
  @ObjectIdColumn()
  _id: string;

  @Column()
  path: string;

  @Column({ nullable: true, type: 'json' })
  cached_result?: any;
}
