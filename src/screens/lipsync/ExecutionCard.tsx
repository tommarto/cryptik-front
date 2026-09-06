import { CheckCircle2, CircleAlert, Clock, Loader } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { BadgeTone } from '../../constants/ui'
import { useElapsed } from '../../hooks/useElapsed'
import { ExecutionStatus, type WorkflowExecution } from '../../types/workflow'
import { formatClock, formatElapsed, formatMillis } from '../../utils/time'

/** Compartido con el encabezado de la cola para que las columnas no se corran. */
export const EXECUTION_GRID = 'grid-cols-[7.5rem_5rem_4.5rem_4rem_4rem] gap-3'

type ExecutionCardProps = {
  execution: WorkflowExecution
  selected?: boolean
  onSelect?: (execution: WorkflowExecution) => void
}

const statusConfig = {
  [ExecutionStatus.Processing]: {
    label: 'En Proceso',
    tone: BadgeTone.Info,
    Icon: Loader,
  },
  [ExecutionStatus.Queued]: {
    label: 'En Cola',
    tone: BadgeTone.Warning,
    Icon: Clock,
  },
  [ExecutionStatus.Completed]: {
    label: 'Completado',
    tone: BadgeTone.Success,
    Icon: CheckCircle2,
  },
  [ExecutionStatus.Error]: {
    label: 'Error',
    tone: BadgeTone.Danger,
    Icon: CircleAlert,
  },
} as const

export function ExecutionCard({
  execution,
  selected = false,
  onSelect,
}: ExecutionCardProps) {
  const { label, tone, Icon } = statusConfig[execution.status]
  const liveElapsed = useElapsed(execution.startedAt, execution.finishedAt)

  // RunPod reporta los tiempos reales al terminar. Mientras corre, lo único que
  // tenemos es nuestro propio cronómetro.
  const done = Boolean(execution.finishedAt)
  const exec = done
    ? formatMillis(execution.context.executionTime)
    : formatElapsed(liveElapsed)

  return (
    <button
      type="button"
      onClick={() => onSelect?.(execution)}
      className={`grid w-full ${EXECUTION_GRID} items-center rounded-lg border px-3 py-2 text-left transition-colors ${
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

      <span className="font-mono text-[11px] text-slate-300">
        #{execution.id.slice(0, 8)}
      </span>

      <span className="text-[11px] text-slate-500">
        {formatClock(execution.requestedAt)}
      </span>

      <span
        className="font-mono text-[11px] text-slate-500 tabular-nums"
        title="Tiempo en cola en RunPod"
      >
        {formatMillis(execution.context.delayTime)}
      </span>

      <span
        className="font-mono text-[11px] text-slate-300 tabular-nums"
        title="Tiempo de ejecución"
      >
        {exec}
      </span>
    </button>
  )
}
