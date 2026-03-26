// Re-export relevant types from shared types
export * from '@/shared/types/models'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

import { z } from 'zod'

export const CommitteeSchema = z.object({
  name:        z.string().min(3, 'Committee name must be at least 3 characters'),
  type:        z.enum(['academic', 'administrative', 'student', 'research'], {
                 error: 'Please select a committee type',
               }),
  chairperson: z.string().min(2, 'Chairperson name is required'),
  members:     z.array(z.string().min(1)).min(1, 'At least one member is required'),
  status:      z.enum(['active', 'inactive', 'draft', 'published', 'archived'], {
                 error: 'Please select a status',
               }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

export type CommitteeFormData = z.infer<typeof CommitteeSchema>
