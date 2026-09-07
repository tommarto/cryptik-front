import { useCallback, useRef, useState } from 'react'
import { workflowService } from '../services/workflowService'

export enum DownloadState {
  Idle = 'idle',
  Loading = 'loading',
  Error = 'error',
}

/**
 * Baja el video de una ejecución.
 *
 * Pide al back una URL firmada con `Content-Disposition: attachment` y navega
 * a ella. No se usa `fetch` + blob a propósito: eso dependería de que el bucket
 * tenga GET en su CORS y cargaría el video entero en memoria. Así el que decide
 * bajarlo es S3.
 *
 * Vive en un hook y no en un componente porque los dos lugares que lo usan
 * dibujan botones distintos: una píldora sobre la miniatura en la galería y un
 * botón ghost en el header de la card de vista previa.
 */
export function useVideoDownload(executionId: string) {
  const [state, setState] = useState(DownloadState.Idle)
  // Un ref y no el estado: dos clicks seguidos pueden caer antes de que React
  // vuelva a renderizar, y ahí el handler todavía ve el estado viejo.
  const running = useRef(false)

  const download = useCallback(async () => {
    if (running.current) return
    running.current = true
    setState(DownloadState.Loading)

    try {
      const url = await workflowService.getVideoUrl(executionId, true)
      const link = document.createElement('a')
      link.href = url
      document.body.appendChild(link)
      link.click()
      link.remove()
      setState(DownloadState.Idle)
    } catch {
      setState(DownloadState.Error)
    } finally {
      running.current = false
    }
  }, [executionId])

  return { download, state }
}
