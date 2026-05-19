export interface TicketFormData {
  ticket_id: string;
  title: string;
  description: string;
  severity: string;
  logs: string[];
}

export interface TicketAnalysis {
  summary: string;
  detected_language: string;
  root_cause: string;
  resolution: string[];
  category: string;
  severity: string;
}

export interface Ticket extends TicketFormData {
  analysis?: TicketAnalysis;
  analyzed_at?: string;
}