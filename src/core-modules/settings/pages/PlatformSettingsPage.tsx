import { useState, useEffect, useRef } from 'react'
import { Save, Settings2, Globe, Upload, AlertTriangle } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { settingsService } from '../api/settingsApi'
import { PlatformSettingsSchema, type PlatformSettingsFormData } from '../types'
import { useToast } from '@/shared/context/ToastContext'
import FormField from '@/shared/components/forms/FormField'
import { uploadToS3 } from '@/shared/utils/uploadToS3'

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata',    label: 'Asia/Kolkata (IST)' },
  { value: 'UTC',             label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London',   label: 'Europe/London (GMT)' },
]

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'kn', label: 'Kannada' },
  { value: 'hi', label: 'Hindi' },
]

export default function PlatformSettingsPage() {
  const toast = useToast()
  const { getValue, loading, error, reload } = useSettings('operational')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<Partial<Record<keyof PlatformSettingsFormData, string>>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<PlatformSettingsFormData>({
    platform_name:     '',
    default_timezone:  'Asia/Kolkata',
    default_language:  'en',
    platform_logo_url: '',
  })

  useEffect(() => {
    if (loading) return
    setForm({
      platform_name:     getValue('platform_name', 'BIET Admin'),
      default_timezone:  getValue('default_timezone', 'Asia/Kolkata'),
      default_language:  getValue('default_language', 'en'),
      platform_logo_url: getValue('platform_logo_url', ''),
    })
  }, [loading])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToS3(file, 'platform', 'logo')
      setForm(f => ({ ...f, platform_logo_url: url }))
    } catch {
      toast.error('Failed to upload logo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSave() {
    const parsed = PlatformSettingsSchema.safeParse(form)
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setFormError(
        Object.fromEntries(
          Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ''])
        ) as Partial<Record<keyof PlatformSettingsFormData, string>>
      )
      return
    }
    setFormError({})
    setSaving(true)
    try {
      await settingsService.updateBulk(
        Object.fromEntries(Object.entries(form).map(([k, v]) => [k, String(v)]))
      )
      toast.success('Platform settings saved')
      reload()
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Platform Settings</h2>
          <p className="text-sm text-slate-500">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Platform Settings</h2>
          <p className="text-sm text-slate-500">Configure platform name, locale, and branding</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Branding */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Settings2 size={16} className="text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Branding</p>
            <p className="text-xs text-slate-500">Platform name and logo</p>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <FormField label="Platform Name" error={formError.platform_name}>
            <input
              type="text"
              className="input-field"
              value={form.platform_name}
              onChange={e => setForm(f => ({ ...f, platform_name: e.target.value }))}
              placeholder="e.g. BIET Admin"
            />
          </FormField>

          <div>
            <label className="label">Platform Logo</label>
            <div className="flex items-center gap-4 mt-1">
              {form.platform_logo_url && (
                <img
                  src={form.platform_logo_url}
                  alt="Platform logo"
                  className="h-12 w-12 rounded-lg object-contain border border-slate-200 bg-white p-1"
                />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-secondary text-sm"
              >
                <Upload size={14} />
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              {form.platform_logo_url && (
                <span className="text-xs text-slate-400 truncate max-w-xs">{form.platform_logo_url}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Locale */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Globe size={16} className="text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Locale</p>
            <p className="text-xs text-slate-500">Timezone and language defaults for the platform</p>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <FormField label="Default Timezone" error={formError.default_timezone}>
            <select
              className="input-field"
              value={form.default_timezone}
              onChange={e => setForm(f => ({ ...f, default_timezone: e.target.value }))}
            >
              {TIMEZONE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Default Language" error={formError.default_language}>
            <select
              className="input-field"
              value={form.default_language}
              onChange={e => setForm(f => ({ ...f, default_language: e.target.value }))}
            >
              {LANGUAGE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </FormField>
        </div>
      </div>
    </div>
  )
}
