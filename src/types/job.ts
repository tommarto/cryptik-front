export enum JobStatus {
  Queued = 'QUEUED',
  Processing = 'PROCESSING',
  Completed = 'COMPLETED',
  Error = 'ERROR',
}

export type Job = {
  id: string
  status: JobStatus
  /** ISO. Cuándo se pidió el trabajo. */
  requestedAt: string
  /** ISO. Cuándo empezó a ejecutarse. `null` mientras sigue en cola. */
  startedAt: string | null
  /** ISO. Cuándo terminó, con éxito o error. `null` si sigue corriendo. */
  finishedAt: string | null
}
