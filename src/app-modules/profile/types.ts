// Re-export relevant types from shared types
export * from '@/shared/types/models'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

import { z } from 'zod'

export const ProfileSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Must be a valid email address'),
})

export type ProfileFormData = z.infer<typeof ProfileSchema>
