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

// ─── Alumni Events ────────────────────────────────────────────────────────────

export const AlumniEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(['published', 'draft']),
})

export type AlumniEventFormData = z.infer<typeof AlumniEventSchema>

// ─── Timeline Entry ───────────────────────────────────────────────────────────

export const TimelineEntrySchema = z.object({
  year: z.string().min(1, 'Year is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
})

export type TimelineEntryFormData = z.infer<typeof TimelineEntrySchema>

// ─── Vision / Mission / Objectives ─────────────────────────────────────────────

export const VisionMissionSchema = z.object({
  vision: z.array(z.string().min(1)).min(1, 'At least one vision point is required'),
  mission: z.array(z.string().min(1)).min(1, 'At least one mission point is required'),
  objectives: z.array(z.string().min(1)).min(1, 'At least one objective is required'),
})

export type VisionMissionFormData = z.infer<typeof VisionMissionSchema>

// ─── Executive Committee Member ───────────────────────────────────────────────

export const CommitteeMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  roleType: z.enum(['PRESIDENT', 'SECRETARY', 'TREASURER', 'MEMBER']),
  designation: z.string().min(1, 'Designation is required'),
  department: z.string().optional(),
  organization: z.string().optional(),
  order: z.number().default(0),
})

export type CommitteeMemberFormData = z.infer<typeof CommitteeMemberSchema>

// ─── Dean Message ────────────────────────────────────────────────────────────

export const DeanMessageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  message: z.string().min(1, 'Message is required'),
  isActive: z.boolean().default(true),
})

export type DeanMessageFormData = z.infer<typeof DeanMessageSchema>

// ─── Alumni Coordinators ───────────────────────────────────────────────────────

export const CoordinatorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  roleType: z.enum(['DEAN', 'COORDINATOR']),
  department: z.string().min(1, 'Department is required'),
  email: z.string().email('Valid email required').optional().nullable(),
  isActive: z.boolean().default(true),
})

export type CoordinatorFormData = z.infer<typeof CoordinatorSchema>

// ─── Distinguished Alumni ──────────────────────────────────────────────────────

export const DistinguishedAlumniSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  department: z.string().min(1, 'Department is required'),
  batchYear: z.number().min(1950).max(new Date().getFullYear(), 'Invalid batch year'),
  currentRole: z.string().min(1, 'Current role is required'),
  company: z.string().min(1, 'Company is required'),
  linkedinUrl: z.string().url('Valid LinkedIn URL required').optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export type DistinguishedAlumniFormData = z.infer<typeof DistinguishedAlumniSchema>

// ─── Registration Settings ─────────────────────────────────────────────────────

export const RegistrationSettingsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  registrationLink: z.string().url('Valid URL required'),
})

export type RegistrationSettingsFormData = z.infer<typeof RegistrationSettingsSchema>

// ─── Contact Info ──────────────────────────────────────────────────────────────

export const AlumniContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  roleType: z.enum(['DEAN_ALUMNI', 'DEAN_PR']),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  email: z.string().email('Valid email required'),
})

export type AlumniContactFormData = z.infer<typeof AlumniContactSchema>
