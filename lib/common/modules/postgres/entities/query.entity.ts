import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SubqueryEntity } from '.';

@Entity({ name: 'query' })
export class QueryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => SubqueryEntity, (q) => q.query, { eager: true })
  subqueries: SubqueryEntity[];

  @Column({ nullable: true })
  callback_url?: string;

  @Column()
  status: 'PENDING' | 'COMPLETED';
}
