export interface Ticket {
  ticket_id: string;
  title: string;
  description: string;
  severity: string;
  language: string;
  logs: string[];
  analysis?: {
    summary: string;
    detected_language: string;
    root_cause: string;
    resolution: string[];
    category: string;
    severity: string;
  };
  analyzed_at?: Date;
}