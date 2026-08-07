export enum JobStatus {
  Queued = 'QUEUED',
  Processing = 'PROCESSING',
  Completed = 'COMPLETED',
  Error = 'ERROR',
}

export type Job = {
  id: string
  status: JobStatus
  requestedAt: string
  /** Segundos transcurridos. `null` mientras sigue en cola. */
  elapsedSeconds: number | null
  progress: number
}
