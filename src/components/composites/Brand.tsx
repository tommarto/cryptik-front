import type { ComponentType } from 'react'
import { BrandOrientation } from '../../constants/ui'

type BrandProps = {
  name: string
  tagline: string
  orientation?: BrandOrientation
  /**
   * Logo como imagen. Se compone con `mix-blend-mode: screen`, así que espera
   * arte luminoso sobre fondo negro — el negro desaparece y el glow se suma al
   * fondo, sin necesidad de recortar la transparencia. Requiere fondo oscuro.
   *
   * El `contrast` previo aplasta a negro puro los grises que deja la compresión
   * JPEG: `screen` solo cancela el píxel exacto `#000`, y sin esto el archivo
   * deja un recuadro más claro que el fondo.
   */
  imageSrc?: string
  /** Alternativa a `imageSrc`: un icono de lucide. */
  icon?: ComponentType<{ className?: string }>
}

export function Brand({
  name,
  tagline,
  orientation = BrandOrientation.Vertical,
  imageSrc,
  icon: Icon,
}: BrandProps) {
  const vertical = orientation === BrandOrientation.Vertical

  return (
    <div
      className={
        vertical
          ? 'flex flex-col items-center text-center'
          : 'flex items-center gap-3'
      }
    >
      {imageSrc ? (
        <div
          className={`overflow-hidden bg-black ring-1 ring-sky-400/50 ${
            vertical
              ? 'size-12 rounded-xl shadow-[0_0_12px_0px] shadow-sky-500/70'
              : 'size-9 rounded-lg shadow-[0_0_9px_0px] shadow-sky-500/60'
          }`}
        >
          {/* El arte tiene mucho margen negro alrededor del cerebro; el scale
              lo recorta contra el overflow-hidden del marco. */}
          <img
            src={imageSrc}
            alt=""
            className="size-full scale-[1.65] brightness-105 contrast-[1.4] mix-blend-screen"
          />
        </div>
      ) : (
        Icon && (
          <div
            className={`flex items-center justify-center rounded-xl bg-slate-800 ${
              vertical ? 'size-14' : 'size-9'
            }`}
          >
            <Icon
              className={`text-indigo-400 ${vertical ? 'size-7' : 'size-5'}`}
            />
          </div>
        )
      )}

      <div className={vertical ? 'mt-4' : ''}>
        <p
          className={`font-bold text-slate-50 ${
            vertical ? 'text-xl' : 'text-sm'
          }`}
        >
          {name}
        </p>
        <p
          className={`text-slate-500 ${
            vertical ? 'mt-1 text-xs' : 'text-[11px]'
          }`}
        >
          {tagline}
        </p>
      </div>
    </div>
  )
}
