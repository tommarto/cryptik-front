import type { ReactNode } from 'react'
import { BadgeTone } from '../../constants/ui'

type BadgeProps = {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
}

const tones: Record<BadgeTone, string> = {
  [BadgeTone.Neutral]: 'bg-slate-800 text-slate-300 ring-slate-700',
  [BadgeTone.Info]: 'bg-sky-500/10 text-sky-300 ring-sky-500/30',
  [BadgeTone.Success]: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  [BadgeTone.Warning]: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  [BadgeTone.Danger]: 'bg-red-500/10 text-red-300 ring-red-500/30',
}

export function Badge({
  tone = BadgeTone.Neutral,
  icon,
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  )
}
