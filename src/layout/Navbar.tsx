import { Menu, Bell, Search, ChevronDown, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useNotifications } from '@/shared/context/NotificationContext'
import clsx from 'clsx'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/news': 'News Management',
  '/events': 'Events Management',
  '/gallery': 'Gallery',
  '/departments': 'Departments',
  '/committees': 'Committees',
  '/academics/faculty': 'Faculty',
  '/academics/courses': 'Courses',
  '/academics/results': 'Results',
  '/admissions/applications': 'Applications',
  '/admissions/students': 'Students',
  '/placements': 'Placements',
  '/alumni': 'Alumni',
  '/users': 'User Management',
  '/notifications': 'Notifications',
  '/audit-logs': 'Audit Logs',
  '/settings': 'Settings',
  '/profile': 'My Profile',
}

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  dept_admin:  'Dept Admin',
  admin:       'Admin',
  editor:      'Editor',
  viewer:      'Viewer',
}

const roleBadgeClass: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  dept_admin:  'bg-blue-100 text-blue-700',
  admin:       'bg-slate-100 text-slate-600',
  editor:      'bg-amber-100 text-amber-700',
  viewer:      'bg-slate-100 text-slate-500',
}

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const [profileOpen, setProfileOpen] = useState(false)
  const title = pageTitles[location.pathname] || 'BIET Admin'

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function handleProfile() {
    setProfileOpen(false)
    navigate('/profile')
  }

  function handleLogout() {
    setProfileOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 lg:px-6 h-16 flex items-center gap-4">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="hidden sm:block">
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md ml-auto sm:ml-0">
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-slate-700 leading-tight">{user.name}</div>
              <div className={clsx('text-xs font-medium px-1.5 py-0.5 rounded-full inline-block mt-0.5', roleBadgeClass[user.role])}>
                {roleLabel[user.role] ?? user.role}
                {user.role === 'dept_admin' && user.department ? ` · ${user.department}` : ''}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <span className={clsx('mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full inline-block', roleBadgeClass[user.role])}>
                    {roleLabel[user.role] ?? user.role}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleProfile}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User size={14} />
                    Profile
                  </button>
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
