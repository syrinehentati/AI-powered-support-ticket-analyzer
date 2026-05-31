import { Controller, Post, Body } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalyzeTicketDto } from './dto/analyze-ticket.dto';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('analyze')
  async analyze(@Body() body: AnalyzeTicketDto) {
    return this.analysisService.analyzeTicket(
      body.title,
      body.description,
      body.logs,
      body.temperature,
    );
  }
}