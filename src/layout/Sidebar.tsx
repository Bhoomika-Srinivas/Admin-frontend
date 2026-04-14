import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Newspaper, Building2, Users,
  BookOpen, GraduationCap, Briefcase, Users2, Award,
  Settings, ChevronDown, X, Building, Bell, ShieldCheck, Medal
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { useAuth } from '../auth/AuthContext'
import { can, type Permission } from '@/shared/utils/permissions'
import bietLogo from '../assets/biet-logo.svg'

interface NavChild {
  label: string
  to: string
  permission?: Permission
}

interface NavItem {
  label: string
  icon: React.ElementType
  to?: string
  permission?: Permission
  children?: NavChild[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  {
    label: 'Site Content', icon: Newspaper,
    children: [
      { label: 'News',    to: '/news',    permission: 'content:create' },
      { label: 'Events',  to: '/events',  permission: 'content:create' },
      { label: 'Gallery', to: '/gallery', permission: 'content:create' },
    ]
  },
  { label: 'Departments', icon: Building2, to: '/departments', permission: 'manage:own_department' },
  { label: 'Committees',  icon: Users2,   to: '/committees',  permission: 'manage:committees' },
  {
    label: 'Academics', icon: BookOpen,
    children: [
      { label: 'Faculty',        to: '/academics/faculty',  permission: 'manage:own_department' },
      { label: 'Course Catalog', to: '/academics/catalog',  permission: 'manage:all_departments' },
      { label: 'Courses',        to: '/academics/courses',  permission: 'manage:own_department' },
      { label: 'Results',        to: '/academics/results',  permission: 'manage:all_departments' },
    ]
  },
  { label: 'Admissions', icon: GraduationCap, to: '/admissions', permission: 'manage:all_departments' },
  { label: 'Placements',  icon: Briefcase, to: '/placements', permission: 'manage:placements' },
  {
    label: 'Campus Life', icon: Building,
    permission: 'manage:all_departments',
    children: [
      { label: 'Clubs',  to: '/campus-life/clubs' },
      { label: 'Sports', to: '/campus-life/sports' },
    ]
  },
  {
    label: 'Facilities', icon: Building2,
    permission: 'manage:all_departments',
    children: [
      { label: 'Labs',    to: '/facilities/labs' },
      { label: 'Library', to: '/facilities/library' },
      { label: 'Hostel',  to: '/facilities/hostel' },
    ]
  },
  { label: 'Accreditation / Ranking', icon: Medal, to: '/accreditations', permission: 'manage:all_departments' },
  { label: 'Alumni', icon: Award, to: '/alumni', permission: 'manage:alumni' },
  { label: 'Users',         icon: Users,        to: '/users',          permission: 'manage:users' },
  { label: 'Notifications', icon: Bell,         to: '/notifications' },
  { label: 'Audit Logs',    icon: ShieldCheck,  to: '/audit-logs',     permission: 'manage:users' },
  { label: 'Settings',      icon: Settings,     to: '/settings',       permission: 'manage:all_departments' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

function SidebarGroup({ item, visibleChildren }: { item: NavItem; visibleChildren: NavChild[] }) {
  const location = useLocation()
  const isChildActive = visibleChildren.some(c => location.pathname.startsWith(c.to))
  const [expanded, setExpanded] = useState(isChildActive)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={clsx(
          'sidebar-link w-full justify-between',
          isChildActive
            ? 'text-brand-700 bg-brand-50 font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon size={18} />
          <span>{item.label}</span>
        </div>
        <ChevronDown size={15} className={clsx('transition-transform', expanded && 'rotate-180')} />
      </button>
      {expanded && (
        <div className="ml-7 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-3">
          {visibleChildren.map(child => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) =>
                clsx('block px-2 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'text-brand-700 font-semibold bg-brand-50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                )
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth()

  // Filter nav items based on the current user's permissions.
  const visibleItems = navItems.flatMap(item => {
    // Items with a direct route
    if (item.to) {
      if (!item.permission || can(user, item.permission)) return [item]
      return []
    }
    // Group items — filter children first
    if (item.children) {
      // If the group itself has a permission gate, check it first
      if (item.permission && !can(user, item.permission)) return []
      const visibleChildren = item.children.filter(
        child => !child.permission || can(user, child.permission)
      )
      if (visibleChildren.length === 0) return []
      return [{ ...item, children: visibleChildren }]
    }
    return [item]
  })

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-30 flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <img src={bietLogo} alt="BIET Logo" className="w-9 h-9 rounded-lg flex-shrink-0" />
          <div>
            <div className="font-display font-bold text-brand-800 text-base leading-tight">BIET Admin</div>
            <div className="text-xs text-slate-400">Management Portal</div>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {visibleItems.map(item =>
            item.to ? (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ) : (
              <SidebarGroup
                key={item.label}
                item={item}
                visibleChildren={item.children ?? []}
              />
            )
          )}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100">
          <div className="text-xs text-slate-400 text-center">BIET Admin v1.0.0</div>
        </div>
      </aside>
    </>
  )
}
