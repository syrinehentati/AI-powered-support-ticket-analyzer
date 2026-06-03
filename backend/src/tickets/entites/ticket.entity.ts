import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('tickets')
export class TicketEntity {
  @PrimaryColumn()
    ticket_id!: string;

  @Column()
    title!: string;

  @Column({ type: 'text' })
    description!: string;

  @Column()
    severity!: string;

  @Column({ type: 'simple-array' })
    logs!: string[];

  @Column({ type: 'jsonb', nullable: true })
    analysis!: object;

  @Column({ type: 'float', nullable: true })
    temperature!: number;

  @CreateDateColumn()
    analyzed_at!: Date;
}