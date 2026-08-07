import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ButtonSize, ButtonVariant } from '../../constants/ui'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  [ButtonVariant.Primary]: 'bg-indigo-600 text-white hover:bg-indigo-500',
  [ButtonVariant.Secondary]:
    'bg-slate-800 text-slate-200 ring-1 ring-slate-700 hover:bg-slate-700',
  [ButtonVariant.Ghost]:
    'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100',
}

const sizes: Record<ButtonSize, string> = {
  [ButtonSize.Sm]: 'h-8 gap-1.5 px-3 text-xs',
  [ButtonSize.Md]: 'h-10 gap-2 px-4 text-sm',
  [ButtonSize.Icon]: 'size-8',
}

export function Button({
  variant = ButtonVariant.Primary,
  size = ButtonSize.Md,
  icon,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
