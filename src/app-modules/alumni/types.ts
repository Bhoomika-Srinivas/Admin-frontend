// Re-export relevant types from shared types
export * from '@/shared/types/models'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

import { z } from 'zod'

export const AlumniSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  batch:       z.string().min(4, 'Batch is required (e.g. 2018-22)'),
  department:  z.string().min(1, 'Department is required'),
  company:     z.string().min(1, 'Company name is required'),
  designation: z.string().min(1, 'Designation is required'),
  location:    z.string().min(1, 'Location is required'),
  email:       z.string().email('Must be a valid email address').optional().or(z.literal('')),
  linkedin:    z.string().url('Must be a valid LinkedIn URL').optional().or(z.literal('')),
})

export type AlumniFormData = z.infer<typeof AlumniSchema>
