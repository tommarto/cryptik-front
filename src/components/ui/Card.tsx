import type { ReactNode } from 'react'

type CardProps = {
  /** Encabezado del panel. Sin título, la card es solo un contenedor. */
  title?: string
  /** Se alinea a la derecha del título (botón de refresh, acciones). */
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, action, children, className = '' }: CardProps) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 ${className}`}
    >
      {title && (
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          {action}
        </header>
      )}
      {/* `min-h-0` deja que el cuerpo se achique por debajo de su contenido
          cuando la card tiene alto fijo, para que adentro se pueda scrollear. */}
      <div className="min-h-0 flex-1 p-5">{children}</div>
    </section>
  )
}
