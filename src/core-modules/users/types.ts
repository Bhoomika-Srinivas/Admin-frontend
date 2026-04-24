export * from '@/shared/types/models'

import { z } from 'zod'

export const UserFormSchema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters'),
  email:      z.string().email('Must be a valid email address'),
  phone:      z.string().optional().or(z.literal('')),
  role:       z.string().min(1, 'Please select a role'),
  department: z.string().optional().or(z.literal('')),
  password:   z.string().min(8, 'Password must be at least 8 characters'),
})

export const UserEditSchema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters'),
  role:       z.string().min(1, 'Please select a role'),
  department: z.string().optional().or(z.literal('')),
})

export type UserFormData     = z.infer<typeof UserFormSchema>
export type UserEditFormData = z.infer<typeof UserEditSchema>
