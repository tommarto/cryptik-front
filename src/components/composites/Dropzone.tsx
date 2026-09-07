import { useCallback, useEffect, useState } from 'react'
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone'
import { CircleAlert, Image as ImageIcon, FileAudio } from 'lucide-react'
import { DropzoneVariant } from '../../constants/ui'
import { makePreviewDataUrl } from '../../utils/image'

type DropzoneProps = {
  label: string
  /** Ej. `{ 'image/png': ['.png'], 'image/jpeg': ['.jpg'] }` */
  accept: Accept
  maxSize: number
  variant?: DropzoneVariant
  /** Call to action. En `Compact` es el texto de la fila. */
  placeholder: string
  /** Texto chico bajo el call to action (formatos, tamaño máximo). */
  hint?: string
  file?: File | null
  error?: string
  onFileAccepted: (file: File) => void
  onFileRejected?: (rejection: FileRejection) => void
}

export function Dropzone({
  label,
  accept,
  maxSize,
  variant = DropzoneVariant.Area,
  placeholder,
  hint,
  file,
  error,
  onFileAccepted,
  onFileRejected,
}: DropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (accepted[0]) onFileAccepted(accepted[0])
      else if (rejections[0]) onFileRejected?.(rejections[0])
    },
    [onFileAccepted, onFileRejected],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({ accept, maxSize, multiple: false, onDrop })

  // Vista previa del archivo elegido, cuando es una imagen.
  //
  // Se guarda junto al `File` que la originó para poder descartarla cuando
  // cambia el archivo: sin eso, al elegir otra imagen se vería la anterior
  // hasta que termine de generarse la nueva.
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(
    null,
  )

  useEffect(() => {
    if (!file?.type.startsWith('image/')) return

    let cancelled = false
    makePreviewDataUrl(file)
      .then((url) => {
        if (!cancelled) setPreview({ file, url })
      })
      .catch(() => {
        // Sin vista previa se sigue viendo el nombre del archivo. Si la imagen
        // es ilegible de verdad, `makeThumbnail` vuelve a fallar al subir y ahí
        // sí se le avisa al usuario.
      })

    return () => {
      cancelled = true
    }
  }, [file])

  const previewUrl = preview && preview.file === file ? preview.url : null

  const invalid = isDragReject || Boolean(error)
  const border = invalid
    ? 'border-red-500/50 bg-red-500/5'
    : isDragActive
      ? 'border-indigo-500 bg-indigo-500/5'
      : 'border-slate-700 bg-slate-950/30 hover:border-slate-600'

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-300">{label}</p>

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border transition-colors ${
          variant === DropzoneVariant.Area
            ? 'flex flex-col items-center justify-center border-dashed px-6 py-8 text-center'
            : 'flex items-center gap-3 px-3 py-3'
        } ${border}`}
      >
        <input {...getInputProps()} />

        {variant === DropzoneVariant.Area ? (
          <>
            {previewUrl && !isDragActive ? (
              <img
                src={previewUrl}
                alt={file?.name ?? ''}
                className="mb-3 max-h-40 rounded-md object-contain"
              />
            ) : (
              <ImageIcon className="mb-3 size-6 text-slate-600" />
            )}
            <p className="max-w-full truncate text-xs text-slate-400">
              {isDragActive ? 'Soltá el archivo acá' : file?.name || placeholder}
            </p>
            {/* Con la imagen a la vista, repetir los formatos aceptados es
                ruido: ya se sabe que el archivo entró. */}
            {hint && !previewUrl && (
              <p className="mt-1 text-[11px] text-slate-600">{hint}</p>
            )}
          </>
        ) : (
          <>
            <FileAudio className="size-4 shrink-0 text-slate-500" />
            <span className="flex-1 truncate text-xs text-slate-400">
              {isDragActive ? 'Soltá el archivo acá' : file?.name || placeholder}
            </span>
            {invalid && (
              <CircleAlert className="size-4 shrink-0 text-red-400" />
            )}
          </>
        )}
      </div>

      {hint && variant === DropzoneVariant.Compact && (
        <p className="mt-1.5 text-[11px] text-slate-600">{hint}</p>
      )}

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}
