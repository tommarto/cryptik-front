import { useQuery } from '@tanstack/react-query'
import { workflowService } from '../services/workflowService'

/**
 * La URL viene firmada a un día, así que alcanza con cachearla: no hace falta
 * renovarla en background mientras la pestaña está abierta.
 */
export function useVideoUrl(executionId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['video-url', executionId],
    queryFn: () => workflowService.getVideoUrl(executionId!),
    enabled: Boolean(executionId) && enabled,
    staleTime: 12 * 60 * 60_000,
  })
}
