import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { AnalysisModule } from 'src/analysis/analysis.module';

@Module({
  imports: [AnalysisModule],
  controllers: [TicketsController],
  providers: [ TicketsService],
})
export class TicketsModule {}
