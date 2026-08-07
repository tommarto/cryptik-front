import { JobStatus, type Job } from '../types/job'

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString()

const secondsAgo = (seconds: number) =>
  new Date(Date.now() - seconds * 1000).toISOString()

/**
 * Datos mock hasta que exista la API. Los tiempos son relativos al arranque
 * para que el contador del job en proceso se vea corriendo.
 */
const MOCK_JOBS: Job[] = [
  {
    id: 'IT-8902',
    status: JobStatus.Processing,
    requestedAt: secondsAgo(50),
    startedAt: secondsAgo(45),
    finishedAt: null,
  },
  {
    id: 'IT-8903',
    status: JobStatus.Queued,
    requestedAt: secondsAgo(20),
    startedAt: null,
    finishedAt: null,
  },
  {
    id: 'IT-8901',
    status: JobStatus.Completed,
    requestedAt: minutesAgo(14),
    startedAt: minutesAgo(13),
    finishedAt: minutesAgo(11.8),
  },
  {
    id: 'IT-8899',
    status: JobStatus.Error,
    requestedAt: minutesAgo(28),
    startedAt: minutesAgo(27),
    finishedAt: minutesAgo(26.95),
  },
]

export const jobService = {
  list: (): Job[] => MOCK_JOBS,

  getActive: (): Job | undefined =>
    MOCK_JOBS.find((job) => job.status === JobStatus.Processing),
}
