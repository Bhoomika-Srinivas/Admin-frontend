import { useRef, useState, useEffect } from 'react'
import { Upload, FileText, Trash2, ExternalLink, Save } from 'lucide-react'
import { admissionsService } from '../api/admissionsApi'
import { useProspectus } from '../hooks/useAdmissions'
import type { Prospectus } from '@/shared/types/models'
import FormField from '@/shared/components/forms/FormField'
import { useToast } from '@/shared/context/ToastContext'

function stripBase64(dataUrl: string): string {
  const i = dataUrl.indexOf(',')
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl
}

export default function ProspectusSection() {
  const toast = useToast()
  const { data: prospectus, loading, reload } = useProspectus()
  const [form, setForm] = useState<Pick<Prospectus, 'title' | 'description'>>({ title: '', description: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (prospectus) setForm({ title: prospectus.title, description: prospectus.description })
  }, [prospectus])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are accepted'); return }
    const errs: Record<string, string> = {}
    if (!form.title.trim())       errs.title       = 'Title is required before uploading'
    if (!form.description.trim()) errs.description = 'Description is required before uploading'
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Fill in title and description first'); e.target.value = ''; return }
    const reader = new FileReader()
    reader.onload = async ev => {
      const dataUrl = ev.target?.result as string
      setSaving(true)
      try {
        await admissionsService.saveProspectus({
          title:       form.title,
          description: form.description,
          fileName:    file.name,
          fileBase64:  stripBase64(dataUrl),
        })
        reload()
        toast.success('Prospectus uploaded')
      } catch {
        toast.error('Failed to upload prospectus')
      } finally {
        setSaving(false)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleSaveMeta() {
    const e: Record<string, string> = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    if (!prospectus) return
    setSaving(true)
    try {
      await admissionsService.saveProspectus({
        title:       form.title,
        description: form.description,
        fileName:    prospectus.fileName,
        fileBase64:  stripBase64(prospectus.fileUrl),
      })
      reload()
      toast.success('Prospectus details saved')
    } catch {
      toast.error('Failed to save prospectus details')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await admissionsService.deleteProspectus()
      reload()
      setForm({ title: '', description: '' })
      toast.success('Prospectus removed')
    } catch {
      toast.error('Failed to remove prospectus')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-800">Prospectus</h3>
        <p className="text-xs text-slate-500 mt-0.5">Upload the admission prospectus PDF with title and description.</p>
      </div>

      <div className="card p-5 space-y-4">
        <FormField label="Title" required error={errors.title}>
          <input
            className="input-field"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. BIET Prospectus 2025-26"
          />
        </FormField>
        <FormField label="Description" required error={errors.description}>
          <textarea
            className="input-field resize-none h-24"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of the prospectus content..."
          />
        </FormField>
        {prospectus && (
          <div className="flex justify-end">
            <button onClick={handleSaveMeta} disabled={saving} className="btn-primary flex items-center gap-1.5 text-sm">
              <Save size={13} /> {saving ? 'Saving…' : 'Save Details'}
            </button>
          </div>
        )}
      </div>

      <div className="card p-5">
        {prospectus ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <FileText size={22} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate">{prospectus.fileName}</p>
              <p className="text-xs text-slate-400 mt-0.5">Uploaded on {prospectus.uploadedAt}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {prospectus.fileUrl && (
                <a href={prospectus.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary text-xs flex items-center gap-1.5">
                  <ExternalLink size={12} /> Download PDF
                </a>
              )}
              <button onClick={() => fileRef.current?.click()} disabled={saving} className="btn-secondary text-xs flex items-center gap-1.5">
                <Upload size={12} /> Replace
              </button>
              <button onClick={handleDelete} disabled={saving} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={saving}
            className="w-full border-2 border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50 rounded-xl p-12 flex flex-col items-center gap-3 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
              <Upload size={20} className="text-slate-400 group-hover:text-brand-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 group-hover:text-brand-700">Click to upload prospectus PDF</p>
              <p className="text-xs text-slate-400 mt-1">Fill in title and description above first</p>
            </div>
          </button>
        )}
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
      </div>
    </div>
  )
}
