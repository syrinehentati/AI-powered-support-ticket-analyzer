import { Injectable } from '@nestjs/common';
import {AnalysisService } from'../analysis/analysis.service';
import { Ticket } from './ticket.interface';
import { CreateTicketDto } from './dto/create-ticket.dto';
@Injectable()
export class TicketsService {
    private tickets: Ticket[] = [];
    constructor( private readonly analysisService: AnalysisService) {}

    findAll() {
        return this.tickets;
    }

    findOne( id: string) {
        return this.tickets.find(t=> t.ticket_id === id);
    }

    async createAndAnlayze(dto: CreateTicketDto): Promise<Ticket> {
        const analysis = await this.analysisService.analyzeTicket(
            dto.title,
            dto.description,
            dto.logs
        );

        const ticket: Ticket = {
            ...dto,
            analysis,
            analyzed_at: new Date()
        };

        this.tickets.push(ticket);
        return ticket;
    }

    async analyzeBulk(): Promise<Ticket[]> {
        // read mock tickets file
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../../../', 'mock_tickets.json');
        const raw = fs.readFileSync(filePath, 'utf8');
        const mockTickets = JSON.parse(raw);

        const results: Ticket[] = [];
        
        for (const ticket of mockTickets) {
            const analysis = await this.analysisService.analyzeTicket(
                ticket.title,
                ticket.description,
                ticket.logs
            );

            const analyzed: Ticket = {
                ...ticket,
                analysis,
                analyerd_at: new Date()
            };
            this.tickets.push(analyzed);
            results.push(analyzed);

            //small delay to avoid hitting rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        }
        return results;
    }

}
