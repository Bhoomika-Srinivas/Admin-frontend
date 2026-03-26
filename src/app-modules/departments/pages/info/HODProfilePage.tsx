import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Save, Upload, FileText, Download, ExternalLink, X, Bold, Italic, List, ListOrdered, Edit2 } from 'lucide-react'
import { deptAboutService } from '@/app-modules/departments/api/deptAboutApi'
import type { HODProfile } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import FormField from '@/shared/components/forms/FormField'

// ── Rich Text Editor ──────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const lastHtmlRef = useRef(value)

  // Sync external value changes into the editor (only on mount / external reset)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
      lastHtmlRef.current = value
    }
  }, [])

  function exec(cmd: string, arg?: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, arg)
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      lastHtmlRef.current = html
      onChange(html)
    }
  }

  function handleInput() {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      if (html !== lastHtmlRef.current) {
        lastHtmlRef.current = html
        onChange(html)
      }
    }
  }

  const toolbarBtn = 'p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors'

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-400 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        <button type="button" onClick={() => exec('bold')} title="Bold" className={toolbarBtn}>
          <Bold size={14} />
        </button>
        <button type="button" onClick={() => exec('italic')} title="Italic" className={toolbarBtn}>
          <Italic size={14} />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />
        <button type="button" onClick={() => exec('insertUnorderedList')} title="Bullet list" className={toolbarBtn}>
          <List size={14} />
        </button>
        <button type="button" onClick={() => exec('insertOrderedList')} title="Numbered list" className={toolbarBtn}>
          <ListOrdered size={14} />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />
        <button type="button" onClick={() => exec('removeFormat')} className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-1 rounded hover:bg-slate-200 transition-colors">
          Clear
        </button>
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[180px] p-3 text-sm text-slate-700 leading-relaxed focus:outline-none
          [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2
          [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-2
          empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
      />
    </div>
  )
}

// ── Profile Summary preview with truncation ───────────────────────────────────

const WORD_LIMIT = 70

function ProfileSummaryPreview({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false)

  const plainText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = plainText.split(' ').filter(Boolean)
  const canTruncate = words.length > WORD_LIMIT

  if (!html) {
    return <p className="text-sm text-slate-400 italic">No profile summary added yet.</p>
  }

  if (!canTruncate || expanded) {
    return (
      <div>
        <div
          className="text-sm text-slate-700 leading-relaxed
            [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2
            [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-2
            [&>strong]:font-semibold [&>em]:italic"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {canTruncate && (
          <button onClick={() => setExpanded(false)}
            className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            Show Less
          </button>
        )}
      </div>
    )
  }

  const truncated = words.slice(0, WORD_LIMIT).join(' ') + '…'
  return (
    <div>
      <p className="text-sm text-slate-700 leading-relaxed">{truncated}</p>
      <button onClick={() => setExpanded(true)}
        className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
        Read More
      </button>
    </div>
  )
}

// ── Image upload helper ───────────────────────────────────────────────────────

