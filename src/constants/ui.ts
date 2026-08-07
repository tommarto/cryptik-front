/**
 * Enums de los componentes de `components/ui`. Viven acá y no junto al
 * componente porque exportar un valor no-componente desde un archivo de
 * componente rompe Fast Refresh (regla `react-refresh/only-export-components`).
 */

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Ghost = 'ghost',
}

export enum ButtonSize {
  Sm = 'sm',
  Md = 'md',
  Icon = 'icon',
}

export enum BadgeTone {
  Neutral = 'neutral',
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger',
}

export enum AlertVariant {
  Error = 'error',
  Info = 'info',
}

export enum DropzoneVariant {
  /** Área grande punteada, para el archivo principal. */
  Area = 'area',
  /** Fila de una línea, para campos secundarios. */
  Compact = 'compact',
}
