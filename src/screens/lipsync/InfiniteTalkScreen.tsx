import { useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { Textarea } from '../../components/ui/Textarea'
import { Dropzone } from '../../components/composites/Dropzone'
import { Modal } from '../../components/composites/Modal'
import {
  AlertVariant,
  ButtonSize,
  ButtonVariant,
  DropzoneVariant,
} from '../../constants/ui'
import { useCreateLipsync, useExecutions } from '../../hooks/useExecutions'
import { useElapsed } from '../../hooks/useElapsed'
import { useVideoUrl } from '../../hooks/useVideoUrl'
import { MAX_AUDIO_BYTES, MAX_IMAGE_BYTES } from '../../services/workflowService'
import { ExecutionStatus, type WorkflowExecution } from '../../types/workflow'
import { describeRejection, formatBytes } from '../../utils/file'
import { formatElapsed } from '../../utils/time'
import {
  EXECUTION_GRID,
  ExecutionCard,
  SECONDARY_COLUMN,
} from './ExecutionCard'
import { LipsyncDocs } from './LipsyncDocs'

const PHASE_LABEL: Record<string, string> = {
  idle: 'Generar →',
  uploading: 'Subiendo archivos…',
  starting: 'Encolando…',
}

export function InfiniteTalkScreen() {
  const [image, setImage] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [taskName, setTaskName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [docsOpen, setDocsOpen] = useState(false)

  const { data: executions = [], isPending, isFetching, refetch } = useExecutions()
  const createLipsync = useCreateLipsync()

  const selected =
    executions.find((execution) => execution.id === selectedId) ?? executions[0]

  function clear() {
    setImage(null)
    setAudio(null)
    setTaskName('')
    setPrompt('')
    setError(null)
  }

  async function generate() {
    if (!image || !audio) return

    setError(null)

    try {
      const execution = await createLipsync.mutateAsync({
        image,
        audio,
        prompt,
        taskName,
      })
      setSelectedId(execution.id)
      clear()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not start the generation.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
      <Modal
        open={docsOpen}
        onClose={() => setDocsOpen(false)}
        title="Cómo funciona el generador de lipsync"
      >
        <LipsyncDocs />
      </Modal>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">
            Cryptik - Lipsync Tool
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Genera lipsyncs a partir de una imagen, un audio y un prompt.
          </p>
        </div>

        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Sm}
          className="shrink-0"
          onClick={() => setDocsOpen(true)}
        >
          Documentación
        </Button>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          {error && (
            <Alert
              variant={AlertVariant.Error}
              title="Error de Procesamiento"
              onDismiss={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Card title="Parámetros de Entrada" className="flex-1">
            <div className="flex h-full flex-col gap-5">
              <Input
                label="Nombre"
                value={taskName}
                onChange={(event) => setTaskName(event.target.value)}
                placeholder="Opcional — si lo dejás vacío usamos el nombre del audio"
                maxLength={120}
              />

              <Dropzone
                label="Imagen Base"
                variant={DropzoneVariant.Area}
                placeholder="Arrastrá y soltá tu imagen aquí, o explorá"
                hint={`PNG, JPG o WEBP, hasta ${formatBytes(MAX_IMAGE_BYTES)}.`}
                accept={{
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/webp': ['.webp'],
                }}
                maxSize={MAX_IMAGE_BYTES}
                file={image}
                onFileAccepted={setImage}
                onFileRejected={(rejection) =>
                  setError(
                    `${describeRejection(rejection, MAX_IMAGE_BYTES)} Se aceptan PNG y JPG.`,
                  )
                }
              />

              <Dropzone
                label="Archivo de Audio"
                variant={DropzoneVariant.Compact}
                placeholder="Seleccionar audio..."
                hint={`MP3, WAV o M4A, hasta ${formatBytes(MAX_AUDIO_BYTES)}.`}
                accept={{ 'audio/*': ['.mp3', '.wav', '.m4a'] }}
                maxSize={MAX_AUDIO_BYTES}
                file={audio}
                onFileAccepted={setAudio}
                onFileRejected={(rejection) =>
                  setError(
                    `${describeRejection(rejection, MAX_AUDIO_BYTES)} Se aceptan MP3, WAV y M4A.`,
                  )
                }
              />

              <Textarea
                label="Prompt de Imagen"
                rows={7}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Describe detalladamente el resultado visual esperado. Incluye estilo, iluminación y estado de ánimo..."
              />

              <div className="mt-auto flex justify-end gap-3">
                <Button
                  variant={ButtonVariant.Ghost}
                  onClick={clear}
                  disabled={createLipsync.isPending}
                >
                  Limpiar
                </Button>
                <Button
                  onClick={generate}
                  disabled={!image || !audio || createLipsync.isPending}
                >
                  {PHASE_LABEL[createLipsync.phase ?? 'idle']}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
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
                  <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
                }
              />
            }
          >
            {isPending ? (
              <div className="flex h-full items-center justify-center">
                <Spinner className="size-6" />
              </div>
            ) : executions.length === 0 ? (
              <p className="text-xs text-slate-500">
                Todavía no generaste nada. Subí una imagen y un audio para empezar.
              </p>
            ) : (
              <div className="flex h-full flex-col gap-2 overflow-y-auto">
                <div
                  className={`sticky top-0 grid ${EXECUTION_GRID} bg-slate-900/95 px-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-slate-600`}
                >
                  <span className="sm:hidden">Nombre</span>
                  <span className={SECONDARY_COLUMN}>ID</span>
                  <span className="hidden sm:block">Nombre</span>
                  <span>Estado</span>
                  <span className={SECONDARY_COLUMN}>Pedido</span>
                  <span className={SECONDARY_COLUMN}>Espera</span>
                  <span className={SECONDARY_COLUMN}>Ejec.</span>
                </div>

                {executions.map((execution) => (
                  <ExecutionCard
                    key={execution.id}
                    execution={execution}
                    selected={execution.id === selected?.id}
                    onSelect={(picked) => setSelectedId(picked.id)}
                  />
                ))}
              </div>
            )}
          </Card>

          {selected && <ExecutionPreview execution={selected} className="flex-1 lg:min-h-[36rem]" />}
        </div>
      </div>
    </div>
  )
}

function ExecutionPreview({
  execution,
  className,
}: {
  execution: WorkflowExecution
  className?: string
}) {
  const elapsed = useElapsed(execution.startedAt, execution.finishedAt)
  const isDone = execution.status === ExecutionStatus.Completed
  const { data: videoUrl, isPending: loadingUrl } = useVideoUrl(
    execution.id,
    isDone && Boolean(execution.context.s3_path),
  )

  return (
    <Card title={`#${execution.id.slice(0, 8)} · Vista Previa`} className={className}>
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-6 py-10 text-center">
        {execution.status === ExecutionStatus.Error ? (
          <>
            <p className="text-sm font-medium text-red-300">La generación falló</p>
            <p className="mt-2 max-w-sm text-xs text-slate-500">
              {execution.errorMessage ?? 'El proveedor no devolvió un detalle.'}
            </p>
          </>
        ) : isDone ? (
          loadingUrl ? (
            <Spinner />
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="max-h-full max-w-full rounded-lg"
            />
          ) : (
            <p className="text-xs text-slate-500">No se pudo cargar el video.</p>
          )
        ) : (
          <>
            <Spinner>
              <Sparkles className="size-5 text-indigo-400" />
            </Spinner>

            <p className="mt-4 text-sm font-medium text-slate-200">
              Generando Contenido...
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Sintetizando audio y renderizando frames
            </p>

            <p className="mt-5 font-mono text-lg text-slate-300">
              {formatElapsed(elapsed)}
            </p>
            <p className="text-[11px] text-slate-600">Tiempo transcurrido</p>
          </>
        )}
      </div>
    </Card>
  )
}
