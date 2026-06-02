import { useQuery } from '@tanstack/react-query';
import { getKnowledgeBase } from '../services/api';

export function useKnowledgeBase() {
  return useQuery({
    queryKey: ['knowledge-base'],
    queryFn: getKnowledgeBase,
  });
}