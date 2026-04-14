import { useState, useEffect, useRef } from 'react'
import { Save, X, Plus, Upload, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { admissionsService } from '../api/admissionsApi'
import { useAdmissionsOverview } from '../hooks/useAdmissions'
import type { AdmissionsOverview } from '@/shared/types/models'
import FormField from '@/shared/components/forms/FormField'
import { useToast } from '@/shared/context/ToastContext'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { validateImageFile } from '@/shared/utils/validateFile'

const emptyForm: AdmissionsOverview = {
  headline: '', subheadline: '', description: '', highlights: [], imageUrl: '', bannerUrl: '',
}

function ImageUpload({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const toast = useToast()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateImageFile(file)
    if (error) {
      toast.error(error)
      e.target.value = ''
      return
    }

    const localUrl = URL.createObjectURL(file)
    onChange(localUrl)
    setUploading(true)

    try {
      const s3Url = await uploadToS3(file, 'admissions', 'overview')
      onChange(s3Url)
      toast.success(`${label} uploaded`)
    } catch {
      toast.error(`Failed to upload ${label}`)
      onChange('')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="label">{label}</label>
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            'w-24 h-20 rounded-lg border-2 border-dashed flex items-center justify-center shrink-0 overflow-hidden bg-slate-50',
            value ? 'border-slate-200' : 'border-slate-300',
          )}
        >
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <Upload size={18} className="text-slate-400" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              {uploading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Upload size={12} />
              )}
              {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            </button>
            {value && !uploading && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
              >
                <X size={12} /> Remove
              </button>
            )}
          </div>
          {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
      </div>
    </div>
  )
}

export default function OverviewSection() {
  const toast = useToast()
  const { data, loading } = useAdmissionsOverview()
  const [form, setForm]   = useState<AdmissionsOverview>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newHighlight, setNewHighlight] = useState('')

  useEffect(() => { if (data) setForm(data) }, [data])

  function addHighlight() {
    if (!newHighlight.trim()) return
    setForm(f => ({ ...f, highlights: [...f.highlights, newHighlight.trim()] }))
    setNewHighlight('')
  }

  function removeHighlight(idx: number) {
    setForm(f => ({ ...f, highlights: f.highlights.filter((_, i) => i !== idx) }))
  }

  async function handleSave() {
    const e: Record<string, string> = {}
    if (!form.headline.trim())    e.headline    = 'Headline is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      await admissionsService.saveOverview(form)
      toast.success('Overview saved')
    } catch {
      toast.error('Failed to save overview')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Admissions Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">Displayed as the hero/header section on the admissions page.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5">
          <Save size={14} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Headline" required error={errors.headline}>
            <input className="input-field" value={form.headline}
              onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
              placeholder="e.g. Admissions 2026–27" />
          </FormField>
          <FormField label="Subheadline">
            <input className="input-field" value={form.subheadline}
              onChange={e => setForm(f => ({ ...f, subheadline: e.target.value }))}
              placeholder="e.g. Applications open for July 2026 intake" />
          </FormField>
        </div>

        <FormField label="Description" required error={errors.description}>
          <textarea className="input-field resize-none h-28" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of the admissions process and key highlights…" />
        </FormField>

        <FormField label="Highlights" hint="Bullet points shown on the hero section">
          <div className="space-y-2 mb-2">
            {form.highlights.map((h, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                <span className="flex-1 text-sm text-slate-700">{h}</span>
                <button onClick={() => removeHighlight(idx)} className="p-1 text-slate-300 hover:text-red-500 rounded">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input-field flex-1 text-sm" value={newHighlight}
              onChange={e => setNewHighlight(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHighlight()}
              placeholder="Add a highlight and press Enter…" />
            <button onClick={addHighlight} className="btn-secondary text-xs flex items-center gap-1">
              <Plus size={12} /> Add
            </button>
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <ImageUpload
            label="Hero Image"
            value={form.imageUrl}
            onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
            hint="Main image shown in hero section"
          />
          <ImageUpload
            label="Banner Image"
            value={form.bannerUrl}
            onChange={url => setForm(f => ({ ...f, bannerUrl: url }))}
            hint="Background banner image"
          />
        </div>
      </div>
    </div>
  )
}
