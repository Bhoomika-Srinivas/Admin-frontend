import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Upload, X, Edit2, Save, ImageIcon } from 'lucide-react'
import clsx from 'clsx'
import { useToast } from '@/shared/context/ToastContext'
import { deptAboutService } from '../../api/deptAboutApi'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import type { DeptIntroduction } from '@/shared/types/models'

// ── Image Upload ───────────────────────────────────────────────────────────────

function ImageUpload({
  label, value, onChange, hint, aspectClass = 'h-24 w-24', contain = true, deptId, uploading, setUploading,
}: {
  label: string; value: string; onChange: (v: string) => void
  hint?: string; aspectClass?: string; contain?: boolean
  deptId: string; uploading: boolean; setUploading: (v: boolean) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const { error } = useToast()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    // Show instant local preview
    onChange(URL.createObjectURL(file))
    setUploading(true)
    try {
      const url = await uploadToS3(file, 'dept-info', deptId)
      onChange(url)
    } catch (err) {
      console.error('Upload error:', err)
      onChange('')
      error(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="label">{label}</label>
      <div className="flex items-start gap-4">
        <div className={clsx(
          'rounded-xl border-2 border-dashed flex items-center justify-center shrink-0 overflow-hidden bg-slate-50',
          aspectClass, value ? 'border-slate-200' : 'border-slate-300',
        )}>
          {value
            ? <img src={value} alt={label} className={clsx('w-full h-full', contain ? 'object-contain p-2' : 'object-cover')} />
            : <Upload size={20} className="text-slate-300" />
          }
        </div>
        <div className="flex-1 space-y-2">
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Upload size={12} />{uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            </button>
            {value && !uploading && (
              <button type="button" onClick={() => onChange('')}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                <X size={12} />Remove
              </button>
            )}
          </div>
          {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const BLANK: DeptIntroduction = { deptId: '', department_name: '', logo: '', image: '', description: '' }

export default function IntroductionPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const { success, error } = useToast()

  const [saved, setSaved] = useState<DeptIntroduction>(BLANK)
  const [form,  setForm]  = useState<DeptIntroduction>(BLANK)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!deptId) return
    deptAboutService.getIntroduction(deptId).then(data => {
      setSaved(data)
      setForm(data)
    })
  }, [deptId])

  function update<K extends keyof DeptIntroduction>(k: K, v: DeptIntroduction[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function handleEdit() { setForm(saved); setEditing(true) }
  function handleCancel() { setForm(saved); setEditing(false) }

  async function handleSave() {
    if (!deptId) return
    setSaving(true)
    try {
      const result = await deptAboutService.saveIntroduction(deptId, {
        department_name: form.department_name,
        logo: form.logo,
        image: form.image,
        description: form.description,
      })
      setSaved(result)
      setForm(result)
      setEditing(false)
      success('Introduction saved')
    } catch (err) {
      console.error('Save error:', err)
      error(err instanceof Error ? err.message : 'Failed to save introduction')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">Introduction</h1>
          <p className="text-sm text-slate-500 mt-0.5">Basic identity shown at the top of the public department page.</p>
        </div>
        {!editing && (
          <button onClick={handleEdit} className="btn-secondary flex items-center gap-1.5">
            <Edit2 size={14} /> Edit
          </button>
        )}
      </div>

      <div className="card p-6 space-y-6">

        {/* Department Name */}
        <div className="space-y-1">
          <p className="label">Department Name</p>
          {editing ? (
            <input type="text" value={form.department_name}
              onChange={e => update('department_name', e.target.value)}
              placeholder="e.g. Department of Computer Science and Engineering"
              className="input-field w-full" />
          ) : (
            <p className="text-sm text-slate-800 font-medium">
              {saved.department_name || <span className="text-slate-400 italic">Not set</span>}
            </p>
          )}
        </div>

        {/* Logo */}
        {editing ? (
          <ImageUpload label="Department Logo" value={form.logo} onChange={v => update('logo', v)}
            hint="Recommended: PNG or SVG with transparent background, square format"
            aspectClass="h-24 w-24" contain deptId={deptId!} uploading={uploading} setUploading={setUploading} />
        ) : (
          <div className="space-y-1.5">
            <p className="label">Department Logo</p>
            {saved.logo
              ? <img src={saved.logo} alt="Logo" className="h-20 w-20 rounded-xl border border-slate-200 object-contain p-1 bg-slate-50" />
              : <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50">
                  <ImageIcon size={20} className="text-slate-300" />
                </div>
            }
          </div>
        )}

        {/* Banner Image */}
        {editing ? (
          <ImageUpload label="Department Image" value={form.image} onChange={v => update('image', v)}
            hint="Banner or cover photo. Recommended: 1200 × 400 px"
            aspectClass="h-28 w-48" contain={false} deptId={deptId!} uploading={uploading} setUploading={setUploading} />
        ) : (
          <div className="space-y-1.5">
            <p className="label">Department Image</p>
            {saved.image
              ? <img src={saved.image} alt="Banner" className="h-28 w-48 rounded-xl border border-slate-200 object-cover bg-slate-50" />
              : <div className="h-28 w-48 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50">
                  <ImageIcon size={24} className="text-slate-300" />
                </div>
            }
          </div>
        )}

        {/* Description */}
        <div className="space-y-1">
          <p className="label">Description</p>
          {editing ? (
            <>
              <textarea value={form.description} onChange={e => update('description', e.target.value)}
                rows={6} className="input-field w-full resize-none"
                placeholder="Write a brief introduction about the department…" />
              <p className="text-xs text-slate-400">{form.description.length} characters</p>
            </>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {saved.description || <span className="text-slate-400 italic">No description added.</span>}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {editing && (
        <div className="flex justify-end gap-2">
          <button onClick={handleCancel} className="btn-secondary" disabled={saving || uploading}>Cancel</button>
          <button onClick={handleSave} className="btn-primary flex items-center gap-1.5" disabled={saving || uploading}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Introduction'}
          </button>
        </div>
      )}
    </div>
  )
}
