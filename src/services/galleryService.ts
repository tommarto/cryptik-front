import { supabase } from '../clients/supabaseClient'
import {
  ExecutionStatus,
  MediaType,
  type WorkflowExecution,
} from '../types/workflow'
import { readFunctionError } from '../utils/functionError'

export type GalleryUser = {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}

export type Thumbnail = {
  url: string
  width: number | null
  height: number | null
}

export type WorkflowTypeOption = {
  code: string
  name: string
}

export type GalleryPage = {
  executions: WorkflowExecution[]
  thumbnails: Record<string, Thumbnail>
  users: GalleryUser[]
  workflowTypes: WorkflowTypeOption[]
}

export type GalleryFilters = {
  statuses?: ExecutionStatus[]
  mediaTypes?: MediaType[]
  workflowTypeCodes?: string[]
  userIds?: string[]
}

type Row = {
  id: string
  user_id: string
  status: ExecutionStatus
  context: Record<string, unknown> | null
  error_message: string | null
  requested_at: string
  started_at: string | null
  finished_at: string | null
  workflow?: {
    workflow_type?: {
      code?: string
      name?: string
      result_media_type?: MediaType
    } | null
  } | null
}

/**
 * La galería no lee las tablas directo como el resto de la app: pasa por una
 * función que ve el trabajo de todo el equipo. Es la única excepción a que cada
 * uno vea lo suyo, y está acotada a ese endpoint.
 */
export const galleryService = {
  page: async (
    filters: GalleryFilters,
    limit: number,
    offset: number,
  ): Promise<GalleryPage> => {
    const { data, error } = await supabase.functions.invoke('get-gallery', {
      body: { ...filters, limit, offset },
    })

    if (error) throw new Error(await readFunctionError(error))

    return {
      executions: (data.executions as Row[]).map((row) => ({
        id: row.id,
        userId: row.user_id,
        status: row.status,
        resultMediaType:
          row.workflow?.workflow_type?.result_media_type ?? MediaType.Video,
        workflowTypeCode: row.workflow?.workflow_type?.code,
        context: (row.context ?? {}) as WorkflowExecution['context'],
        errorMessage: row.error_message,
        requestedAt: row.requested_at,
        startedAt: row.started_at,
        finishedAt: row.finished_at,
      })),
      thumbnails: data.thumbnails as Record<string, Thumbnail>,
      users: data.users as GalleryUser[],
      workflowTypes: data.workflowTypes as WorkflowTypeOption[],
    }
  },
}
