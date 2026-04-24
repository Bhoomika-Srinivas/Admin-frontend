import { NavLink, useLocation } from 'react-router-dom'
import { Settings2, Building2, Users, Shield, ShieldCheck, ToggleLeft, GraduationCap } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { label: 'Platform Settings',  to: '/settings',           icon: Settings2,     end: true },
  { label: 'College Profile',    to: '/settings/profile',   icon: GraduationCap },
  { label: 'College Management', to: '/settings/colleges',  icon: Building2 },
  { label: 'Users & Roles',      to: '/settings/users',     icon: Users },
  { label: 'Auth Settings',      to: '/settings/auth',      icon: Shield },
  { label: 'Audit Logs',         to: '/settings/audit',     icon: ShieldCheck },
  { label: 'Feature Flags',      to: '/settings/features',  icon: ToggleLeft },
]

export default function SettingsNav() {
  const location = useLocation()

  return (
    <nav className="space-y-0.5">
      {navItems.map(item => {
        const isActive = item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <item.icon
              size={18}
              className={clsx('shrink-0', isActive ? 'text-brand-600' : 'text-slate-400')}
            />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
