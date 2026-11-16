import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { Dropzone } from '../../components/composites/Dropzone'
import { AlertVariant } from '../../constants/ui'
import { useCreateFace, useFaces } from '../../hooks/useFaces'
import { faceFileRejection, faceNameFromFile } from '../../services/faceService'
import { FACE_MAX_BYTES, FaceSyncStatus, isFacePending, type Face } from '../../types/face'
import { FaceCard } from './FaceCard'
import { RetentionField } from './RetentionField'

enum FaceFilter {
  All = 'all',
  Available = 'available',
  Pending = 'pending',
  Unavailable = 'unavailable',
}

const FILTERS: { value: FaceFilter; label: string; matches: (face: Face) => boolean }[] = [
  { value: FaceFilter.All, label: 'Todas', matches: () => true },
  {
    value: FaceFilter.Available,
    label: 'Disponibles',
    matches: (face) => face.syncStatus === FaceSyncStatus.Synced,
  },
  { value: FaceFilter.Pending, label: 'En proceso', matches: isFacePending },
  {
    value: FaceFilter.Unavailable,
    label: 'No disponibles',
    matches: (face) =>
      face.syncStatus === FaceSyncStatus.Unsynced || face.syncStatus === FaceSyncStatus.Failed,
  },
]

const ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

export function FacesScreen() {
  const { data, isPending } = useFaces()
  const createFace = useCreateFace()

  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>()
  const [name, setName] = useState('')
  const [retentionDays, setRetentionDays] = useState<number | null>(null)
  const [syncNow, setSyncNow] = useState(true)
  const [filter, setFilter] = useState(FaceFilter.All)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const faces = data?.faces ?? []
  const quota = data?.quota
  const quotaFull = quota ? quota.used >= quota.limit : false
  const visible = faces.filter(FILTERS.find((option) => option.value === filter)!.matches)

  async function pick(picked: File) {
    setFileError(undefined)
    const rejection = await faceFileRejection(picked)
    if (rejection) {
      setFile(null)
      setFileError(rejection)
      return
    }
    setFile(picked)
    if (!name.trim()) setName(faceNameFromFile(picked))
  }

  async function submit() {
    if (!file || !name.trim()) return
    setError(null)
    setNotice(null)
    try {
      const created = await createFace.mutateAsync({
        file,
        name: name.trim(),
        retentionDays,
        sync: syncNow && !quotaFull,
      })
      setNotice(created.warning ?? null)
      setFile(null)
      setName('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo agregar la cara.')
    }
  }

  const usage = quota ? Math.min(100, (quota.used / quota.limit) * 100) : 0

  return (
    <div className="px-4 py-8 sm:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">Caras</h1>
          <p className="mt-1 text-sm text-slate-400">
            La biblioteca de caras IA. Solo las disponibles en BytePlus se pueden usar en Seedance.
          </p>
        </div>

        {quota && (
          <div className="w-56">
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="text-slate-400">En BytePlus</span>
              <span className={`font-mono ${quotaFull ? 'text-amber-300' : 'text-slate-200'}`}>
                {quota.used}/{quota.limit}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${quotaFull ? 'bg-amber-400' : 'bg-indigo-500'}`}
                style={{ width: `${usage}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <div className="mb-6 flex flex-col gap-3">
        {error && <Alert title="Error" onDismiss={() => setError(null)}>{error}</Alert>}
        {notice && (
          <Alert variant={AlertVariant.Info} title="Cara agregada" onDismiss={() => setNotice(null)}>
            {notice}
          </Alert>
        )}
        {quotaFull && (
          <Alert variant={AlertVariant.Info} title="No hay lugar en BytePlus">
            Las {quota?.limit} posiciones están ocupadas. Desincronizá alguna cara para habilitar otra.
          </Alert>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <Card title="Nueva cara" className="h-fit">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void submit()
            }}
            className="flex flex-col gap-4"
          >
            <Dropzone
              label="Imagen"
              accept={ACCEPT}
              maxSize={FACE_MAX_BYTES}
              placeholder="Arrastrá una imagen o hacé click"
              hint="JPG, PNG o WEBP · 300 a 6000 px · hasta 30 MB"
              file={file}
              error={fileError}
              onFileAccepted={(picked) => void pick(picked)}
              onFileRejected={() => setFileError('Formato o tamaño no soportado.')}
            />

            <Input
              label="Nombre"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              placeholder="Cómo la vas a encontrar"
            />

            <RetentionField value={retentionDays} onChange={setRetentionDays} />

            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={syncNow && !quotaFull}
                disabled={quotaFull}
                onChange={(event) => setSyncNow(event.target.checked)}
                className="accent-indigo-500"
              />
              Subirla a BytePlus ahora
            </label>

            <Button
              type="submit"
              disabled={!file || !name.trim() || createFace.isPending}
              icon={createFace.isPending ? <Spinner className="size-4" /> : <Plus className="size-4" />}
            >
              Agregar cara
            </Button>
          </form>
        </Card>

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`h-8 rounded-lg px-3 text-xs font-medium ring-1 transition-colors ${
                  filter === option.value
                    ? 'bg-indigo-600/15 text-indigo-300 ring-indigo-500/30'
                    : 'bg-slate-800 text-slate-300 ring-slate-700 hover:bg-slate-700'
                }`}
              >
                {option.label}
                <span className="ml-1.5 font-mono text-slate-500">
                  {faces.filter(option.matches).length}
                </span>
              </button>
            ))}
          </div>

          {isPending ? (
            <div className="flex justify-center py-16">
              <Spinner className="size-6" />
            </div>
          ) : visible.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500">
              {faces.length === 0 ? 'Todavía no hay caras. Subí la primera.' : 'No hay caras con este filtro.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {visible.map((face) => (
                <FaceCard key={face.id} face={face} quotaFull={quotaFull} onError={setError} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
