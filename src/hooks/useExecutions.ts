import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workflowService, type CreatePhase } from '../services/workflowService'
import type {
  CreateLipsyncPayload,
  CreateSeedancePayload,
} from '../types/workflow'

export const executionKeys = {
  all: ['workflow_execution'] as const,
  byType: (workflowTypeCode?: string) =>
    ['workflow_execution', workflowTypeCode ?? 'all'] as const,
}

export function useExecutions(workflowTypeCode?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: executionKeys.byType(workflowTypeCode),
    queryFn: () => workflowService.list(workflowTypeCode),
  })

  useEffect(() => {
    return workflowService.onExecutionChange(() => {
      void queryClient.invalidateQueries({ queryKey: executionKeys.all })
    })
  }, [queryClient])

  return query
}

export function useCreateLipsync() {
  const queryClient = useQueryClient()
  const [phase, setPhase] = useState<CreatePhase | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: CreateLipsyncPayload) =>
      workflowService.createLipsync(payload, setPhase),
    onSettled: () => {
      setPhase(null)
      void queryClient.invalidateQueries({ queryKey: executionKeys.all })
    },
  })

  return { ...mutation, phase }
}

export function useCreateSeedance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSeedancePayload) =>
      workflowService.createSeedance(payload),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: executionKeys.all })
    },
  })
}
