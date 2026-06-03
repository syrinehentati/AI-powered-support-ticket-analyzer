import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { AnalysisModule } from '../analysis/analysis.module';
import { TicketEntity } from './entites/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity]), AnalysisModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
