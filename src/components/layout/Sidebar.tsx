import { NavLink } from 'react-router-dom'
import type { ComponentType, ReactNode } from 'react'

export type SidebarItem = {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
}

type SidebarProps = {
  title: string
  subtitle: string
  logo: ReactNode
  items: SidebarItem[]
  footerItems?: SidebarItem[]
  /** Se renderiza arriba de la navegación (ej. botón "New Job"). */
  action?: ReactNode
}

export function Sidebar({
  title,
  subtitle,
  logo,
  items,
  footerItems = [],
  action,
}: SidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-slate-800 text-indigo-400">
          {logo}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">{title}</p>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
      </div>

      {action && <div className="mt-5">{action}</div>}

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>

      {footerItems.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-slate-800 pt-3">
          {footerItems.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </div>
      )}
    </aside>
  )
}

function SidebarLink({ item }: { item: SidebarItem }) {
  const { icon: Icon, label, to } = item

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-indigo-600/15 text-indigo-300'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`
      }
    >
      <Icon className="size-4" />
      {label}
    </NavLink>
  )
}
