import { useState, useEffect, useRef } from 'react'
import {
  Save, Building2, MapPin, Phone, Globe, Upload, X, AlertTriangle,
} from 'lucide-react'
import { useCollegeProfile } from '../hooks/useCollegeProfile'
import { collegeProfileService } from '../api/collegeProfileApi'
import { CollegeProfileSchema, type CollegeProfileFormData } from '../types'
import { useToast } from '@/shared/context/ToastContext'
import { useAuth } from '@/auth/AuthContext'
import { gqlRequest } from '@/api/graphqlClient'
import { GET_UPLOAD_URL } from '@/app-modules/departments/graphql/deptInfo.mutation'
import FormField from '@/shared/components/forms/FormField'

// ── College type options ───────────────────────────────────────────────────────

const COLLEGE_TYPE_OPTIONS = [
  { value: '',           label: 'Select type…' },
  { value: 'autonomous', label: 'Autonomous' },
  { value: 'affiliated', label: 'Affiliated' },
  { value: 'deemed',     label: 'Deemed University' },
  { value: 'government', label: 'Government' },
  { value: 'private',    label: 'Private' },
]

// ── Section card ───────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon, title, description, children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-brand-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}

// ── Page ───────────────────────────────────────────────────────────────────────

type FormErrors = Partial<Record<keyof CollegeProfileFormData, string>>

const EMPTY_FORM: CollegeProfileFormData = {
  logo_url:             '',
  name:                 '',
  shortName:            '',
  established:          undefined,
  affiliatedUniversity: '',
  collegeType:          '',
  address:              '',
  city:                 '',
  state:                '',
  pincode:              '',
  phone:                '',
  email:                '',
  website:              '',
}

