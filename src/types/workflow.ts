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

/**
 * El `context` es jsonb del lado de la base y su forma depende del tipo de
 * workflow. Para lipsync son estos campos.
 */
export type LipsyncContext = {
  /** Etiqueta para leer, no un identificador: puede repetirse entre corridas. */
  name?: string | null
  prompt?: string | null
  s3_path?: string | null
  /** Milisegundos en cola en RunPod. Llega recién con el webhook final. */
  delayTime?: number | null
  /** Milisegundos de ejecución. Es lo que se factura. */
  executionTime?: number | null
  /** Media de entrada. La miniatura de la galería sale de la imagen. */
  image_media_id?: string | null
  audio_media_id?: string | null
}

export type WorkflowExecution = {
  id: string
  /** Quién la generó. Solo lo devuelve la galería; en la cola es siempre uno mismo. */
  userId?: string
  status: ExecutionStatus
  /** Qué produce este workflow. Sale de la definición, no del resultado. */
  resultMediaType: MediaType
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
  /** Si viene vacío, se usa el nombre del archivo de audio. */
  taskName: string
}
