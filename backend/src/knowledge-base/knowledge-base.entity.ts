import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('knowledge_base')
export class KnowledgeBaseEntity {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column()
    ticket_id!: string;

  @Column()
    title!: string;

  @Column({ type: 'text' })
    description!: string;

  @Column({ type: 'simple-array' })
    logs!: string[];

  @Column({ type: 'simple-array' })
    resolution!: string[];

  @Column()
    category!: string;

  @Column()
    severity!: string;

  @Column()
    detected_language!: string;

  @Column({ type: 'float', array: true })
    embedding!: number[];

  @CreateDateColumn()
    created_at!: Date;
}