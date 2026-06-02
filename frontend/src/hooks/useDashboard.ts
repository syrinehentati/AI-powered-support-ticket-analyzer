import { useQuery } from '@tanstack/react-query';
import { getAllTickets, getKnowledgeBase } from '../services/api';

export function useDashboardStats() {
  const tickets = useQuery({
    queryKey: ['tickets'],
    queryFn: getAllTickets,
  });

  const kb = useQuery({
    queryKey: ['knowledge-base'],
    queryFn: getKnowledgeBase,
  });

  return {
    tickets: tickets.data ?? [],
    kbCount: kb.data?.length ?? 0,
    isLoading: tickets.isLoading || kb.isLoading,
    error: tickets.error || kb.error,
  };
}