import { supabase } from '../clients/supabaseClient'
import { mediaService } from './mediaService'
import { ExecutionStatus, type WorkflowExecution } from '../types/workflow'
import type { CreateLipsyncPayload } from '../types/workflow'
import { readFunctionError } from '../utils/functionError'

/**
 * Ya no hay techo de 10 MB: los archivos van del browser a S3 y RunPod los baja
 * de ahí, así que no viajan en el payload ni pasan por base64. Estos límites son
 * de sensatez, no una restricción del proveedor.
 */
export const MAX_IMAGE_BYTES = 100 * 1024 * 1024
export const MAX_AUDIO_BYTES = 100 * 1024 * 1024

/** Fases del alta, para que la pantalla pueda decir en cuál está. */
export type CreatePhase = 'uploading' | 'starting'

type ExecutionRow = {
  id: string
  status: ExecutionStatus
  context: Record<string, unknown> | null
  error_message: string | null
  requested_at: string
  started_at: string | null
  finished_at: string | null
}

function toExecution(row: ExecutionRow): WorkflowExecution {
  return {
    id: row.id,
    status: row.status,
    context: (row.context ?? {}) as WorkflowExecution['context'],
    errorMessage: row.error_message,
    requestedAt: row.requested_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  }
}

export const workflowService = {
  /** La RLS acota el resultado a las ejecuciones del usuario logueado. */
  list: async (): Promise<WorkflowExecution[]> => {
    const { data, error } = await supabase
      .from('workflow_execution')
      .select('id, status, context, error_message, requested_at, started_at, finished_at')
      .order('requested_at', { ascending: false })
      .limit(50)

    if (error) throw new Error(error.message)
    return (data as ExecutionRow[]).map(toExecution)
  },

  /**
   * Primero los archivos, después la ejecución: el worker los baja de S3 apenas
   * arranca, así que no puede dispararse antes de que estén verificados.
   */
  createLipsync: async (
    { image, audio, prompt, taskName }: CreateLipsyncPayload,
    onPhase?: (phase: CreatePhase) => void,
  ): Promise<WorkflowExecution> => {
    onPhase?.('uploading')
    const [imageMedia, audioMedia] = await Promise.all([
      mediaService.upload(image),
      mediaService.upload(audio),
    ])

    onPhase?.('starting')
    const { data, error } = await supabase.functions.invoke('create-lipsync-execution', {
      body: {
        imageMediaId: imageMedia.id,
        audioMediaId: audioMedia.id,
        prompt: prompt.trim() || undefined,
        // El nombre del audio como default: es lo que el usuario reconoce si no
        // se molestó en ponerle un nombre a la corrida.
        name: taskName.trim() || audio.name,
      },
    })

    if (error) throw new Error(await readFunctionError(error))
    return toExecution(data.execution as ExecutionRow)
  },

  /** URL firmada a pocos minutos. La base guarda el path, nunca la URL. */
  getVideoUrl: async (executionId: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('get-video-url', {
      body: { executionId },
    })

    if (error) throw new Error(await readFunctionError(error))
    return data.url as string
  },

  /** Empuja los cambios por websocket en vez de que el front pollee. */
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
