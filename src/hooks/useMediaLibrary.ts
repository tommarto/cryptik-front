import { useQuery } from '@tanstack/react-query'
import { mediaService } from '../services/mediaService'
import type { MediaType } from '../types/workflow'

export const mediaLibraryKeys = {
  all: ['media_library'] as const,
  filtered: (workflowTypeCode: string, mediaTypes: MediaType[]) =>
    ['media_library', workflowTypeCode, [...mediaTypes].sort().join(',')] as const,
}

export function useMediaLibrary(
  workflowTypeCode: string,
  mediaTypes: MediaType[],
  enabled: boolean,
) {
  return useQuery({
    queryKey: mediaLibraryKeys.filtered(workflowTypeCode, mediaTypes),
    queryFn: () => mediaService.listLibrary(workflowTypeCode, mediaTypes),
    enabled,
  })
}
