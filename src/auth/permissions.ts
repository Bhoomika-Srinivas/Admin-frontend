// Re-export from shared/utils to maintain single source of truth
export {
  type Permission,
  can,
  isSuperAdmin,
  isDeptAdmin,
  canManageDepartment,
} from '@/shared/utils/permissions'
