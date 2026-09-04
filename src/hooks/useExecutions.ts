import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workflowService } from '../services/workflowService'
import type { CreateLipsyncPayload } from '../types/workflow'

export const executionKeys = {
  all: ['workflow_execution'] as const,
}

export function useExecutions() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: executionKeys.all,
    queryFn: workflowService.list,
  })

  // El webhook actualiza la fila del lado del servidor; Realtime nos avisa y
  // recién ahí refrescamos. Sin esto habría que pollear.
  useEffect(() => {
    return workflowService.onExecutionChange(() => {
      void queryClient.invalidateQueries({ queryKey: executionKeys.all })
    })
  }, [queryClient])

  return query
}

export function useCreateLipsync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateLipsyncPayload) =>
      workflowService.createLipsync(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: executionKeys.all })
    },
  })
}
