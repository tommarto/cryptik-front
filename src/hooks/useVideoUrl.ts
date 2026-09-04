import { useQuery } from '@tanstack/react-query'
import { workflowService } from '../services/workflowService'

/**
 * La URL viene firmada a 5 minutos, así que se re-pide sola antes de vencer en
 * vez de quedar cacheada hasta romperse.
 */
export function useVideoUrl(executionId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['video-url', executionId],
    queryFn: () => workflowService.getVideoUrl(executionId!),
    enabled: Boolean(executionId) && enabled,
    staleTime: 4 * 60_000,
    refetchInterval: 4 * 60_000,
  })
}
