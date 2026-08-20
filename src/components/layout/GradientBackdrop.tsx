/**
 * Degradado de fondo de la app. Va `fixed` para que quede anclado al viewport
 * y no se estire ni se desplace cuando la pantalla scrollea.
 */
export function GradientBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(37,99,235,0.28),transparent_55%),radial-gradient(ellipse_at_75%_85%,rgba(79,70,229,0.22),transparent_55%)]"
    />
  )
}
