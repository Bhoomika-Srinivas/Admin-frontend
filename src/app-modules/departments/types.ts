// Re-export relevant types from shared types
export * from '@/shared/types/models'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

import { z } from 'zod'

export const DepartmentSchema = z.object({
  name:          z.string().min(2, 'Department name must be at least 2 characters'),
  shortName:     z.string().min(2, 'Short name must be at least 2 characters').max(10, 'Short name must be 10 characters or fewer').toUpperCase(),
  hod:           z.string().min(2, 'HOD name is required'),
  established:   z.number({ error: 'Established year must be a number' }).int().min(1800, 'Year seems too old').max(new Date().getFullYear(), 'Year cannot be in the future'),
  totalFaculty:  z.number({ error: 'Faculty count must be a number' }).int().min(0, 'Cannot be negative'),
  totalStudents: z.number({ error: 'Student count must be a number' }).int().min(0, 'Cannot be negative'),
  status:        z.enum(['active', 'inactive', 'draft', 'published', 'archived'], {
                   error: 'Please select a status',
                 }),
  description:   z.string().min(10, 'Description must be at least 10 characters'),
})

export type DepartmentFormData = z.infer<typeof DepartmentSchema>
