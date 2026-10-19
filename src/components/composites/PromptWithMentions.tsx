import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { AtSign } from 'lucide-react'
import { useDismiss } from '../../hooks/useDismiss'
import { ASSET_ICON } from './assetIcons'
import { activeMention } from '../../utils/mentions'
import type { LabeledAsset } from '../../utils/assetLabels'

const FIELD_LAYOUT =
  'w-full whitespace-pre-wrap break-words rounded-lg border px-3 py-2 text-sm [scrollbar-gutter:stable]'

const MIRROR_CLASS = `${FIELD_LAYOUT} pointer-events-none absolute inset-0 overflow-hidden border-transparent`

export function PromptWithMentions({
  label,
  value,
  onChange,
  assets,
  rows = 6,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  assets: LabeledAsset[]
  rows?: number
  placeholder?: string
}) {
  const id = useId()
  const container = useRef<HTMLDivElement>(null)
  const textarea = useRef<HTMLTextAreaElement>(null)
  const caretMirror = useRef<HTMLDivElement>(null)
  const highlight = useRef<HTMLDivElement>(null)

  const [mention, setMention] = useState<{ at: number; query: string } | null>(
    null,
  )

  const [anchor, setAnchor] = useState({ top: 0, left: 0, visible: false })

  const close = useCallback(() => setMention(null), [])
  useDismiss(mention !== null, container, close)

  const matches = mention
    ? assets.filter((asset) =>
        asset.label.toLowerCase().startsWith(mention.query.toLowerCase()),
      )
    : []

  const measure = useCallback(() => {
    const area = textarea.current
    const marker = caretMirror.current?.querySelector('span')
    if (!area || !marker) return

    const lineTop = marker.offsetTop - area.scrollTop

    const lineHeight =
      parseFloat(getComputedStyle(area).lineHeight) || marker.offsetHeight

    setAnchor({
      top: lineTop + lineHeight,
      left: marker.offsetLeft,
      visible: lineTop >= 0 && lineTop < area.clientHeight,
    })
  }, [])

  useLayoutEffect(() => {
    if (mention) measure()
  }, [mention, value, measure])

  function syncScroll() {
    if (highlight.current && textarea.current) {
      highlight.current.scrollTop = textarea.current.scrollTop
    }
    if (mention) measure()
  }

  function refreshMention(element: HTMLTextAreaElement) {
    setMention(activeMention(element.value, element.selectionStart ?? 0))
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value)
    refreshMention(event.target)
  }

  function insert(asset: LabeledAsset) {
    if (!mention || !textarea.current) return

    const caret = textarea.current.selectionStart ?? 0
    const token = `@${asset.label}`
    const next = `${value.slice(0, mention.at)}${token} ${value.slice(caret)}`
    const cursor = mention.at + token.length + 1

    const scroll = textarea.current.scrollTop

    onChange(next)
    setMention(null)

    requestAnimationFrame(() => {
      const area = textarea.current
      if (!area) return

      area.focus({ preventScroll: true })
      area.setSelectionRange(cursor, cursor)
      area.scrollTop = scroll
      syncScroll()
    })
  }

  return (
    <div ref={container} className="relative">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium text-slate-300"
      >
        {label}
      </label>

      <div className="relative">
        <div
          ref={highlight}
          aria-hidden="true"
          className={`${MIRROR_CLASS} text-slate-200`}
        >
          {renderHighlighted(value, assets)}
        </div>

        {mention && (
          <div
            ref={caretMirror}
            aria-hidden="true"
            className={`${MIRROR_CLASS} invisible`}
          >
            {value.slice(0, mention.at)}
            <span>{value.slice(mention.at)}</span>
          </div>
        )}

        <textarea
          ref={textarea}
          id={id}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyUp={(event) => refreshMention(event.currentTarget)}
          onClick={(event) => refreshMention(event.currentTarget)}
          onScroll={syncScroll}
          className={`${FIELD_LAYOUT} relative block resize-none overflow-y-auto border-slate-800 bg-transparent text-transparent caret-slate-200 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-500/50`}
        />

        {mention && anchor.visible && (
          <ul
            className="absolute z-30 max-h-48 w-56 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl"
            style={{ top: anchor.top, left: anchor.left }}
          >
            {matches.length === 0 && (
              <li className="px-2 py-2 text-[11px] text-slate-500">
                {assets.length === 0
                  ? 'Primero agregá contenido arriba.'
                  : 'Ningún contenido con ese nombre.'}
              </li>
            )}

            {matches.map((asset) => {
              const Fallback = ASSET_ICON[asset.mediaType]
              return (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => insert(asset)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-slate-800"
                  >
                    {asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.label}
                        className="size-7 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <span className="flex size-7 shrink-0 items-center justify-center rounded bg-slate-800 text-slate-500">
                        <Fallback className="size-3.5" />
                      </span>
                    )}
                    <span className="truncate font-mono text-xs text-slate-200">
                      @{asset.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-600">
        <AtSign className="size-3" />
        Escribí <span className="font-mono text-slate-500">@</span> para
        referirte a un contenido por su posición.
      </p>
    </div>
  )
}

function renderHighlighted(text: string, assets: LabeledAsset[]) {
  if (assets.length === 0) return text

  const labels = assets
    .map((asset) => asset.label)
    .sort((a, b) => b.length - a.length)
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  const parts = text.split(new RegExp(`(@(?:${labels.join('|')}))`, 'g'))

  return parts.map((part, index) =>
    part.startsWith('@') && assets.some((a) => `@${a.label}` === part) ? (
      <mark key={index} className="rounded bg-lime-400/20 text-lime-300">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}
