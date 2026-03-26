// Re-export relevant types from shared types
export * from '@/shared/types/models'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

import { z } from 'zod'

export const CourseSchema = z.object({
  name:        z.string().min(2, 'Course name must be at least 2 characters'),
  code:        z.string().min(2, 'Course code is required').max(10, 'Course code must be 10 characters or fewer'),
  program:     z.string().min(1, 'Program is required'),
  department:  z.string().min(1, 'Department is required'),
  semester:    z.string().min(1, 'Semester is required'),
  credits:     z.number({ error: 'Credits must be a number' }).int().min(1, 'Credits must be at least 1').max(10, 'Credits seem too high'),
  description: z.string().min(10, 'Description must be at least 10 characters').optional().or(z.literal('')),
})

export const BatchSchema = z
  .object({
    name:        z.string().min(2, 'Batch name is required'),
    program:     z.string().min(1, 'Program is required'),
    department:  z.string().min(1, 'Department is required'),
    startYear:   z.number({ error: 'Start year must be a number' }).int().min(2000).max(new Date().getFullYear() + 1),
    endYear:     z.number({ error: 'End year must be a number' }).int().min(2000).max(new Date().getFullYear() + 10),
    maxStudents: z.number({ error: 'Max students must be a number' }).int().min(1, 'Must have at least 1 student'),
  })
  .refine(d => d.endYear > d.startYear, {
    message: 'End year must be after start year',
    path: ['endYear'],
  })

export type CourseFormData = z.infer<typeof CourseSchema>
export type BatchFormData  = z.infer<typeof BatchSchema>
