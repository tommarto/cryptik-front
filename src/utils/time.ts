/**
 * Segundos a `mm:ss`. `null` = todavía no arrancó (sigue en cola).
 */
export function formatElapsed(seconds: number | null): string {
  if (seconds === null) return '--:--'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

/**
 * ISO a hora local corta (`10:42 AM`).
 */
export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
