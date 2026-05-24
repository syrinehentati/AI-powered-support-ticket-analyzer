export interface KnowledgeBaseEntry {
  id: string;
  ticket_id: string;
  title: string;
  description: string;
  logs: string[];
  resolution: string[];
  category: string;
  severity: string;
  detected_language: string;
  embedding: number[];
  created_at: Date;
}

export interface SimilarTicket {
  entry: KnowledgeBaseEntry;
  similarity: number;
}