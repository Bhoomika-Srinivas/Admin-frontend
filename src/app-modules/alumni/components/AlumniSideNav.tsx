import { NavLink, useLocation } from 'react-router-dom'
import {
  Calendar,
  History,
  Info,
  Users,
  Star,
  UserCog,
  Contact,
  LayoutDashboard,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', to: '/alumni', icon: LayoutDashboard, end: true },
  { label: 'Events', to: '/alumni/events', icon: Calendar },
  { label: 'Timeline / History', to: '/alumni/timeline', icon: History },
  { label: 'About', to: '/alumni/about', icon: Info },
  { label: 'Executive Committee', to: '/alumni/committee', icon: Users },
  { label: 'Distinguished Alumni', to: '/alumni/distinguished', icon: Star },
  { label: 'Coordinators', to: '/alumni/coordinators', icon: UserCog },
  { label: 'Contact Info', to: '/alumni/contact', icon: Contact },
]

export default function AlumniSideNav() {
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
            <item.icon size={18} className={clsx('shrink-0', isActive ? 'text-brand-600' : 'text-slate-400')} />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
