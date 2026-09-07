import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'

export type SidebarItem = {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
}

type SidebarProps = {
  brand: ReactNode
  /** Versión reducida de la marca, para cuando está colapsada. */
  brandCollapsed: ReactNode
  items: SidebarItem[]
  footer?: ReactNode
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({
  brand,
  brandCollapsed,
  items,
  footer,
  collapsed,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      // `sticky` + `h-screen`: la barra se queda en el viewport en vez de
      // estirarse con la página. Sin esto, su footer termina al fondo del
      // contenido, fuera de la vista.
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-800 bg-slate-900/40 transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-4 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {collapsed ? brandCollapsed : brand}

        {!collapsed && (
          <ToggleButton collapsed={collapsed} onToggle={onToggle} />
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center pb-2">
          <ToggleButton collapsed={collapsed} onToggle={onToggle} />
        </div>
      )}

      {/* `min-h-0` es lo que permite que scrollee: sin eso un hijo de flex no
          se achica por debajo de su contenido, y la lista empujaría el footer
          fuera de la pantalla en vez de desbordar acá adentro. */}
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3">
        {items.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {footer && (
        <div className="border-t border-slate-800 p-3">{footer}</div>
      )}
    </aside>
  )
}

function ToggleButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
    >
      <Icon className="size-4" />
    </button>
  )
}

function SidebarLink({
  item,
  collapsed,
}: {
  item: SidebarItem
  collapsed: boolean
}) {
  const { icon: Icon, label, to } = item

  return (
    <NavLink
      to={to}
      // Colapsada, el label desaparece y el tooltip nativo lo reemplaza.
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg py-2 text-sm transition-colors ${
          collapsed ? 'justify-center px-2' : 'px-3'
        } ${
          isActive
            ? 'bg-indigo-600/15 text-indigo-300'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`
      }
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}
