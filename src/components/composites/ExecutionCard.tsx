import {
  CheckCircle2,
  CircleAlert,
  Clock,
  FileInput,
  Loader,
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { BadgeTone } from '../../constants/ui'
import { useElapsed } from '../../hooks/useElapsed'
import { ExecutionStatus, type WorkflowExecution } from '../../types/workflow'
import { formatClock, formatElapsed, formatMillis } from '../../utils/time'

export const EXECUTION_GRID =
  'grid-cols-[1fr_6.75rem] gap-2 sm:grid-cols-[3.75rem_1fr_6.75rem_3.75rem_2.75rem_2.75rem]'

export const EXECUTION_GRID_COMPACT =
  'grid-cols-[1fr_6.75rem] gap-2 sm:grid-cols-[3.75rem_1fr_6.75rem_3.75rem_4.5rem]'

export const SECONDARY_COLUMN = 'hidden sm:block'

type ExecutionCardProps = {
  execution: WorkflowExecution
  selected?: boolean
  onSelect?: (execution: WorkflowExecution) => void
  showDelay?: boolean
  onLoad?: (execution: WorkflowExecution) => void
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
  showDelay = false,
  onLoad,
}: ExecutionCardProps) {
  const { label, tone, Icon } = statusConfig[execution.status]
  const liveElapsed = useElapsed(execution.startedAt, execution.finishedAt)

  const done = Boolean(execution.finishedAt)
  const exec = !done
    ? formatElapsed(liveElapsed)
    : showDelay
      ? formatMillis(execution.context.executionTime)
      : // `formatElapsed` espera segundos, no milisegundos.
        formatElapsed(
          Math.round(
            (new Date(execution.finishedAt!).getTime() -
              new Date(execution.requestedAt).getTime()) /
              1000,
          ),
        )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(execution)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect?.(execution)
        }
      }}
      className={`group relative grid w-full cursor-pointer ${showDelay ? EXECUTION_GRID : EXECUTION_GRID_COMPACT} items-center rounded-lg border py-2 pl-3 text-left transition-colors ${onLoad ? 'pr-10' : 'pr-3'} ${
        selected
          ? 'border-indigo-500/50 bg-indigo-500/10'
          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
      }`}
    >
      {onLoad && (
        <span className="group/tip absolute right-1.5 top-1/2 z-10 -translate-y-1/2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onLoad(execution)
            }}
            aria-label="Reutilizar prompt"
            className="block rounded-md bg-slate-800 p-1.5 text-slate-400 ring-1 ring-slate-700 transition-colors hover:bg-slate-700 hover:text-slate-100"
          >
            <FileInput className="size-3.5" />
          </button>

          <span className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-200 opacity-0 ring-1 ring-slate-700 transition-opacity group-hover/tip:opacity-100">
            Reutilizar prompt
          </span>
        </span>
      )}

      <span className={`${SECONDARY_COLUMN} font-mono text-[11px] text-slate-500`}>
        #{execution.id.slice(0, 6)}
      </span>

      <span
        className="truncate text-[11px] text-slate-200"
        title={execution.context.name ?? undefined}
      >
        {execution.context.name ?? '—'}
      </span>

      <span className="justify-self-start">
        <Badge tone={tone} icon={<Icon className="size-3" />}>
          {label}
        </Badge>
      </span>

      <span className={`${SECONDARY_COLUMN} text-[11px] text-slate-500`}>
        {formatClock(execution.requestedAt)}
      </span>

      {showDelay && (
        <span
          className={`${SECONDARY_COLUMN} font-mono text-[11px] text-slate-500 tabular-nums`}
          title="Tiempo en cola en RunPod"
        >
          {formatMillis(execution.context.delayTime)}
        </span>
      )}

      <span
        className={`${SECONDARY_COLUMN} font-mono text-[11px] text-slate-300 tabular-nums`}
        title="Tiempo de ejecución"
      >
        {exec}
      </span>
    </div>
  )
}
