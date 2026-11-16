import type { AssetKind } from './media'

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
  awaiting_faces?: boolean
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

export type ReuseExecutionState = { reuseExecution: WorkflowExecution }

export type CreateLipsyncPayload = {
  image: File
  audio: File
  prompt: string
  taskName: string
}

export type CreateSeedancePayload = {
  prompt: string
  taskName: string
  references: SeedanceReference[]
  duration: number
  aspectRatio: string
  resolution: string
  sourceExecutionId?: string
}

export type SeedanceReference = {
  kind: AssetKind
  id: string
}

export type SeedanceContext = {
  name?: string | null
  prompt?: string
  references?: SeedanceReference[]
  asset_media_ids?: string[]
  awaiting_faces?: boolean
  duration?: number
  aspect_ratio?: string
  resolution?: string
}
