import { useState, useEffect } from 'react'
import { Save, Shield, Settings2, AlertTriangle } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { settingsService } from '../api/settingsApi'
import { SecuritySettingsSchema, type SecuritySettingsFormData } from '../types'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import FormField from '@/shared/components/forms/FormField'

const OTP_OPTIONS = [
  { value: 'sms',  label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'totp', label: 'Authenticator App (TOTP)' },
]

export default function SystemSettingsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const { getValue, loading, error, reload } = useSettings('security')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<Partial<Record<keyof SecuritySettingsFormData, string>>>({})

  const [form, setForm] = useState<SecuritySettingsFormData>({
    mfa_enabled:                true,
    otp_type:                   'email',
    password_min_length:        8,
    password_require_uppercase: true,
    password_require_special:   true,
    session_timeout_minutes:    60,
    max_login_attempts:         5,
  })

  // Populate form once settings load
  useEffect(() => {
    if (loading) return
    setForm({
      mfa_enabled:                getValue('mfa_enabled', 'true') === 'true',
      otp_type:                   getValue('otp_type', 'email') as SecuritySettingsFormData['otp_type'],
      password_min_length:        Number(getValue('password_min_length', '8')),
      password_require_uppercase: getValue('password_require_uppercase', 'true') === 'true',
      password_require_special:   getValue('password_require_special', 'true') === 'true',
      session_timeout_minutes:    Number(getValue('session_timeout_minutes', '60')),
      max_login_attempts:         Number(getValue('max_login_attempts', '5')),
    })
  }, [loading])

  const isSuperAdmin = user.role === 'super_admin'

  async function handleSave() {
    const parsed = SecuritySettingsSchema.safeParse(form)
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setFormError(Object.fromEntries(
        Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ''])
      ) as Partial<Record<keyof SecuritySettingsFormData, string>>)
      return
    }
    setFormError({})
    setSaving(true)
    try {
      await settingsService.updateBulk(
        Object.fromEntries(
          Object.entries(form).map(([k, v]) => [k, String(v)])
        )
      )
      toast.success('Settings saved')
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
          <h2 className="text-xl font-display font-bold text-slate-800">System Settings</h2>
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
          <h2 className="text-xl font-display font-bold text-slate-800">System Settings</h2>
          <p className="text-sm text-slate-500">Configure authentication, security, and access policies</p>
        </div>
        {isSuperAdmin && (
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {!isSuperAdmin && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
          <Shield size={16} className="shrink-0" />
          These settings are view-only. Only a Super Admin can modify them.
        </div>
      )}

      {/* Authentication & MFA */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Shield size={16} className="text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Authentication</p>
            <p className="text-xs text-slate-500">Multi-factor authentication and session control</p>
          </div>
        </div>
        <div className="p-5 space-y-5">
          {/* MFA Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Require MFA for all users</p>
              <p className="text-xs text-slate-400 mt-0.5">Users must verify identity with a one-time code on every login</p>
            </div>
            <button
              type="button"
              disabled={!isSuperAdmin}
              onClick={() => setForm(f => ({ ...f, mfa_enabled: !f.mfa_enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${form.mfa_enabled ? 'bg-brand-600' : 'bg-slate-200'}
                ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform
                ${form.mfa_enabled ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* OTP Type */}
          <FormField label="OTP Delivery Method" error={formError.otp_type}>
            <select
              className="input-field"
              value={form.otp_type}
              disabled={!isSuperAdmin || !form.mfa_enabled}
              onChange={e => setForm(f => ({ ...f, otp_type: e.target.value as SecuritySettingsFormData['otp_type'] }))}
            >
              {OTP_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </FormField>

          {/* Session Timeout */}
          <FormField
            label="Session Timeout (minutes)"
            hint="Users will be logged out after this period of inactivity"
            error={formError.session_timeout_minutes}
          >
            <input
              type="number"
              className="input-field"
              value={form.session_timeout_minutes}
              disabled={!isSuperAdmin}
              min={5}
              max={1440}
              onChange={e => setForm(f => ({ ...f, session_timeout_minutes: Number(e.target.value) }))}
            />
          </FormField>
        </div>
      </div>

      {/* Password Policy */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Settings2 size={16} className="text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Password Policy</p>
            <p className="text-xs text-slate-500">Requirements enforced when users set or change passwords</p>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <FormField
            label="Minimum Password Length"
            error={formError.password_min_length}
          >
            <input
              type="number"
              className="input-field"
              value={form.password_min_length}
              disabled={!isSuperAdmin}
              min={8}
              max={32}
              onChange={e => setForm(f => ({ ...f, password_min_length: Number(e.target.value) }))}
            />
          </FormField>

          <div className="space-y-3">
            {[
              { key: 'password_require_uppercase' as const, label: 'Require uppercase letters (A–Z)' },
              { key: 'password_require_special'   as const, label: 'Require special characters (!@#$...)' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <p className="text-sm text-slate-700">{label}</p>
                <button
                  type="button"
                  disabled={!isSuperAdmin}
                  onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${form[key] ? 'bg-brand-600' : 'bg-slate-200'}
                    ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform
                    ${form[key] ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Account Lockout</p>
            <p className="text-xs text-slate-500">Protect accounts against brute-force login attempts</p>
          </div>
        </div>
        <div className="p-5">
          <FormField
            label="Max Failed Login Attempts"
            hint="Account will be locked after this many consecutive failures"
            error={formError.max_login_attempts}
          >
            <input
              type="number"
              className="input-field"
              value={form.max_login_attempts}
              disabled={!isSuperAdmin}
              min={3}
              max={10}
              onChange={e => setForm(f => ({ ...f, max_login_attempts: Number(e.target.value) }))}
            />
          </FormField>
        </div>
      </div>
    </div>
  )
}
