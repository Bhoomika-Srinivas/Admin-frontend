import { useState, useEffect } from 'react'
import { Save, ExternalLink } from 'lucide-react'
import { useRegistrationSettings } from '../hooks/useAlumni'
import { alumniService } from '../api/alumniApi'
import FormField from '@/shared/components/forms/FormField'
import { useToast } from '@/shared/context/ToastContext'
import type { AlumniRegistration } from '@/shared/types/models'

const defaultSettings: AlumniRegistration = {
  id: 'default',
  title: 'Alumni Registration',
  description: 'Join the BIET Alumni Network and stay connected with your alma mater.',
  registrationLink: 'https://www.fresherprofiles.com/alumni/register_contactus',
}

export default function RegistrationSection() {
  const toast = useToast()
  const { settings, loading, reload } = useRegistrationSettings()
  const [form, setForm] = useState<AlumniRegistration>(defaultSettings)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  if (loading) {
    return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>
  }

  async function handleSave() {
    if (!form.title.trim() || !form.registrationLink.trim()) {
      toast.error('Title and registration link are required')
      return
    }
    setSaving(true)
    try {
      await alumniService.updateRegistration({
        title: form.title,
        description: form.description,
        registrationLink: form.registrationLink,
      })
      toast.success('Registration settings saved')
      await reload()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Registration Settings</h3>
          <p className="text-xs text-slate-500 mt-0.5">Configure the alumni registration page settings.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5">
          <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="card p-5 space-y-4">
        <FormField label="Page Title" required>
          <input
            className="input-field"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Alumni Registration"
          />
        </FormField>

        <FormField label="Description" hint="Brief description shown on the registration page">
          <textarea
            className="input-field h-24 resize-none"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe the benefits of joining the alumni network…"
          />
        </FormField>

        <FormField label="Registration Link" required hint="External registration form URL">
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              value={form.registrationLink}
              onChange={e => setForm(f => ({ ...f, registrationLink: e.target.value }))}
              placeholder="https://…"
            />
            <a
              href={form.registrationLink}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary flex items-center gap-1.5 whitespace-nowrap"
            >
              <ExternalLink size={14} /> Test Link
            </a>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Default: https://www.fresherprofiles.com/alumni/register_contactus
          </p>
        </FormField>
      </div>
    </div>
  )
}
