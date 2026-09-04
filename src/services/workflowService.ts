import { supabase } from '../clients/supabaseClient'
import { ExecutionStatus, type WorkflowExecution } from '../types/workflow'
import type { CreateLipsyncPayload } from '../types/workflow'
import { toBase64 } from '../utils/file'

/**
 * RunPod corta los payloads de `/run` en 10 MB, y base64 infla un 33%. Con los
 * dos archivos juntos por debajo de 7 MB nunca lo tocamos.
 */
/**
 * El techo real es de RunPod: `/run` corta en 10 MiB de payload y base64 infla
 * un 33%, así que entre los dos archivos no se puede pasar de 7.5 MiB reales.
 * Los límites individuales son ese mismo techo: lo que manda es la suma.
 */
export const MAX_COMBINED_BYTES = Math.floor((10 * 1024 * 1024 * 3) / 4)
export const MAX_IMAGE_BYTES = MAX_COMBINED_BYTES
export const MAX_AUDIO_BYTES = MAX_COMBINED_BYTES

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

    if (error) throw new Error(error.message)
    return (data as ExecutionRow[]).map(toExecution)
  },

  createLipsync: async ({
    image,
    audio,
    prompt,
  }: CreateLipsyncPayload): Promise<WorkflowExecution> => {
    const [imageBase64, audioBase64] = await Promise.all([
      toBase64(image),
      toBase64(audio),
    ])

    const { data, error } = await supabase.functions.invoke('create-lipsync-execution', {
      body: {
        image_base64: imageBase64,
        image_content_type: image.type,
        audio_base64: audioBase64,
        audio_content_type: audio.type,
        prompt: prompt.trim() || undefined,
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

/**
 * `functions.invoke` no expone el cuerpo del error, solo el status. El mensaje
 * útil viene en el body, así que hay que leerlo de la respuesta.
 */
async function readFunctionError(error: unknown): Promise<string> {
  const context = (error as { context?: Response }).context

  if (context && typeof context.json === 'function') {
    try {
      const body = await context.json()
      if (typeof body?.error === 'string') return body.error
    } catch {
      // sin cuerpo JSON: caemos al mensaje genérico
    }
  }

  return error instanceof Error ? error.message : 'Unexpected error'
}
