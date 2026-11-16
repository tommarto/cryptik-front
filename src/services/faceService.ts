import { supabase } from '../clients/supabaseClient'
import { readFunctionError } from '../utils/functionError'
import { mediaService, normalizeContentType } from './mediaService'
import {
  FACE_ACCEPTED_TYPES,
  FACE_MAX_BYTES,
  FACE_MAX_RATIO,
  FACE_MAX_SIDE,
  FACE_MIN_RATIO,
  FACE_MIN_SIDE,
  type Face,
  type FaceLibrary,
  type FaceRetention,
  type FaceSyncStatus,
} from '../types/face'

type FaceRow = {
  id: string
  name: string
  created_by: string
  created_at: string
  sync_status: FaceSyncStatus
  sync_error: string | null
  synced_at: string | null
  last_used_at: string | null
  retention: FaceRetention
  retention_days: number | null
  expires_at: string | null
  in_use: boolean
  queue_position: number | null
  eta_minutes: number | null
  width: number | null
  height: number | null
  thumbnail_url: string | null
}

function toFace(row: FaceRow): Face {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    createdAt: row.created_at,
    syncStatus: row.sync_status,
    syncError: row.sync_error,
    syncedAt: row.synced_at,
    lastUsedAt: row.last_used_at,
    retention: row.retention,
    retentionDays: row.retention_days,
    expiresAt: row.expires_at,
    inUse: row.in_use,
    queuePosition: row.queue_position,
    etaMinutes: row.eta_minutes,
    width: row.width,
    height: row.height,
    thumbnailUrl: row.thumbnail_url,
  }
}

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) throw new Error(await readFunctionError(error))
  return data as T
}

async function imageSize(file: File) {
  const bitmap = await createImageBitmap(file)
  const size = { width: bitmap.width, height: bitmap.height }
  bitmap.close()
  return size
}

export async function faceFileRejection(file: File): Promise<string | null> {
  if (!FACE_ACCEPTED_TYPES.includes(normalizeContentType(file.type))) {
    return `"${file.name}": la cara tiene que ser JPG, PNG o WEBP.`
  }
  if (file.size > FACE_MAX_BYTES) return `"${file.name}" supera el máximo de 30 MB.`

  let size: { width: number; height: number }
  try {
    size = await imageSize(file)
  } catch {
    return `No se pudo leer "${file.name}" como imagen.`
  }

  if (Math.min(size.width, size.height) < FACE_MIN_SIDE || Math.max(size.width, size.height) > FACE_MAX_SIDE) {
    return `"${file.name}" tiene que medir entre ${FACE_MIN_SIDE} y ${FACE_MAX_SIDE} px por lado.`
  }
  const ratio = size.width / size.height
  if (ratio <= FACE_MIN_RATIO || ratio >= FACE_MAX_RATIO) {
    return `"${file.name}" tiene una proporción fuera de rango (entre 0,4 y 2,5).`
  }
  return null
}

export function faceNameFromFile(file: File) {
  return file.name.replace(/\.[^.]+$/, '').slice(0, 60) || 'Cara'
}

export const faceService = {
  list: async (): Promise<FaceLibrary> => {
    const data = await invoke<{ faces: FaceRow[]; quota: FaceLibrary['quota'] }>('get-faces', {})
    return { faces: data.faces.map(toFace), quota: data.quota }
  },

  create: async ({
    file,
    name,
    retentionDays,
    sync,
  }: {
    file: File
    name: string
    retentionDays: number | null
    sync: boolean
  }): Promise<{ id: string; warning?: string }> => {
    const rejection = await faceFileRejection(file)
    if (rejection) throw new Error(rejection)

    const media = await mediaService.upload(file)
    const data = await invoke<{ face: { id: string }; warning?: string }>('create-face', {
      mediaId: media.id,
      name,
      retentionDays,
      sync,
    })
    return { id: data.face.id, warning: data.warning }
  },

  update: (faceId: string, changes: { name?: string; retentionDays?: number | null }) =>
    invoke('update-face', { faceId, ...changes }),

  sync: (faceId: string) => invoke('sync-face', { faceId }),

  desync: (faceId: string) => invoke('desync-face', { faceId }),

  remove: (faceId: string) => invoke('delete-face', { faceId }),
}
