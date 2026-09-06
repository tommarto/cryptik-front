/** Lado mayor de la miniatura. 400 cubre una card de 200px en pantallas retina. */
const THUMBNAIL_MAX_EDGE = 400

/** JPEG: el más chico para fotos y lo lee todo. */
const THUMBNAIL_QUALITY = 0.8

/**
 * Genera la miniatura en el browser, donde el archivo ya está — cualquier otro
 * lugar tendría que bajarlo primero.
 *
 * Tira si no puede: sin miniatura, `verify-media` no marca el media como
 * `uploaded` y la generación no arranca, así que conviene fallar acá con un
 * mensaje claro y no más adelante con un 409.
 */
export async function makeThumbnail(file: File): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error(`No se pudo leer "${file.name}" como imagen.`)
  }

  const scale = Math.min(1, THUMBNAIL_MAX_EDGE / Math.max(bitmap.width, bitmap.height))

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const context = canvas.getContext('2d')
  if (!context) throw new Error('El navegador no permitió generar la miniatura.')

  // Un PNG con transparencia quedaría con fondo negro al pasar a JPEG.
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', THUMBNAIL_QUALITY),
  )

  if (!blob) throw new Error('No se pudo generar la miniatura.')
  return blob
}
