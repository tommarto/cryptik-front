import { useId, type TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
}

export function Textarea({
  label,
  error,
  className = '',
  ...props
}: TextareaProps) {
  const id = useId()

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium text-slate-300"
      >
        {label}
      </label>

      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-lg border bg-slate-950/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-0 ${
          error
            ? 'border-red-500/50 focus:outline-red-500/50'
            : 'border-slate-800 focus:outline-indigo-500/50'
        } ${className}`}
        {...props}
      />

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}
