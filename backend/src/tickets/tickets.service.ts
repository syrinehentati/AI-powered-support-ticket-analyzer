import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalysisService } from '../analysis/analysis.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketEntity } from './ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(TicketEntity)
    private ticketRepository: Repository<TicketEntity>,
    private readonly analysisService: AnalysisService,
  ) {}

  findAll(): Promise<TicketEntity[]> {
    return this.ticketRepository.find({
      order: { analyzed_at: 'DESC' },
    });
  }

  findOne(id: string): Promise<TicketEntity | null> {
    return this.ticketRepository.findOne({
      where: { ticket_id: id },
    });
  }

  async createAndAnalyze(dto: CreateTicketDto): Promise<TicketEntity> {
    // check for duplicate
    const existing = await this.ticketRepository.findOne({
      where: { ticket_id: dto.ticket_id },
    });
    if (existing) return existing;

    const analysis = await this.analysisService.analyzeTicket(
      dto.title,
      dto.description,
      dto.logs,
      dto.temperature,
    );

    const ticket = this.ticketRepository.create({
      ...dto,
      analysis,
    });

    return this.ticketRepository.save(ticket);
  }

  async analyzeBulk(): Promise<TicketEntity[]> {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../../', 'mock_tickets.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const mockTickets: CreateTicketDto[] = JSON.parse(raw);

    const results: TicketEntity[] = [];

    for (const ticket of mockTickets) {
      // check for duplicate
      const existing = await this.ticketRepository.findOne({
        where: { ticket_id: ticket.ticket_id },
      });
      if (existing) {
        results.push(existing);
        continue;
      }

      const analysis = await this.analysisService.analyzeTicket(
        ticket.title,
        ticket.description,
        ticket.logs,
      );

      const entity = this.ticketRepository.create({
        ...ticket,
        analysis,
      });

      const saved = await this.ticketRepository.save(entity);
      results.push(saved);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return results;
  }
}
 