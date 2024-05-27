import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QueryRequestEntity } from './query-request.entity';

@Entity({ name: 'query' })
export class QueryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  path: string;

  @ManyToOne(() => QueryRequestEntity, (qr) => qr.queries)
  @JoinColumn({
    name: 'query_request_id', // FK
    // referencedColumnName: 'id',
    // foreignKeyConstraintName: 'custom',
  })
  query_request: QueryRequestEntity;

  @Column({ nullable: true, type: 'json' })
  result?: any;
}
