import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { KnowledgeBaseEntry, SimilarTicket } from './knowledge-base.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KnowledgeBaseService {
  private entries: KnowledgeBaseEntry[] = [];

  constructor(private readonly embeddingService: EmbeddingService) {}

  async addEntry(
    ticket_id: string,
    title: string,
    description: string,
    logs: string[],
    resolution: string[],
    category: string,
    severity: string,
    detected_language: string,
  ): Promise<KnowledgeBaseEntry> {
    // generate embedding from ticket text
    const text = this.embeddingService.prepareTicketText(
      title,
      description,
      logs
    );
    const embedding = await this.embeddingService.generateEmbedding(text);

    const entry: KnowledgeBaseEntry = {
      id: uuidv4(),
      ticket_id,
      title,
      description,
      logs,
      resolution,
      category,
      severity,
      detected_language,
      embedding,
      created_at: new Date(),
    };

    this.entries.push(entry);
    return entry;
  }

  async findSimilar(
    title: string,
    description: string,
    logs: string[],
    topK: number = 3,
    threshold: number = 0.6,
  ): Promise<SimilarTicket[]> {
    if (this.entries.length === 0) return [];

    // generate embedding for the new ticket
    const text = this.embeddingService.prepareTicketText(
      title,
      description,
      logs
    );
    const queryEmbedding =
      await this.embeddingService.generateEmbedding(text);

    // calculate similarity against all stored entries
    const similarities = this.entries.map((entry) => ({
      entry,
      similarity: this.embeddingService.cosineSimilarity(
        queryEmbedding,
        entry.embedding
      ),
    }));

    // sort by similarity, filter by threshold, take topK
    return similarities
      .filter((s) => s.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  getAll(): KnowledgeBaseEntry[] {
    return this.entries;
  }

  getCount(): number {
    return this.entries.length;
  }
}