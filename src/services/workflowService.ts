import { supabase } from '../clients/supabaseClient'
import { mediaService } from './mediaService'
import { ExecutionStatus, MediaType, type WorkflowExecution } from '../types/workflow'
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
  workflow?: { workflow_type?: { result_media_type?: MediaType } | null } | null
}

const EXECUTION_COLUMNS =
  'id, status, context, error_message, requested_at, started_at, finished_at, ' +
  'workflow(workflow_type(result_media_type))'

function toExecution(row: ExecutionRow): WorkflowExecution {
  return {
    id: row.id,
    status: row.status,
    resultMediaType:
      row.workflow?.workflow_type?.result_media_type ?? MediaType.Video,
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
      .select(EXECUTION_COLUMNS)
      .order('requested_at', { ascending: false })
      .limit(50)

    if (error) throw new Error(error.message)
    // El cliente no puede inferir la forma de las relaciones embebidas sin los
    // tipos generados del esquema.
    return (data as unknown as ExecutionRow[]).map(toExecution)
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

  /**
   * URL firmada del video. La base guarda el path, nunca la URL.
   *
   * Con `download`, la URL viene firmada con `Content-Disposition: attachment`
   * y vence en minutos: es un link de un solo uso, distinto del de reproducción.
   */
  getVideoUrl: async (executionId: string, download = false): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('get-video-url', {
      body: { executionId, download },
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
