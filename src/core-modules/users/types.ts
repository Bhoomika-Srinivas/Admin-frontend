// Re-export relevant types from shared types
export * from '@/shared/types/models'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

import { z } from 'zod'

export const UserFormSchema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters'),
  email:      z.string().email('Must be a valid email address'),
  role:       z.enum(['super_admin', 'dept_admin', 'admin', 'editor', 'viewer'], {
                error: 'Please select a role',
              }),
  department: z.string().optional(),
  status:     z.enum(['active', 'inactive'], { error: 'Please select a status' }),
  password:   z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
})

/** Use this schema on the edit form where password is optional */
export const UserEditSchema = UserFormSchema.omit({ password: true }).extend({
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
})

export type UserFormData = z.infer<typeof UserFormSchema>
export type UserEditFormData = z.infer<typeof UserEditSchema>
