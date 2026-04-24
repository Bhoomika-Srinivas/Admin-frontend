import { gqlRequest } from '@/api/graphqlClient'
import type { Role } from '../types'
import { LIST_ROLES, LIST_ALL_PERMISSIONS } from '../graphql/roles.query'
import { SET_ROLE_PERMISSIONS } from '../graphql/roles.mutation'

interface GqlRole {
  role_id: string
  name: string
  permissions: string[]
}

const DISPLAY_NAMES: Record<string, string> = {
  super_admin: 'Super Admin',
  dept_admin:  'Department Admin',
}

function mapRole(raw: GqlRole): Role {
  return {
    id:          raw.role_id,
    name:        raw.name,
    displayName: DISPLAY_NAMES[raw.name] ?? raw.name,
    permissions: raw.permissions ?? [],
  }
}

export const rolesService = {
  async getAll(): Promise<Role[]> {
    const data = await gqlRequest<{ listRoles: GqlRole[] }>(LIST_ROLES)
    return (data.listRoles ?? []).map(mapRole)
  },

  // Replace all permissions for a role in one call
  async setPermissions(roleId: string, permissions: string[]): Promise<void> {
    await gqlRequest(SET_ROLE_PERMISSIONS, { role_id: roleId, permissions })
  },

  // Fetch every possible permission string seeded in the system
  async getAllPermissions(): Promise<string[]> {
    const data = await gqlRequest<{ listAllPermissions: string[] }>(LIST_ALL_PERMISSIONS)
    return data.listAllPermissions ?? []
  },
}
