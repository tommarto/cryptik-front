import { useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { Textarea } from '../../components/ui/Textarea'
import { Dropzone } from '../../components/composites/Dropzone'
import {
  AlertVariant,
  ButtonSize,
  ButtonVariant,
  DropzoneVariant,
} from '../../constants/ui'
import { useElapsed } from '../../hooks/useElapsed'
import { jobService } from '../../services/jobService'
import { JobCard } from './JobCard'
import type { Job } from '../../types/job'
import { formatElapsed } from '../../utils/time'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_AUDIO_BYTES = 20 * 1024 * 1024

export function InfiniteTalkScreen() {
  const [image, setImage] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState<string | null>(null)

  const jobs = jobService.list()
  const [selectedId, setSelectedId] = useState(jobService.getActive()?.id)
  const selected = jobs.find((job) => job.id === selectedId)

  function clear() {
    setImage(null)
    setAudio(null)
    setPrompt('')
    setError(null)
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">
            Cryptik - Lipsync Tool
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Genera lipsyncs a partir de una imagen, un audio y un prompt.
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant={ButtonVariant.Secondary} size={ButtonSize.Sm}>
            Documentación
          </Button>
          <Button size={ButtonSize.Sm}>Ayuda</Button>
        </div>
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
              <Dropzone
                label="Imagen Base"
                variant={DropzoneVariant.Area}
                placeholder="Arrastrá y soltá tu imagen aquí, o explorá"
                hint="Formatos soportados: PNG, JPG (Max 5MB)"
                accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg'] }}
                maxSize={MAX_IMAGE_BYTES}
                file={image}
                onFileAccepted={setImage}
                onFileRejected={() =>
                  setError(
                    'La imagen no cumple con el formato o el tamaño permitido.',
                  )
                }
              />

              <Dropzone
                label="Archivo de Audio"
                variant={DropzoneVariant.Compact}
                placeholder="Seleccionar audio..."
                accept={{ 'audio/*': ['.mp3', '.wav', '.m4a'] }}
                maxSize={MAX_AUDIO_BYTES}
                file={audio}
                onFileAccepted={setAudio}
                onFileRejected={() =>
                  setError(
                    'El archivo de audio subido no cumple con los requisitos mínimos de duración (3 segundos). Por favor, intentá con un archivo diferente.',
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
                <Button variant={ButtonVariant.Ghost} onClick={clear}>
                  Limpiar
                </Button>
                <Button disabled={!image || !audio}>Generar →</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card
            title="Cola de Trabajos"
            action={
              <Button
                variant={ButtonVariant.Ghost}
                size={ButtonSize.Icon}
                aria-label="Actualizar cola"
                icon={<RefreshCw className="size-4" />}
              />
            }
          >
            <div className="flex flex-col gap-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={job.id === selectedId}
                  onSelect={(picked) => setSelectedId(picked.id)}
                />
              ))}
            </div>
          </Card>

          {selected && <JobPreview job={selected} className="flex-1" />}
        </div>
      </div>
    </div>
  )
}

function JobPreview({ job, className }: { job: Job; className?: string }) {
  const elapsed = useElapsed(job.startedAt, job.finishedAt)

  return (
    <Card title={`#${job.id} · Vista Previa`} className={className}>
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-6 py-10 text-center">
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
      </div>
    </Card>
  )
}
