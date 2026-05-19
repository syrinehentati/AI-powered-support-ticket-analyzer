import axios from 'axios';
import { Ticket, TicketFormData } from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const analyzeTicket = async (data: TicketFormData): Promise<Ticket> => {
  const response = await api.post('/tickets', data);
  return response.data;
};


export const getAllTickets = async (): Promise<Ticket[]> => {
    const response = await api.get('/tickets');
    return response.data;
}

export const bulkAnalyze = async (): Promise<Ticket[]> => {
  const response = await api.post('/tickets/bulk-analyze');
  return response.data;
};