import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workflowService, type CreatePhase } from '../services/workflowService'
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
  // Subir los archivos puede tardar, así que la pantalla necesita saber en qué
  // paso está y no solo que "está cargando".
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
