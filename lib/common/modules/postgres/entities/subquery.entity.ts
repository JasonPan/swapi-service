import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QueryEntity } from '.';

@Entity({ name: 'subquery' })
export class SubqueryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  path: string;

  @ManyToOne(() => QueryEntity, (qr) => qr.subqueries)
  @JoinColumn({
    name: 'query_id', // FK
    // referencedColumnName: 'id',
    // foreignKeyConstraintName: 'custom',
  })
  query: QueryEntity;

  @Column({ nullable: true, type: 'json' })
  result?: any;
}
