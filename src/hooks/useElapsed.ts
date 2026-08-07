import { useEffect, useState } from 'react'

/**
 * Segundos transcurridos entre `startedAt` y ahora, recalculados cada segundo.
 * Si el trabajo ya terminó, congela en `finishedAt` en vez de seguir contando.
 * Devuelve `null` si todavía no arrancó.
 *
 * Se calcula acá en vez de recibir el total en segundos: ese número queda viejo
 * apenas la pestaña pasa a segundo plano o el dato tiene unos segundos de vuelo.
 */
export function useElapsed(
  startedAt: string | null,
  finishedAt: string | null,
): number | null {
  const running = Boolean(startedAt) && !finishedAt
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!running) return

    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  if (!startedAt) return null

  const end = finishedAt ? new Date(finishedAt).getTime() : now
  const seconds = Math.floor((end - new Date(startedAt).getTime()) / 1000)

  return Math.max(0, seconds)
}
