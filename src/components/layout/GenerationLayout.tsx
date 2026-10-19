import type { ReactNode } from 'react'
import { MonitorPlay, RefreshCw } from 'lucide-react'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'
import { AlertVariant, ButtonSize, ButtonVariant } from '../../constants/ui'
import { useExecutions } from '../../hooks/useExecutions'
import type { WorkflowExecution } from '../../types/workflow'
import {
  EXECUTION_GRID,
  EXECUTION_GRID_COMPACT,
  ExecutionCard,
  SECONDARY_COLUMN,
} from '../composites/ExecutionCard'
import { ExecutionPreview } from '../composites/ExecutionPreview'

type GenerationLayoutProps = {
  title: string
  subtitle: string
  headerAction?: ReactNode
  workflowTypeCode: string
  emptyQueueMessage: string
  error?: string | null
  onDismissError?: () => void
  showDelay?: boolean
  onLoadExecution?: (execution: WorkflowExecution) => void
  selectedId: string | null
  onSelectExecution: (executionId: string) => void
  children: ReactNode
  footer: ReactNode
}

export function GenerationLayout({
  title,
  subtitle,
  headerAction,
  workflowTypeCode,
  emptyQueueMessage,
  error,
  onDismissError,
  showDelay = false,
  onLoadExecution,
  selectedId,
  onSelectExecution,
  children,
  footer,
}: GenerationLayoutProps) {
  const {
    data: executions = [],
    isPending,
    isFetching,
    refetch,
  } = useExecutions(workflowTypeCode)

  const selected =
    executions.find((execution) => execution.id === selectedId) ?? executions[0]

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-8 sm:py-8 lg:h-dvh lg:overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        {headerAction}
      </header>

      <div className="mt-8 grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
        <div className="flex flex-col gap-6 lg:min-h-0">
          {error && (
            <Alert
              variant={AlertVariant.Error}
              title="Error de Procesamiento"
              onDismiss={onDismissError}
            >
              {error}
            </Alert>
          )}

          <Card title="Parámetros de Entrada" className="flex-1 lg:min-h-0">
            <div className="flex h-full min-h-0 flex-1 flex-col gap-4 lg:overflow-y-auto">
              {children}

              <div className="mt-auto flex justify-end gap-3">{footer}</div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:min-h-0">
          <Card
            className="lg:h-56"
            title="Cola de Trabajos"
            action={
              <Button
                variant={ButtonVariant.Ghost}
                size={ButtonSize.Icon}
                aria-label="Actualizar cola"
                onClick={() => void refetch()}
                disabled={isFetching}
                icon={
                  <RefreshCw
                    className={`size-4 ${isFetching ? 'animate-spin' : ''}`}
                  />
                }
              />
            }
          >
            {isPending ? (
              <div className="flex h-full items-center justify-center">
                <Spinner className="size-6" />
              </div>
            ) : executions.length === 0 ? (
              <p className="text-xs text-slate-500">{emptyQueueMessage}</p>
            ) : (
              <div className="flex h-full flex-col gap-2 overflow-y-auto">
                <div
                  className={`sticky top-0 grid ${showDelay ? EXECUTION_GRID : EXECUTION_GRID_COMPACT} ${onLoadExecution ? 'pr-10' : 'pr-3'} bg-slate-900/95 pb-1 pl-3 text-[10px] font-medium uppercase tracking-wider text-slate-600`}
                >
                  <span className="sm:hidden">Nombre</span>
                  <span className={SECONDARY_COLUMN}>ID</span>
                  <span className="hidden sm:block">Nombre</span>
                  <span>Estado</span>
                  <span className={SECONDARY_COLUMN}>Pedido</span>
                  {showDelay && <span className={SECONDARY_COLUMN}>Espera</span>}
                  <span className={SECONDARY_COLUMN}>
                    {showDelay ? 'Ejec.' : 'Ejecución'}
                  </span>
                </div>

                {executions.map((execution) => (
                  <ExecutionCard
                    key={execution.id}
                    execution={execution}
                    selected={execution.id === selected?.id}
                    showDelay={showDelay}
                    onLoad={onLoadExecution}
                    onSelect={(picked: WorkflowExecution) =>
                      onSelectExecution(picked.id)
                    }
                  />
                ))}
              </div>
            )}
          </Card>

          {selected ? (
            <ExecutionPreview
              execution={selected}
              className="flex-1 lg:min-h-0"
            />
          ) : (
            <Card
              title="Vista Previa"
              className="flex-1 lg:min-h-0"
              bodyClassName="p-0"
            >
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-950/40 px-6 py-10 text-center">
                <MonitorPlay className="size-7 text-slate-700" />
                <p className="max-w-xs text-xs text-slate-500">
                  Acá vas a ver el resultado. Elegí un trabajo de la cola, o
                  generá uno nuevo.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
