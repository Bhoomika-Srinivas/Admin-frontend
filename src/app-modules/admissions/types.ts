export * from '@/shared/types/models'

import { z } from 'zod'

export const ProgramSchema = z.object({
  name:     z.string().min(1, 'Program name is required'),
  duration: z.string().min(1, 'Duration is required'),
  mode:     z.string().min(1, 'Mode is required'),
})

export const UGCourseSchema = z.object({
  name:        z.string().min(1, 'Course name is required'),
  totalIntake: z.number().min(0),
  cet:         z.number().min(0),
  comedk:      z.number().min(0),
  management:  z.number().min(0),
  snq:         z.number().min(0),
})

export const PGCourseSchema = z.object({
  name:   z.string().min(1, 'Course name is required'),
  intake: z.number().min(0),
})

export const EligibilityEntrySchema = z.object({
  title:       z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

export const AdmissionStepSchema = z.object({
  title:       z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

export const ImportantDateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date:  z.string().min(1, 'Date is required'),
})

export const ScholarshipSchema = z.object({
  category:    z.enum(['State', 'Government of India', 'Institutional', 'Others']),
  name:        z.string().min(1, 'Scholarship name is required'),
  description: z.string().optional(),
  authority:   z.string().min(1, 'Authority is required'),
})

export const ContactSchema = z.object({
  name:  z.string().min(1, 'Name is required'),
  role:  z.string().min(1, 'Role is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(1, 'Phone is required'),
})

export const EnquiryCategorySchema = z.object({
  title:       z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

export const InfoBlockSchema = z.object({
  type:        z.enum(['Phone', 'Office Hours', 'Email']),
  description: z.string().min(1, 'Description is required'),
})
