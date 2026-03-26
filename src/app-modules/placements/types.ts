// Re-export relevant types from shared types
export * from '@/shared/types/models'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

import { z } from 'zod'

export const PlacementSchema = z.object({
  company:        z.string().min(1, 'Company name is required'),
  year:           z.string().regex(/^\d{4}-\d{2}$/, 'Year must be in format YYYY-YY (e.g. 2023-24)'),
  package:        z.string().min(1, 'Package is required (e.g. 4.5 LPA)'),
  studentsPlaced: z.number({ error: 'Students placed must be a number' }).int().min(1, 'At least 1 student must be placed'),
  department:     z.string().min(1, 'Department is required'),
  roles:          z.array(z.string().min(1)).min(1, 'At least one role is required'),
})

export type PlacementFormData = z.infer<typeof PlacementSchema>
