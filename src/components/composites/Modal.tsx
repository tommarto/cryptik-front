import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Usa el `<dialog>` nativo en vez de un div con overlay. Eso trae gratis el
 * foco atrapado, el cierre con Escape, el render por encima de todo sin pelear
 * con z-index, y el fondo inerte para lectores de pantalla — que es la parte
 * difícil de hacer bien a mano.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // El body no tiene que scrollear detrás del modal.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        // Escape: lo maneja el navegador, pero el estado lo maneja React.
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        // Un click sobre el propio dialog es un click en el backdrop: el
        // contenido está en un hijo, así que nunca es el target.
        if (event.target === ref.current) onClose()
      }}
      className="m-auto w-[min(90vw,42rem)] rounded-xl border border-slate-800 bg-slate-900 p-0 text-slate-200 backdrop:bg-slate-950/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[80vh] flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded text-slate-400 transition-colors hover:text-slate-200"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* El contenido scrollea, el encabezado no. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </dialog>
  )
}
