import { useState } from 'react'
import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { Menu, X, Award, LogOut, User, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import AlumniSideNav from '@/app-modules/alumni/components/AlumniSideNav'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import clsx from 'clsx'
import bietLogo from '@/assets/biet-logo.svg'

// ── Workspace Top Bar ─────────────────────────────────────────────────────────

function WorkspaceTopBar({ onMenuClick, sidebarOpen }: { onMenuClick: () => void; sidebarOpen: boolean }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center px-4 gap-3 z-20">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline font-medium">Dashboard</span>
      </button>

      <span className="text-slate-200 select-none hidden sm:inline">/</span>

      {/* Logo and Title */}
      <div className="flex items-center gap-2 flex-1">
        <img src={bietLogo} alt="BIET" className="h-6 w-6" />
        <div className="flex items-center gap-1.5">
          <Award size={16} className="text-brand-600" />
          <h1 className="text-sm font-semibold text-slate-800">Alumni Management</h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile sidebar toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
              {initials}
            </span>
            <span className="hidden md:block text-sm font-medium text-slate-700">{user.name.split(' ')[0]}</span>
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-card border border-slate-100 py-1 z-20">
                <button
                  onClick={() => { setUserMenuOpen(false); window.location.href = '/profile' }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <User size={14} className="text-slate-400" />
                  My Profile
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

// ── Workspace Layout ──────────────────────────────────────────────────────────

export default function AlumniWorkspaceLayout() {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <WorkspaceTopBar
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(o => !o)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Alumni sidebar */}
        <aside
          className={clsx(
            'bg-white border-r border-slate-200 shrink-0 overflow-y-auto transition-transform',
            'lg:flex lg:w-56 lg:flex-col',
            sidebarOpen
              ? 'flex flex-col w-64 fixed inset-y-0 left-0 z-40 shadow-xl top-14'
              : 'hidden',
          )}
        >
          <div className="p-2 pt-3">
            <AlumniSideNav />
          </div>
        </aside>

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
