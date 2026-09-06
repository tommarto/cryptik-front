export enum ExecutionStatus {
  Queued = 'QUEUED',
  Processing = 'PROCESSING',
  Completed = 'COMPLETED',
  Error = 'ERROR',
}

/**
 * El `context` es jsonb del lado de la base y su forma depende del tipo de
 * workflow. Para lipsync son estos campos.
 */
export type LipsyncContext = {
  prompt?: string | null
  s3_path?: string | null
  /** Milisegundos en cola en RunPod. Llega recién con el webhook final. */
  delayTime?: number | null
  /** Milisegundos de ejecución. Es lo que se factura. */
  executionTime?: number | null
}

export type WorkflowExecution = {
  id: string
  status: ExecutionStatus
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
}
