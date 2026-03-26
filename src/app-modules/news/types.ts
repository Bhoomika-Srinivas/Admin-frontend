export * from '@/shared/types/models'

import { z } from 'zod'

export const NewsSchema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters'),
  date:        z.string().min(1, 'Date is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

export type NewsFormData = z.infer<typeof NewsSchema>