export default function CollegeProfilePage() {
  const toast = useToast()
  const { user } = useAuth()
  const { profile, loading, error, reload } = useCollegeProfile()

  const [form,      setForm]      = useState<CollegeProfileFormData>(EMPTY_FORM)
  const [errors,    setErrors]    = useState<FormErrors>({})
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Pre-fill form when profile loads
  useEffect(() => {
    if (loading || !profile) return
    setForm({
      logo_url:             profile.logo_url             ?? '',
      name:                 profile.name                 ?? '',
      shortName:            profile.shortName            ?? '',
      established:          profile.established          ?? undefined,
      affiliatedUniversity: profile.affiliatedUniversity ?? '',
      collegeType:          profile.collegeType          ?? '',
      address:              profile.address              ?? '',
      city:                 profile.city                 ?? '',
      state:                profile.state                ?? '',
      pincode:              profile.pincode              ?? '',
      phone:                profile.phone                ?? '',
      email:                profile.email                ?? '',
      website:              profile.website              ?? '',
    })
  }, [loading, profile])

  function field<K extends keyof CollegeProfileFormData>(key: K) {
    return (value: CollegeProfileFormData[K]) => {
      setForm(f => ({ ...f, [key]: value }))
      if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
    }
  }

  // ── Logo upload ─────────────────────────────────────────────────────────────

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop() ?? 'png'
    const tenantId = user?.tenantId ?? 'unknown'

    setUploading(true)
    try {
      const { getUploadUrl } = await gqlRequest<{
        getUploadUrl: { upload_url: string; key: string }
      }>(GET_UPLOAD_URL, {
        module:    'college-profile',
        entity_id: tenantId,
        extension: ext,
      })

      await fetch(getUploadUrl.upload_url, {
        method:  'PUT',
        body:    file,
        headers: { 'Content-Type': file.type },
      })

      setForm(f => ({ ...f, logo_url: getUploadUrl.key }))
    } catch {
      toast.error('Failed to upload logo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    const parsed = CollegeProfileSchema.safeParse(form)
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setErrors(
        Object.fromEntries(
          Object.entries(flat).map(([k, v]) => [k, (v as string[])?.[0] ?? ''])
        ) as FormErrors
      )
      return
    }
    setErrors({})
    setSaving(true)
    try {
      // Strip empty strings to undefined so backend treats them as cleared
      const input = Object.fromEntries(
        Object.entries(parsed.data).map(([k, v]) => [k, v === '' ? undefined : v])
      ) as CollegeProfileFormData

      await collegeProfileService.upsert(input)
      toast.success('College profile saved')
      reload()
    } catch {
      toast.error('Failed to save college profile')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const logoIsKey = form.logo_url && !form.logo_url.startsWith('http')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">College Profile</h2>
          <p className="text-sm text-slate-500">
            Basic identity, contact details, and branding for your institution
          </p>
        </div>
        <button onClick={handleSave} disabled={saving || loading} className="btn-primary">
          <Save size={16} />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Branding */}
      <SectionCard icon={Building2} title="Branding" description="Logo and display name">
        {/* Logo upload */}
        <div>
          <label className="label">College Logo</label>
          <div className="flex items-center gap-4 mt-1">
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 overflow-hidden bg-slate-50">
              {form.logo_url && !logoIsKey ? (
                <img
                  src={form.logo_url}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Upload size={18} className="text-slate-400" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  <Upload size={12} />
                  {uploading ? 'Uploading…' : form.logo_url ? 'Replace' : 'Upload'}
                </button>
                {form.logo_url && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, logo_url: '' }))}
                    className="btn-secondary text-xs px-3 py-1.5 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X size={12} />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Recommended: SVG or PNG with transparent background, min 200 × 200 px
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
        </div>

        <Grid>
          <div className="sm:col-span-2">
            <FormField label="College Name" error={errors.name}>
              <input
                type="text"
                className="input-field"
                value={form.name ?? ''}
                onChange={e => field('name')(e.target.value)}
                placeholder="e.g. Bheemanna Khandre Institute of Technology"
              />
            </FormField>
          </div>
          <FormField label="Short Name" error={errors.shortName}>
            <input
              type="text"
              className="input-field"
              value={form.shortName ?? ''}
              onChange={e => field('shortName')(e.target.value)}
              placeholder="e.g. BKIT"
            />
          </FormField>
          <FormField label="Established Year" error={errors.established}>
            <input
              type="number"
              className="input-field"
              value={form.established ?? ''}
              min={1800}
              max={new Date().getFullYear()}
              onChange={e => field('established')(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 1980"
            />
          </FormField>
          <FormField label="Affiliated University" error={errors.affiliatedUniversity}>
            <input
              type="text"
              className="input-field"
              value={form.affiliatedUniversity ?? ''}
              onChange={e => field('affiliatedUniversity')(e.target.value)}
              placeholder="e.g. Visvesvaraya Technological University"
            />
          </FormField>
          <FormField label="College Type" error={errors.collegeType}>
            <select
              className="input-field"
              value={form.collegeType ?? ''}
              onChange={e => field('collegeType')(e.target.value)}
            >
              {COLLEGE_TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </FormField>
        </Grid>
      </SectionCard>

      {/* Address */}
      <SectionCard icon={MapPin} title="Address" description="Physical location of the institution">
        <Grid>
          <div className="sm:col-span-2">
            <FormField label="Street Address" error={errors.address}>
              <input
                type="text"
                className="input-field"
                value={form.address ?? ''}
                onChange={e => field('address')(e.target.value)}
                placeholder="e.g. NH-9, Bidar – Hyderabad Road"
              />
            </FormField>
          </div>
          <FormField label="City" error={errors.city}>
            <input
              type="text"
              className="input-field"
              value={form.city ?? ''}
              onChange={e => field('city')(e.target.value)}
              placeholder="e.g. Bidar"
            />
          </FormField>
          <FormField label="State" error={errors.state}>
            <input
              type="text"
              className="input-field"
              value={form.state ?? ''}
              onChange={e => field('state')(e.target.value)}
              placeholder="e.g. Karnataka"
            />
          </FormField>
          <FormField label="Pincode" error={errors.pincode}>
            <input
              type="text"
              className="input-field"
              value={form.pincode ?? ''}
              onChange={e => field('pincode')(e.target.value)}
              placeholder="e.g. 585403"
              maxLength={6}
            />
          </FormField>
        </Grid>
      </SectionCard>

      {/* Contact */}
      <SectionCard icon={Phone} title="Contact" description="Phone, email, and website">
        <Grid>
          <FormField label="Phone" error={errors.phone}>
            <input
              type="tel"
              className="input-field"
              value={form.phone ?? ''}
              onChange={e => field('phone')(e.target.value)}
              placeholder="e.g. +91 84730 00001"
            />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              className="input-field"
              value={form.email ?? ''}
              onChange={e => field('email')(e.target.value)}
              placeholder="e.g. info@bkit.ac.in"
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField
              label="Website"
              hint="Include https://"
              error={errors.website}
            >
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="url"
                  className="input-field pl-9"
                  value={form.website ?? ''}
                  onChange={e => field('website')(e.target.value)}
                  placeholder="https://www.bkit.ac.in"
                />
              </div>
            </FormField>
          </div>
        </Grid>
      </SectionCard>
    </div>
  )
}
