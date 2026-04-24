import { gqlRequest } from '@/api/graphqlClient'
import type { User, UserStatus } from '@/shared/types/models'
import { LIST_USERS } from '../graphql/users.query'
import { INVITE_USER, UPDATE_USER, RESET_USER_PASSWORD } from '../graphql/users.mutation'

interface GqlUser {
  user_id: string
  email: string
  name: string
  phone?: string
  status: UserStatus
  role: string
  department?: string
  created_at?: string
}

const ROLE_MAP: Record<string, User['role']> = {
  super_admin:    'super_admin',
  college_admin:  'college_admin',
  dept_admin:     'dept_admin',
  'dept-admin':   'dept_admin',
  'Dept Admin':   'dept_admin',
  'Super Admin':  'super_admin',
  admin:          'super_admin',
  editor:         'editor',
  viewer:         'viewer',
}

function mapUser(raw: GqlUser): User {
  return {
    id:         raw.user_id,
    name:       raw.name ?? raw.email.split('@')[0],
    email:      raw.email,
    phone:      raw.phone,
    role:       ROLE_MAP[raw.role] ?? (raw.role as User['role']),
    department: raw.department,
    status:     raw.status ?? 'active',
    createdAt:  raw.created_at ?? '',
  }
}

export const userService = {
  async getAll(): Promise<User[]> {
    const data = await gqlRequest<{ listUsers: { items: GqlUser[] } }>(LIST_USERS)
    return (data.listUsers?.items ?? []).map(mapUser)
  },

  async invite(input: {
    name: string
    email: string
    phone?: string
    password: string
    role: string
    department?: string
  }): Promise<void> {
    await gqlRequest(INVITE_USER, { input })
  },

  async update(
    userId: string,
    input: { name?: string; role?: string; department?: string; status?: UserStatus },
  ): Promise<void> {
    await gqlRequest(UPDATE_USER, { user_id: userId, input })
  },

  async setStatus(userId: string, status: 'active' | 'deactivated'): Promise<void> {
    await gqlRequest(UPDATE_USER, { user_id: userId, input: { status } })
  },

  async resetPassword(userId: string): Promise<void> {
    await gqlRequest(RESET_USER_PASSWORD, { user_id: userId })
  },

  // Legacy — kept so existing callers compile; maps to setStatus(deactivated)
  async delete(id: string): Promise<void> {
    await userService.setStatus(id, 'deactivated')
  },

  // Legacy create wrapper — kept for backward compat during migration
  async create(
    data: Omit<User, 'id' | 'createdAt'> & { password?: string },
  ): Promise<User> {
    await userService.invite({
      email:      data.email,
      name:       data.name,
      phone:      data.phone,
      role:       data.role,
      department: data.department,
      password:   (data as Omit<User, 'id' | 'createdAt'> & { password?: string }).password ?? '',
    })
    return { ...data, id: '', createdAt: new Date().toISOString() }
  },
}
