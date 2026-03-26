import { createContext, useContext, useState, useEffect } from 'react'
import type { User, UserRole } from '@/shared/types/models'
import { signIn, signOut, getCurrentSession } from '@/api/cognitoClient'

interface AuthContextValue {
  user: User
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<Pick<User, 'name' | 'email' | 'avatar'>>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const PLACEHOLDER_USER: User = {
  id: '', name: '', email: '', role: 'viewer', status: 'active', createdAt: '',
}

function sessionToUser(session: import('amazon-cognito-identity-js').CognitoUserSession): User {
  const payload = session.getIdToken().payload as Record<string, unknown>

  // custom:roles is a JSON array e.g. ["admin"] or ["super_admin"]
  let role: UserRole = 'viewer'
  try {
    const roles = JSON.parse(payload['custom:roles'] as string) as string[]
    const first = roles[0]
    const roleMap: Record<string, UserRole> = {
      super_admin: 'super_admin',
      dept_admin:  'dept_admin',
      admin:       'super_admin',   // backend "admin" → frontend super_admin
      editor:      'editor',
      viewer:      'viewer',
    }
    role = roleMap[first] ?? 'viewer'
  } catch { /* leave as viewer */ }

  return {
    id: payload['sub'] as string,
    name: (payload['name'] as string) ?? (payload['email'] as string).split('@')[0],
    email: payload['email'] as string,
    role,
    department: (payload['custom:department'] ?? payload['custom:tenant_id']) as string | undefined,
    status: 'active',
    createdAt: new Date((payload['auth_time'] as number) * 1000).toISOString(),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(PLACEHOLDER_USER)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Restore session on mount
  useEffect(() => {
    getCurrentSession().then(session => {
      if (session) {
        setUser(sessionToUser(session))
        setIsAuthenticated(true)
      }
    })
  }, [])

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const session = await signIn(email, password)
      setUser(sessionToUser(session))
      setIsAuthenticated(true)
      return true
    } catch {
      return false
    }
  }

  function logout() {
    signOut()
    setIsAuthenticated(false)
    setUser(PLACEHOLDER_USER)
  }

  function updateProfile(data: Partial<Pick<User, 'name' | 'email' | 'avatar'>>) {
    setUser(prev => ({ ...prev, ...data }))
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
