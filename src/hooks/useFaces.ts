import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { faceService } from '../services/faceService'
import { isFacePending } from '../types/face'

const PENDING_REFRESH_MS = 5000

export const faceKeys = {
  all: ['faces'] as const,
}

export function useFaces(enabled = true) {
  return useQuery({
    queryKey: faceKeys.all,
    queryFn: faceService.list,
    enabled,
    refetchInterval: (query) =>
      query.state.data?.faces.some((face) => isFacePending(face) || face.inUse)
        ? PENDING_REFRESH_MS
        : false,
  })
}

function useFaceMutation<T, R>(mutationFn: (input: T) => Promise<R>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSettled: () => queryClient.invalidateQueries({ queryKey: faceKeys.all }),
  })
}

export function useCreateFace() {
  return useFaceMutation(faceService.create)
}

export function useUpdateFace() {
  return useFaceMutation(
    ({ faceId, ...changes }: { faceId: string; name?: string; retentionDays?: number | null }) =>
      faceService.update(faceId, changes),
  )
}

export function useSyncFace() {
  return useFaceMutation(faceService.sync)
}

export function useDeleteFace() {
  return useFaceMutation(faceService.remove)
}

export function useDesyncFace() {
  return useFaceMutation(faceService.desync)
}
