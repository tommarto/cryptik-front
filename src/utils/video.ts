const FRAME_AT_SECONDS = 1

const THUMBNAIL_MAX_EDGE = 400
const THUMBNAIL_QUALITY = 0.8

export async function makeVideoThumbnail(file: File) {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'metadata'
  video.src = url

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () => reject(new Error(`No se pudo leer "${file.name}".`))
    })

    video.currentTime = Math.min(FRAME_AT_SECONDS, (video.duration || 0) / 2)
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve()
    })

    const { videoWidth: width, videoHeight: height } = video
    const scale = Math.min(1, THUMBNAIL_MAX_EDGE / Math.max(width, height))

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)

    const context = canvas.getContext('2d')
    if (!context) throw new Error('El navegador no permitió generar la miniatura.')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', THUMBNAIL_QUALITY),
    )
    if (!blob) throw new Error('No se pudo generar la miniatura.')

    return { blob, width, height }
  } finally {
    URL.revokeObjectURL(url)
  }
}
