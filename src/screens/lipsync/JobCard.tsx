import { CheckCircle2, CircleAlert, Clock, Loader } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { BadgeTone } from '../../constants/ui'
import { JobStatus, type Job } from '../../types/job'

type JobCardProps = {
  job: Job
  selected?: boolean
  onSelect?: (job: Job) => void
}

const statusConfig = {
  [JobStatus.Processing]: {
    label: 'En Proceso',
    tone: BadgeTone.Info,
    Icon: Loader,
  },
  [JobStatus.Queued]: {
    label: 'En Cola',
    tone: BadgeTone.Warning,
    Icon: Clock,
  },
  [JobStatus.Completed]: {
    label: 'Completado',
    tone: BadgeTone.Success,
    Icon: CheckCircle2,
  },
  [JobStatus.Error]: {
    label: 'Error',
    tone: BadgeTone.Danger,
    Icon: CircleAlert,
  },
} as const

export function JobCard({ job, selected = false, onSelect }: JobCardProps) {
  const { label, tone, Icon } = statusConfig[job.status]

  return (
    <button
      type="button"
      onClick={() => onSelect?.(job)}
      className={`grid w-full grid-cols-[8rem_6rem_5.5rem_auto] items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors ${
        selected
          ? 'border-indigo-500/50 bg-indigo-500/10'
          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
      }`}
    >
      <span className="justify-self-start">
        <Badge tone={tone} icon={<Icon className="size-3" />}>
          {label}
        </Badge>
      </span>

      <span className="font-mono text-xs text-slate-300">#{job.id}</span>

      <span className="text-xs text-slate-500">{job.requestedAt}</span>

      <span className="font-mono text-xs text-slate-400">
        {formatElapsed(job.elapsedSeconds)}
      </span>
    </button>
  )
}

function formatElapsed(seconds: number | null): string {
  if (seconds === null) return '--:--'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}
