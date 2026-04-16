import { useEffect, useState } from 'react'
import { Outlet, useParams, useNavigate, Navigate } from 'react-router-dom'
import { ChevronLeft, Menu, X, LogOut, User } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { departmentService } from '@/app-modules/departments/api/departmentsApi'
import type { Department } from '@/shared/types/models'
import { DepartmentContext } from '@/app-modules/departments/context/DepartmentContext'
import DepartmentSideNav from '@/app-modules/departments/components/DepartmentSideNav'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import bietLogo from '@/assets/biet-logo.svg'
import clsx from 'clsx'

// ── Workspace Top Bar ─────────────────────────────────────────────────────────

function WorkspaceTopBar({ dept, onMenuClick, sidebarOpen }: { dept: Department; onMenuClick: () => void; sidebarOpen: boolean }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const isDeptAdmin = user.role === 'dept_admin'
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center px-4 gap-3 z-20">
      {/* Back button — hidden for dept_admin (they have no admin dashboard) */}
      {!isDeptAdmin && (
        <>
          <button
            onClick={() => navigate('/departments')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline font-medium">Departments</span>
          </button>
          <span className="text-slate-200 select-none hidden sm:inline">/</span>
        </>
      )}

      {/* Logo — compact */}
      <img src={bietLogo} alt="BIET" className="h-6 w-6 hidden sm:block" />

      {/* Dept identity */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-600 text-white font-bold text-xs font-display shrink-0">
          {dept.shortName}
        </span>
        <div className="min-w-0 hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{dept.name}</p>
          <p className="text-xs text-slate-400 leading-tight truncate">Est. {dept.established} · HOD: {dept.hod}</p>
        </div>
        <p className="text-sm font-semibold text-slate-800 sm:hidden truncate">{dept.name}</p>
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
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
              : (
                <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </span>
              )
            }
            <span className="hidden md:block text-sm font-medium text-slate-700">{user.name.split(' ')[0]}</span>
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-card border border-slate-100 py-1 z-20">
                <button
                  onClick={() => { setUserMenuOpen(false); navigate('/profile') }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <User size={14} className="text-slate-400" />
                  My Profile
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={handleLogout}
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

export default function DepartmentWorkspaceLayout() {
  const { isAuthenticated, user } = useAuth()
  const { deptId } = useParams<{ deptId: string }>()
  const [dept, setDept] = useState<Department | null | undefined>(undefined)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!deptId) return
    departmentService.getById(deptId, user.tenantId ?? '').then(result => setDept(result ?? null))
  }, [deptId, user.tenantId])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (dept === null) return <Navigate to="/departments" replace />
  if (dept === undefined) return null

  return (
    <DepartmentContext.Provider value={dept}>
      <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
        <WorkspaceTopBar
          dept={dept}
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(o => !o)}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Department sidebar */}
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
              <DepartmentSideNav />
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
    </DepartmentContext.Provider>
  )
}
