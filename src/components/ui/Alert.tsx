import { AlertTriangle, Info, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { AlertVariant } from '../../constants/ui'

type AlertProps = {
  variant?: AlertVariant
  title: string
  children?: ReactNode
  /** Si viene, se muestra la cruz para cerrarlo. */
  onDismiss?: () => void
}

const variants = {
  [AlertVariant.Error]: {
    box: 'border-red-500/30 bg-red-500/10',
    title: 'text-red-300',
    body: 'text-red-200/80',
    Icon: AlertTriangle,
  },
  [AlertVariant.Info]: {
    box: 'border-sky-500/30 bg-sky-500/10',
    title: 'text-sky-300',
    body: 'text-sky-200/80',
    Icon: Info,
  },
} as const

export function Alert({
  variant = AlertVariant.Error,
  title,
  children,
  onDismiss,
}: AlertProps) {
  const { box, title: titleColor, body, Icon } = variants[variant]

  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-xl border p-4 ${box}`}
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${titleColor}`} />

      <div className="flex-1">
        <p className={`text-sm font-semibold ${titleColor}`}>{title}</p>
        {children && <p className={`mt-1 text-xs ${body}`}>{children}</p>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar"
          className={`h-fit rounded transition-opacity hover:opacity-70 ${titleColor}`}
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
