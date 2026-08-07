import type { ReactNode } from 'react'

type SpinnerProps = {
  /** Se centra adentro del anillo (un icono, normalmente). */
  children?: ReactNode
  className?: string
}

export function Spinner({ children, className = 'size-12' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`relative flex items-center justify-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-400 motion-reduce:animate-none"
      />
      {children}
    </div>
  )
}
