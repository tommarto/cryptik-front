import { JobStatus, type Job } from '../types/job'

/**
 * Datos mock hasta que exista la API. Cuando aparezca, esto pasa a llamar a un
 * client de `src/clients/` sin que cambie la firma de los métodos.
 */
const MOCK_JOBS: Job[] = [
  {
    id: 'IT-8902',
    status: JobStatus.Processing,
    requestedAt: '10:42 AM',
    elapsedSeconds: 45,
    progress: 67,
  },
  {
    id: 'IT-8903',
    status: JobStatus.Queued,
    requestedAt: '10:44 AM',
    elapsedSeconds: null,
    progress: 0,
  },
  {
    id: 'IT-8901',
    status: JobStatus.Completed,
    requestedAt: '10:30 AM',
    elapsedSeconds: 72,
    progress: 100,
  },
  {
    id: 'IT-8899',
    status: JobStatus.Error,
    requestedAt: '10:15 AM',
    elapsedSeconds: 3,
    progress: 0,
  },
]

export const jobService = {
  list: (): Job[] => MOCK_JOBS,

  getActive: (): Job | undefined =>
    MOCK_JOBS.find((job) => job.status === JobStatus.Processing),
}