function PhotoUploader({
  imageUrl, name, onChange, deptId,
}: { imageUrl: string; name: string; onChange: (url: string) => void; deptId: string }) {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    onChange(URL.createObjectURL(file))
    try {
      const url = await uploadToS3(file, 'dept-hod', deptId)
      onChange(url)
    } catch {
      onChange('')
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Photo display */}
      <div className="relative group">
        {imageUrl ? (
          <img src={imageUrl} alt={name || 'HOD'} className="w-36 h-40 rounded-2xl object-cover border-2 border-slate-200 shadow-sm" />
        ) : (
          <div className="w-36 h-40 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-dashed border-slate-300">
            <span className="text-4xl font-display text-slate-400">{name?.[0]?.toUpperCase() ?? '?'}</span>
          </div>
        )}
        {/* Overlay on hover */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white"
        >
          <Upload size={18} />
          <span className="text-xs font-medium">Upload</span>
        </button>
        {imageUrl && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X size={10} />
          </button>
        )}
      </div>

      <button type="button" onClick={() => fileRef.current?.click()}
        className="text-xs text-brand-600 font-medium hover:underline">
        {imageUrl ? 'Change photo' : 'Upload photo'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── PDF upload helper ─────────────────────────────────────────────────────────

function CvUploader({
  cvUrl, onChange, deptId,
}: { cvUrl: string; onChange: (url: string) => void; deptId: string }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return }
    e.target.value = ''
    try {
      const url = await uploadToS3(file, 'dept-hod', deptId)
      onChange(url)
    } catch {
      toast.error('CV upload failed')
    }
  }

  return (
    <div>
      <label className="label mb-1.5 block">Profile CV / Resume <span className="text-xs font-normal text-slate-400">(PDF)</span></label>
      {cvUrl ? (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <FileText size={18} className="text-red-500 shrink-0" />
          <span className="text-sm text-slate-700 flex-1">CV uploaded</span>
          <a href={cvUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1">
            <ExternalLink size={12} /> View
          </a>
          <a href={cvUrl} download="HOD_CV.pdf"
            className="text-xs text-slate-600 hover:text-slate-800 hover:underline font-medium flex items-center gap-1">
            <Download size={12} /> Download
          </a>
          <button type="button" onClick={() => onChange('')}
            className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-full px-3 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition-colors flex items-center justify-center gap-2">
          <Upload size={15} /> Upload PDF
        </button>
      )}
      <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type FormState = Omit<HODProfile, 'deptId'>

const BLANK: FormState = {
  name: '', title: '', designation: 'Head of Department',
  qualification: '', experience: '', specialization: '',
  message: '', profileSummary: '', email: '', phone: '', imageUrl: '', cvUrl: '',
}

export default function HODProfilePage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast = useToast()

  const [saved,   setSaved]   = useState<FormState>(BLANK)
  const [form,    setForm]    = useState<FormState>(BLANK)
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (!deptId) return
    deptAboutService.getHOD(deptId).then(data => {
      const vals: FormState = {
        name: data.name, title: data.title ?? '', designation: data.designation,
        qualification: data.qualification, experience: data.experience,
        specialization: data.specialization, message: data.message,
        profileSummary: data.profileSummary ?? '', email: data.email,
        phone: data.phone ?? '', imageUrl: data.imageUrl ?? '', cvUrl: data.cvUrl ?? '',
      }
      setSaved(vals)
      setForm(vals)
    })
  }, [deptId])

  async function handleSave() {
    if (!deptId) return
    setSaving(true)
    try {
      const result = await deptAboutService.saveHOD(deptId, form)
      const vals: FormState = {
        name: result.name, title: result.title ?? '', designation: result.designation,
        qualification: result.qualification, experience: result.experience,
        specialization: result.specialization, message: result.message,
        profileSummary: result.profileSummary ?? '', email: result.email,
        phone: result.phone ?? '', imageUrl: result.imageUrl ?? '', cvUrl: result.cvUrl ?? '',
      }
      setSaved(vals)
      setForm(vals)
      setEditing(false)
      toast.success('HOD Profile saved')
    } catch {
      toast.error('Failed to save HOD Profile')
    } finally {
      setSaving(false)
    }
  }

  function handleEdit()   { setForm(saved); setEditing(true)  }
  function handleCancel() { setForm(saved); setEditing(false) }

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm(f => ({ ...f, [key]: value })),
    [],
  )

  // Use saved for preview, form for edit fields
  const display = editing ? form : saved
  const displayName = [display.title, display.name].filter(Boolean).join(' ')

  return (
    <div className="space-y-6">

      {/* ── Profile Card (always visible) ───────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-bold text-slate-800">HOD Profile</h3>
            <p className="text-sm text-slate-500">Head of Department's profile information.</p>
          </div>
          {!editing && (
            <button onClick={handleEdit} className="btn-secondary flex items-center gap-1.5">
              <Edit2 size={14} /> Edit
            </button>
          )}
        </div>

        {/* Profile view */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col items-center sm:items-start gap-2 shrink-0 sm:w-44">
            {display.imageUrl ? (
              <img src={display.imageUrl} alt={displayName || 'HOD'}
                className="w-36 h-40 rounded-2xl object-cover border border-slate-200 shadow-sm" />
            ) : (
              <div className="w-36 h-40 rounded-2xl bg-gradient-to-br from-brand-50 to-slate-100 flex items-center justify-center border border-slate-200">
                <span className="text-5xl font-display text-slate-300">
                  {display.name?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
            )}
            <div className="text-center sm:text-left mt-1">
              <p className="font-bold text-slate-800 text-sm leading-tight">
                {displayName || <span className="text-slate-400 italic">Name not set</span>}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{display.designation}</p>
              {display.qualification && <p className="text-xs text-slate-400 mt-0.5">{display.qualification}</p>}
              {display.experience    && <p className="text-xs text-slate-400">{display.experience} exp.</p>}
              {display.email         && <p className="text-xs text-brand-600 mt-1 truncate">{display.email}</p>}
            </div>
            {display.cvUrl && (
              <div className="flex gap-2 mt-1 flex-wrap justify-center sm:justify-start">
                <a href={display.cvUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline font-medium">
                  <ExternalLink size={11} /> View CV
                </a>
                <a href={display.cvUrl} download="HOD_CV.pdf"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:underline font-medium">
                  <Download size={11} /> Download
                </a>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Profile Summary</p>
            <ProfileSummaryPreview html={display.profileSummary ?? ''} />
          </div>
        </div>
      </div>

      {/* ── Edit Form (shown only in edit mode) ─────────────────────────── */}
      {editing && (
        <div className="card p-5 space-y-6">
          <p className="text-sm font-semibold text-slate-700">Edit Details</p>

          {/* Photo + basic info */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <PhotoUploader imageUrl={form.imageUrl ?? ''} name={form.name} onChange={url => set('imageUrl', url)} deptId={deptId!} />
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Title">
                  <input className="input-field" value={form.title ?? ''} placeholder="Dr. / Prof."
                    onChange={e => set('title', e.target.value)} />
                </FormField>
                <div className="col-span-2">
                  <FormField label="Name" required>
                    <input className="input-field" value={form.name}
                      onChange={e => set('name', e.target.value)} />
                  </FormField>
                </div>
              </div>
              <FormField label="Designation">
                <input className="input-field" value={form.designation}
                  onChange={e => set('designation', e.target.value)} />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Qualification">
                  <input className="input-field" placeholder="e.g. Ph.D. (CSE)" value={form.qualification}
                    onChange={e => set('qualification', e.target.value)} />
                </FormField>
                <FormField label="Experience">
                  <input className="input-field" placeholder="e.g. 20 years" value={form.experience}
                    onChange={e => set('experience', e.target.value)} />
                </FormField>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Specialization">
              <input className="input-field" value={form.specialization}
                onChange={e => set('specialization', e.target.value)} />
            </FormField>
            <FormField label="Email">
              <input className="input-field" type="email" value={form.email}
                onChange={e => set('email', e.target.value)} />
            </FormField>
            <FormField label="Phone">
              <input className="input-field" value={form.phone ?? ''}
                onChange={e => set('phone', e.target.value)} />
            </FormField>
          </div>

          <FormField label="Profile Summary">
            <RichTextEditor value={form.profileSummary ?? ''} onChange={v => set('profileSummary', v)}
              placeholder="Write a detailed profile summary for the HOD…" />
            <p className="text-xs text-slate-400 mt-1.5">Supports bold, italic, and lists.</p>
          </FormField>

          <CvUploader cvUrl={form.cvUrl ?? ''} onChange={url => set('cvUrl', url)} deptId={deptId!} />

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={handleCancel} className="btn-secondary" disabled={saving}>Cancel</button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-1.5" disabled={saving}>
              <Save size={15} /> {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
