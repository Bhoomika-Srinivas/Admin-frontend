import { createContext, useContext } from 'react'
import type { Department } from '@/shared/types/models'

export const DepartmentContext = createContext<Department | null>(null)

export function useDeptContext(): Department {
  const dept = useContext(DepartmentContext)
  if (!dept) throw new Error('useDeptContext must be used inside DepartmentWorkspaceLayout')
  return dept
}
