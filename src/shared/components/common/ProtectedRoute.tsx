import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { can, type Permission } from '@/shared/utils/permissions'

interface ProtectedRouteProps {
  permission: Permission
  children: React.ReactNode
  /** Where to redirect if access is denied. Defaults to "/". */
  redirectTo?: string
}

/**
 * Wraps a route element and redirects to `redirectTo` when the current user
 * does not hold the required permission.
 */
export default function ProtectedRoute({
  permission,
  children,
  redirectTo = '/',
}: ProtectedRouteProps) {
  const { user } = useAuth()
  if (!can(user, permission)) return <Navigate to={redirectTo} replace />
  return <>{children}</>
}
