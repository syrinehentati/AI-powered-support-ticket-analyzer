import { useQuery } from '@tanstack/react-query';
import { getAllTickets } from '../services/api';

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: getAllTickets,
  });
}