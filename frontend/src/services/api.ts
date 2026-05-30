import axios, { AxiosError } from 'axios';
import {
  AddToKnowledgeBasePayload,
  KnowledgeBaseEntry,
  Ticket,
  TicketFormData,
} from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

function handleApiError(err: unknown): never {
  if (err instanceof AxiosError) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) throw new Error(message.join(', '));
    if (typeof message === 'string') throw new Error(message);
    throw new Error(err.message);
  }
  throw new Error('An unexpected error occurred');
}

export const analyzeTicket = async (data: TicketFormData): Promise<Ticket> => {
  try {
    const response = await api.post<Ticket>('/tickets', data);
    return response.data;
  } catch (err) {
    throw handleApiError(err);
  }
};

export const getAllTickets = async (): Promise<Ticket[]> => {
  try {
    const response = await api.get<Ticket[]>('/tickets');
    return response.data;
  } catch (err) {
    throw handleApiError(err);
  }
};

export const bulkAnalyze = async (): Promise<Ticket[]> => {
  try {
    const response = await api.post<Ticket[]>('/tickets/bulk-analyze');
    return response.data;
  } catch (err) {
    throw handleApiError(err);
  }
};

// ─── knowledge base ─────────────────────────────────────────────

export const getKnowledgeBase = async (): Promise<KnowledgeBaseEntry[]> => {
  try {
    const response = await api.get<KnowledgeBaseEntry[]>('/knowledge-base');
    return response.data;
  } catch (err) {
    throw handleApiError(err);
  }
};

export const addToKnowledgeBase = async (
  data: AddToKnowledgeBasePayload
): Promise<KnowledgeBaseEntry> => {
  try {
    const response = await api.post<KnowledgeBaseEntry>(
      '/knowledge-base',
      data
    );
    return response.data;
  } catch (err) {
    throw handleApiError(err);
  }
};
