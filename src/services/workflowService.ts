import { supabase } from '../clients/supabaseClient'
import { mediaService } from './mediaService'
import {
  ExecutionStatus,
  MediaType,
  WorkflowTypeCode,
  type WorkflowExecution,
} from '../types/workflow'
import type {
  CreateLipsyncPayload,
  CreateSeedancePayload,
} from '../types/workflow'
import { readFunctionError } from '../utils/functionError'

export const MAX_IMAGE_BYTES = 100 * 1024 * 1024
export const MAX_AUDIO_BYTES = 100 * 1024 * 1024

export type CreatePhase = 'uploading' | 'starting'

type ExecutionRow = {
  id: string
  status: ExecutionStatus
  context: Record<string, unknown> | null
  error_message: string | null
  requested_at: string
  started_at: string | null
  finished_at: string | null
  workflow?: {
    workflow_type?: { code?: string; result_media_type?: MediaType } | null
  } | null
}

const EXECUTION_COLUMNS =
  'id, status, context, error_message, requested_at, started_at, finished_at, ' +
  'workflow!inner(workflow_type!inner(code, result_media_type))'

function toExecution(row: ExecutionRow): WorkflowExecution {
  return {
    id: row.id,
    status: row.status,
    resultMediaType:
      row.workflow?.workflow_type?.result_media_type ?? MediaType.Video,
    workflowTypeCode: row.workflow?.workflow_type?.code,
    context: (row.context ?? {}) as WorkflowExecution['context'],
    errorMessage: row.error_message,
    requestedAt: row.requested_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  }
}

export const workflowService = {
  list: async (workflowTypeCode?: string): Promise<WorkflowExecution[]> => {
    let query = supabase
      .from('workflow_execution')
      .select(EXECUTION_COLUMNS)
      .order('requested_at', { ascending: false })
      .limit(50)

    if (workflowTypeCode) {
      query = query.eq('workflow.workflow_type.code', workflowTypeCode)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return (data as unknown as ExecutionRow[]).map(toExecution)
  },

  createLipsync: async (
    { image, audio, prompt, taskName }: CreateLipsyncPayload,
    onPhase?: (phase: CreatePhase) => void,
  ): Promise<WorkflowExecution> => {
    onPhase?.('uploading')
    const [imageMedia, audioMedia] = await Promise.all([
      mediaService.upload(image, WorkflowTypeCode.Lipsync),
      mediaService.upload(audio, WorkflowTypeCode.Lipsync),
    ])

    onPhase?.('starting')
    const { data, error } = await supabase.functions.invoke('create-lipsync-execution', {
      body: {
        imageMediaId: imageMedia.id,
        audioMediaId: audioMedia.id,
        prompt: prompt.trim() || undefined,
        name: taskName.trim() || audio.name,
      },
    })

    if (error) throw new Error(await readFunctionError(error))
    return toExecution(data.execution as ExecutionRow)
  },

  createSeedance: async (
    payload: CreateSeedancePayload,
  ): Promise<{ id: string }> => {
    const { data, error } = await supabase.functions.invoke(
      'create-seedance-execution',
      {
        body: {
          prompt: payload.prompt.trim(),
          name: payload.taskName.trim() || undefined,
          assetMediaIds: payload.assetMediaIds,
          duration: payload.duration,
          aspectRatio: payload.aspectRatio,
          resolution: payload.resolution,
        },
      },
    )

    if (error) throw new Error(await readFunctionError(error))
    return data.execution as { id: string }
  },

  getVideoUrl: async (executionId: string, download = false): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('get-video-url', {
      body: { executionId, download },
    })

    if (error) throw new Error(await readFunctionError(error))
    return data.url as string
  },

  onExecutionChange: (listener: () => void) => {
    const channel = supabase
      .channel('workflow_execution_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workflow_execution' },
        listener,
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  },
}
