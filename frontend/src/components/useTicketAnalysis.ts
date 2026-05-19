import { useState } from "react";
import { Ticket, TicketFormData } from "../types";
import { analyzeTicket } from "../services/api";


export function useTicketAnalysis() {
  const [result, setResult] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(data: TicketFormData) {
    setLoading(true);
    setError(null);
    try {
      const ticket = await analyzeTicket(data);
      setResult(ticket);
    } catch (err: any) {
      setError(err.response?.data?.message?.join(', ') || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, analyze };
}