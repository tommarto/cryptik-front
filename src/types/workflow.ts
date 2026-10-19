export enum MediaType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
}

export enum ExecutionStatus {
  Queued = 'QUEUED',
  Processing = 'PROCESSING',
  Completed = 'COMPLETED',
  Error = 'ERROR',
}

export type LipsyncContext = {
  name?: string | null
  prompt?: string | null
  s3_path?: string | null
  delayTime?: number | null
  executionTime?: number | null
  image_media_id?: string | null
  audio_media_id?: string | null
}

export enum WorkflowTypeCode {
  Lipsync = 'LIPSYNC',
  Seedance = 'SEEDANCE',
}

export type WorkflowExecution = {
  id: string
  userId?: string
  status: ExecutionStatus
  resultMediaType: MediaType
  workflowTypeCode?: string
  context: LipsyncContext
  errorMessage: string | null
  requestedAt: string
  startedAt: string | null
  finishedAt: string | null
}

export type CreateLipsyncPayload = {
  image: File
  audio: File
  prompt: string
  taskName: string
}

export type CreateSeedancePayload = {
  prompt: string
  taskName: string
  assetMediaIds: string[]
  duration: number
  aspectRatio: string
  resolution: string
}

export type SeedanceContext = {
  name?: string | null
  prompt?: string
  asset_media_ids?: string[]
  duration?: number
  aspect_ratio?: string
  resolution?: string
}
