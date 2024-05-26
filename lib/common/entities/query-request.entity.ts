import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QueryEntity } from './query.entity';

@Entity({ name: 'query_request' })
export class QueryRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => QueryEntity, (q) => q.query_request)
  queries: QueryEntity[];

  @Column({ nullable: true })
  callbackUrl?: string;

  @Column()
  status: 'PENDING' | 'COMPLETED';
}
