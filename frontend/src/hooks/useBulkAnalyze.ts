import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkAnalyze } from '../services/api';

export function useBulkAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkAnalyze,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}