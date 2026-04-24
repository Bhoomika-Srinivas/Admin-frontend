import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, UserRole } from '@/shared/types/models'
import {
  initiateSignIn,
  selectChannel as cognitoSelectChannel,
  submitOtp,
  signOut as cognitoSignOut,
  getCurrentSession,
  type LoginStep,
} from '@/api/cognitoClient'

export type { LoginStep }

interface AuthContextValue {
  user: User
  isAuthenticated: boolean
  initiateLogin:  (email: string, password: string) => Promise<LoginStep>
  selectChannel:  (channel: 'email' | 'phone')      => Promise<LoginStep>
  confirmOtp:     (otp: string)                      => Promise<LoginStep>
  logout:         () => void
  updateProfile:  (data: Partial<Pick<User, 'name' | 'email' | 'avatar'>>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const PLACEHOLDER_USER: User = {
  id: '', name: '', email: '', role: 'viewer', status: 'active', createdAt: '',
}

function payloadToUser(payload: Record<string, unknown>): User {
  // custom:roles is a JSON array e.g. ["super_admin"] or ["dept-admin"]
  let role: UserRole = 'viewer'
  try {
    const roles = JSON.parse(payload['custom:roles'] as string) as string[]
    const first = roles[0]
    const roleMap: Record<string, UserRole> = {
      super_admin:  'super_admin',
      dept_admin:   'dept_admin',
      'dept-admin': 'dept_admin',  // backend uses hyphen variant
      admin:        'super_admin', // backend "admin" → frontend super_admin
      editor:       'editor',
      viewer:       'viewer',
    }
    role = roleMap[first] ?? 'viewer'
  } catch { /* leave as viewer */ }

  // custom:permissions — injected by the pre-token-generation Lambda
  let permissions: string[] = []
  try {
    const raw = payload['custom:permissions']
    if (typeof raw === 'string') {
      permissions = JSON.parse(raw) as string[]
    }
  } catch { /* leave empty */ }

  return {
    id:         payload['sub']               as string,
    name:       (payload['name']             as string) ?? (payload['email'] as string).split('@')[0],
    email:      payload['email']             as string,
    role,
    permissions,
    tenantId:   (payload['custom:tenant_id']  as string) ?? undefined,
    department: (payload['custom:department'] as string) ?? undefined,
    status:     'active',
    createdAt:  new Date((payload['auth_time'] as number) * 1000).toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,            setUser]            = useState<User>(PLACEHOLDER_USER)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Restore session on mount — all claims come from the JWT (pre-token-gen Lambda)
  useEffect(() => {
    getCurrentSession().then(payload => {
      if (!payload) return
      setUser(payloadToUser(payload))
      setIsAuthenticated(true)
    })
  }, [])

  async function initiateLogin(email: string, password: string): Promise<LoginStep> {
    return initiateSignIn(email, password)
  }

  async function selectChannel(channel: 'email' | 'phone'): Promise<LoginStep> {
    return cognitoSelectChannel(channel)
  }

  async function confirmOtp(otp: string): Promise<LoginStep> {
    const step = await submitOtp(otp)
    if (step.type === 'done') {
      const payload = await getCurrentSession()
      if (payload) {
        setUser(payloadToUser(payload))
        setIsAuthenticated(true)
      }
    }
    return step
  }

  function logout() {
    cognitoSignOut()
    setIsAuthenticated(false)
    setUser(PLACEHOLDER_USER)
  }

  function updateProfile(data: Partial<Pick<User, 'name' | 'email' | 'avatar'>>) {
    setUser(prev => ({ ...prev, ...data }))
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, initiateLogin, selectChannel, confirmOtp, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
