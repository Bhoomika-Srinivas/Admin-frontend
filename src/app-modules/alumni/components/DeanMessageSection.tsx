import { useState, useEffect, useRef } from 'react'
import { Save, Upload, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import { useDeanMessage } from '../hooks/useAlumni'
import { alumniService } from '../api/alumniApi'
import FormField from '@/shared/components/forms/FormField'
import { useToast } from '@/shared/context/ToastContext'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { validateImageFile } from '@/shared/utils/validateFile'
import { ALUMNI_DEPARTMENTS } from '@/shared/constants/departments'
import type { DeanMessage } from '@/shared/types/models'

const defaultMessage: DeanMessage = {
  id: 'default',
  name: 'Dr Devendrappa K C',
  role: 'Dean - Alumni',
  department: 'MECHANICAL',
  designation: 'Professor',
  message: '',
  isActive: true,
}

const PREVIEW_LENGTH = 150

export default function DeanMessageSection() {
  const toast = useToast()
  const { message, loading, reload } = useDeanMessage()
  const [form, setForm] = useState<DeanMessage>(defaultMessage)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (message) setForm(message)
  }, [message])

  if (loading) {
    return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateImageFile(file)
    if (error) {
      toast.error(error)
      e.target.value = ''
      return
    }

    const localUrl = URL.createObjectURL(file)
    setForm(f => ({ ...f, image: localUrl }))
    setUploading(true)

    try {
      const s3Url = await uploadToS3(file, 'alumni', 'dean-message')
      setForm(f => ({ ...f, image: s3Url }))
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
      setForm(f => ({ ...f, image: '' }))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.message.trim()) {
      toast.error('Name and message are required')
      return
    }
    setSaving(true)
    try {
      await alumniService.updateDeanMessage({
        name: form.name,
        role: form.role,
        department: form.department,
        designation: form.designation,
        message: form.message,
        image: form.image,
        isActive: form.isActive,
      })
      toast.success('Dean message saved')
      await reload()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const previewText =
    form.message.length > PREVIEW_LENGTH && !isExpanded
      ? form.message.slice(0, PREVIEW_LENGTH) + '…'
      : form.message

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Dean Message</h3>
          <p className="text-xs text-slate-500 mt-0.5">Message from the Dean of Alumni Affairs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary flex items-center gap-1.5"
          >
            {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5">
            <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Form */}
        <div className="card p-5 space-y-4">
          <h4 className="font-medium text-slate-800">Edit Message</h4>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required>
              <input
                className="input-field"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Dr Devendrappa K C"
              />
            </FormField>
            <FormField label="Role" required>
              <input
                className="input-field"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Dean - Alumni"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department" required>
              <select
                className="input-field"
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              >
                {ALUMNI_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Designation" required>
              <input
                className="input-field"
                value={form.designation}
                onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                placeholder="e.g. Professor"
              />
            </FormField>
          </div>

          <FormField label="Profile Image">
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  'w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center shrink-0 overflow-hidden bg-slate-50',
                  form.image ? 'border-slate-200' : 'border-slate-300'
                )}
              >
                {form.image ? (
                  <img src={form.image} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-300">{form.name ? form.name[0] : '?'}</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {uploading ? 'Uploading…' : form.image ? 'Replace' : 'Upload'}
                  </button>
                  {form.image && !uploading && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, image: undefined }))}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X size={12} /> Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400">JPEG/PNG, max 2MB</p>
              </div>
            </div>
          </FormField>

          <FormField label="Message" required>
            <textarea
              className="input-field h-48 resize-none"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Write the Dean's message to alumni…"
            />
          </FormField>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-slate-300"
            />
            <label htmlFor="isActive" className="text-sm text-slate-600">Active (visible on website)</label>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="card p-5 space-y-4">
            <h4 className="font-medium text-slate-800">Preview</h4>
            <div className="border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="flex items-start gap-4">
                {form.image ? (
                  <img
                    src={form.image}
                    alt={form.name}
                    className="w-16 h-16 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold">
                    {form.name ? form.name[0] : '?'}
                  </div>
                )}
                <div>
                  <h5 className="font-semibold text-slate-800">{form.name || 'Name'}</h5>
                  <p className="text-sm text-brand-600">{form.role || 'Role'}</p>
                  <p className="text-xs text-slate-500">
                    {form.designation} • {form.department}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{previewText || <span className="italic text-slate-400">Message preview will appear here…</span>}</p>
                {form.message.length > PREVIEW_LENGTH && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm text-brand-600 hover:text-brand-700 mt-2 font-medium"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              {!form.isActive && (
                <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  This message is currently inactive and will not be displayed on the website.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
