// Re-export relevant types from shared types
export * from '@/shared/types/models'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

import { z } from 'zod'

export const FacultySchema = z.object({
  name:           z.string().min(2, 'Name must be at least 2 characters'),
  designation:    z.enum(['Professor', 'Associate Professor', 'Assistant Professor', 'HOD', 'Principal'], {
                    error: 'Please select a designation',
                  }),
  department:     z.string().min(1, 'Department is required'),
  qualification:  z.string().min(2, 'Qualification is required'),
  experience:     z.number({ error: 'Experience must be a number' }).min(0, 'Experience cannot be negative').max(60, 'Experience seems too high'),
  email:          z.string().email('Must be a valid email address'),
  phone:          z.string().regex(/^\+?[0-9\s-]{7,15}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  specialization: z.string().min(2, 'Specialization is required'),
  officeLocation: z.string().optional(),
})

export const PublicationSchema = z.object({
  title:   z.string().min(3, 'Title must be at least 3 characters'),
  journal: z.string().min(2, 'Journal / conference name is required'),
  year:    z.number({ error: 'Year must be a number' }).int().min(1950, 'Year seems too old').max(new Date().getFullYear(), 'Year cannot be in the future'),
  authors: z.string().min(2, 'Authors are required'),
  doi:     z.string().optional(),
  type:    z.enum(['journal', 'conference', 'book'], { error: 'Please select a type' }),
})

export const EducationSchema = z.object({
  degree:         z.string().min(2, 'Degree is required'),
  institution:    z.string().min(2, 'Institution is required'),
  year:           z.number({ error: 'Year must be a number' }).int().min(1950, 'Year seems too old').max(new Date().getFullYear(), 'Year cannot be in the future'),
  specialization: z.string().optional(),
})

export const WorkExperienceSchema = z
  .object({
    position:    z.string().min(2, 'Position is required'),
    institution: z.string().min(2, 'Institution is required'),
    startYear:   z.number({ error: 'Start year must be a number' }).int().min(1950).max(new Date().getFullYear()),
    endYear:     z.number({ error: 'End year must be a number' }).int().min(1950).max(new Date().getFullYear() + 1).optional(),
    description: z.string().optional(),
  })
  .refine(d => !d.endYear || d.endYear >= d.startYear, {
    message: 'End year must be on or after start year',
    path: ['endYear'],
  })

export const ResearchProjectSchema = z
  .object({
    title:         z.string().min(3, 'Title must be at least 3 characters'),
    fundingAgency: z.string().min(2, 'Funding agency is required'),
    amount:        z.string().optional(),
    startYear:     z.number({ error: 'Start year must be a number' }).int().min(1950).max(new Date().getFullYear()),
    endYear:       z.number({ error: 'End year must be a number' }).int().min(1950).max(new Date().getFullYear() + 5).optional(),
    status:        z.enum(['ongoing', 'completed'], { error: 'Please select a status' }),
  })
  .refine(d => !d.endYear || d.endYear >= d.startYear, {
    message: 'End year must be on or after start year',
    path: ['endYear'],
  })

export const CourseTeachingSchema = z.object({
  courseName:   z.string().min(2, 'Course name is required'),
  semester:     z.string().min(1, 'Semester is required'),
  program:      z.string().min(1, 'Program is required'),
  academicYear: z.string().min(4, 'Academic year is required (e.g. 2024-25)'),
})

export const HonorSchema = z.object({
  title:        z.string().min(3, 'Title must be at least 3 characters'),
  organization: z.string().min(2, 'Issuing organization is required'),
  year:         z.number({ error: 'Year must be a number' }).int().min(1950, 'Year seems too old').max(new Date().getFullYear(), 'Year cannot be in the future'),
  description:  z.string().optional(),
})

export type FacultyFormData         = z.infer<typeof FacultySchema>
export type PublicationFormData     = z.infer<typeof PublicationSchema>
export type EducationFormData       = z.infer<typeof EducationSchema>
export type WorkExperienceFormData  = z.infer<typeof WorkExperienceSchema>
export type ResearchProjectFormData = z.infer<typeof ResearchProjectSchema>
export type CourseTeachingFormData  = z.infer<typeof CourseTeachingSchema>
export type HonorFormData           = z.infer<typeof HonorSchema>
