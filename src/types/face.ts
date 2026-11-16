export enum FaceSyncStatus {
  Unsynced = 'unsynced',
  Queued = 'queued',
  Syncing = 'syncing',
  Synced = 'synced',
  Failed = 'failed',
  Unsyncing = 'unsyncing',
}

export enum FaceRetention {
  Perpetual = 'perpetual',
  Days = 'days',
}

export type Face = {
  id: string
  name: string
  createdBy: string
  createdAt: string
  syncStatus: FaceSyncStatus
  syncError: string | null
  syncedAt: string | null
  lastUsedAt: string | null
  retention: FaceRetention
  retentionDays: number | null
  expiresAt: string | null
  inUse: boolean
  queuePosition: number | null
  etaMinutes: number | null
  width: number | null
  height: number | null
  thumbnailUrl: string | null
}

export type FaceQuota = {
  used: number
  limit: number
}

export type FaceLibrary = {
  faces: Face[]
  quota: FaceQuota
}

export const PENDING_FACE_STATUSES = [
  FaceSyncStatus.Queued,
  FaceSyncStatus.Syncing,
  FaceSyncStatus.Unsyncing,
]

export const FACE_MIN_SIDE = 300
export const FACE_MAX_SIDE = 6000
export const FACE_MIN_RATIO = 0.4
export const FACE_MAX_RATIO = 2.5
export const FACE_MAX_BYTES = 30 * 1024 * 1024
export const FACE_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function isFacePending(face: Face) {
  return PENDING_FACE_STATUSES.includes(face.syncStatus)
}

export const FACE_STATUS_LABEL: Record<FaceSyncStatus, string> = {
  [FaceSyncStatus.Unsynced]: 'No disponible',
  [FaceSyncStatus.Queued]: 'En cola',
  [FaceSyncStatus.Syncing]: 'Subiendo a BytePlus',
  [FaceSyncStatus.Synced]: 'Disponible',
  [FaceSyncStatus.Failed]: 'Falló',
  [FaceSyncStatus.Unsyncing]: 'Desincronizando',
}
