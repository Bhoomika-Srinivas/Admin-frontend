export * from '@/shared/types/models'

import { z } from 'zod'

// ─── Role & Permission types ──────────────────────────────────────────────────

// Permissions are stored as plain strings in the format: "module:action:scope"
// e.g. "alumni:read:all", "events:create:dept", "faculty:update:own"
export type RolePermission = string

export interface Role {
  id: string
  name: string
  displayName: string
  permissions: string[]
}

// ─── Settings types ───────────────────────────────────────────────────────────

export interface SystemSetting {
  key: string
  value: string
  category: 'security' | 'operational'
  sensitivity: 'high' | 'low'
  updatedBy?: string
  updatedAt?: string
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

export const SecuritySettingsSchema = z.object({
  mfa_enabled:                z.boolean(),
  otp_type:                   z.enum(['sms', 'email', 'totp']),
  password_min_length:        z.number().min(8).max(32),
  password_require_uppercase: z.boolean(),
  password_require_special:   z.boolean(),
  session_timeout_minutes:    z.number().min(5).max(1440),
  max_login_attempts:         z.number().min(3).max(10),
})

export type SecuritySettingsFormData = z.infer<typeof SecuritySettingsSchema>

export const AssignPermissionsSchema = z.object({
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
})

export type AssignPermissionsFormData = z.infer<typeof AssignPermissionsSchema>

// ─── Platform Settings ────────────────────────────────────────────────────────

export const PlatformSettingsSchema = z.object({
  platform_name:     z.string().min(1, 'Platform name is required').max(100),
  default_timezone:  z.string().min(1, 'Timezone is required'),
  default_language:  z.string().min(1, 'Language is required'),
  platform_logo_url: z.string(),
})

export type PlatformSettingsFormData = z.infer<typeof PlatformSettingsSchema>

// ─── College Profile ──────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()

export const CollegeProfileSchema = z.object({
  logo_url:             z.string().optional(),
  name:                 z.string().optional(),
  shortName:            z.string().optional(),
  established:          z.union([
    z.number().int().min(1800).max(CURRENT_YEAR),
    z.literal('').transform(() => undefined),
  ]).optional(),
  affiliatedUniversity: z.string().optional(),
  collegeType:          z.string().optional(),
  address:              z.string().optional(),
  city:                 z.string().optional(),
  state:                z.string().optional(),
  pincode:              z.string().optional(),
  phone:                z.string().optional(),
  email:                z.union([
    z.literal(''),
    z.string().email('Invalid email address'),
  ]).optional(),
  website:              z.union([
    z.literal(''),
    z.string().url('Must be a valid URL (include https://)'),
  ]).optional(),
})

export type CollegeProfileFormData = z.infer<typeof CollegeProfileSchema>

// ─── College ──────────────────────────────────────────────────────────────────

export const CollegeFormSchema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters').max(200),
  shortCode:  z.string().min(2, 'Short code must be at least 2 characters').max(10).regex(/^[A-Z0-9]+$/, 'Short code must be uppercase alphanumeric'),
  adminEmail: z.string().email('Invalid email address'),
})

export type CollegeFormData = z.infer<typeof CollegeFormSchema>
