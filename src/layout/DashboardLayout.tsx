import { useState, useEffect } from 'react'
import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useAuth } from '../auth/AuthContext'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import { departmentService } from '@/app-modules/departments/api/departmentsApi'

export default function DashboardLayout() {
  const { isAuthenticated, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  // Dept admins live entirely inside their department workspace — redirect them there
  useEffect(() => {
    if (!isAuthenticated || user.role !== 'dept_admin' || !user.department) return

    let cancelled = false

    departmentService.getAll(user.tenantId ?? '').then(depts => {
      if (cancelled) return
      const userDept = user.department?.toLowerCase()
      const dept = depts.find(
        d => d.shortName.toLowerCase() === userDept || d.id.toLowerCase() === userDept,
      )
      if (dept) navigate(`/departments/${dept.id}`, { replace: true })
    })

    return () => { cancelled = true }
  }, [isAuthenticated, user.role, user.department, navigate])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user.role === 'dept_admin') return <Navigate to="/departments" replace />

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
