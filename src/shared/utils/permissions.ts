import type { User } from '@/shared/types/models'

// ─── Permission Tokens ────────────────────────────────────────────────────────

export type Permission =
  | 'manage:users'
  | 'manage:all_departments'
  | 'manage:own_department'
  | 'manage:committees'
  | 'manage:placements'
  | 'manage:alumni'
  | 'content:create'
  | 'content:edit'
  | 'content:delete'
  | 'events:approve'

// ─── Role → Permission map ─────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [
    'manage:users',
    'manage:all_departments',
    'manage:own_department',
    'manage:committees',
    'manage:placements',
    'manage:alumni',
    'content:create',
    'content:edit',
    'content:delete',
    'events:approve',
  ],
  dept_admin: [
    'manage:own_department',
    'content:create',
    'content:edit',
    'content:delete',
  ],
  // Legacy roles — read/edit only, no management
  admin: ['content:create', 'content:edit'],
  editor: ['content:create', 'content:edit'],
  viewer: [],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if the given user holds the specified permission. */
export function can(user: User, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[user.role] ?? []
  return perms.includes(permission)
}

export const isSuperAdmin = (user: User) => user.role === 'super_admin'
export const isDeptAdmin  = (user: User) => user.role === 'dept_admin'

/**
 * Returns true when the user is allowed to manage the given department.
 * Super admins manage all departments; dept admins only their own.
 * `departmentKey` should be the department shortName (e.g. "CSE").
 */
export function canManageDepartment(user: User, departmentKey: string): boolean {
  if (isSuperAdmin(user)) return true
  if (isDeptAdmin(user))  return user.department === departmentKey
  return false
}
