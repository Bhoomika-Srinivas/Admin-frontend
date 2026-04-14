import { useRef, useState } from 'react'
import { Plus, Trash2, FileText, ExternalLink } from 'lucide-react'
import { admissionsService } from '../api/admissionsApi'
import { useAuditStatements } from '../hooks/useAdmissions'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'

function stripBase64(dataUrl: string): string {
  const i = dataUrl.indexOf(',')
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl
}

export default function AuditSection() {
  const toast = useToast()
  const { data: statements, loading, reload } = useAuditStatements()
  const [modalOpen, setModalOpen] = useState(false)
  const [year, setYear] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<{ name: string; dataUrl: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const deleteDialog = useConfirmDialog()

  function openAdd() { setYear(''); setTitle(''); setFile(null); setErrors({}); setModalOpen(true) }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are accepted'); return }
    const reader = new FileReader()
    reader.onload = ev => setFile({ name: f.name, dataUrl: ev.target?.result as string })
    reader.readAsDataURL(f)
    e.target.value = ''
  }

  async function handleSave() {
    const e: Record<string, string> = {}
    if (!year.trim())  e.year  = 'Year is required'
    if (!title.trim()) e.title = 'Title is required'
    if (!file)         e.file  = 'PDF file is required'
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await admissionsService.createAuditStatement({
        year,
        title,
        fileName:   file!.name,
        fileBase64: stripBase64(file!.dataUrl),
      })
      reload(); setModalOpen(false); toast.success('Audit statement added')
    } catch {
      toast.error('Failed to add audit statement')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await admissionsService.deleteAuditStatement(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Audit statement deleted')
    } catch {
      toast.error('Failed to delete audit statement')
    }
  }

  if (loading) return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Audit Statement</h3>
          <p className="text-xs text-slate-500 mt-0.5">{statements.length} documents • Sorted by year (latest first)</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Statement
        </button>
      </div>

      {statements.length === 0 ? (
        <div className="card p-10 text-center text-slate-400 text-sm">No audit statements uploaded.</div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {statements.map(s => (
            <div key={s.id} className="px-4 py-3 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{s.year} — {s.title}</p>
                <p className="text-xs text-slate-400 truncate">{s.fileName} · Uploaded {s.uploadedAt}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.fileUrl && (
                  <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary text-xs flex items-center gap-1">
                    <ExternalLink size={11} /> View
                  </a>
                )}
                <button onClick={() => deleteDialog.open(s.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Audit Statement" size="sm">
        <div className="space-y-4">
          <FormField label="Academic Year" required error={errors.year}>
            <input className="input-field" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2024-25" />
          </FormField>
          <FormField label="Title" required error={errors.title}>
            <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Annual Audit Statement" />
          </FormField>
          <FormField label="Audit PDF" required error={errors.file}>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-brand-300 rounded-lg p-5 flex items-center gap-3 cursor-pointer hover:bg-brand-50 transition-colors"
            >
              <FileText size={18} className={file ? 'text-red-500' : 'text-slate-300'} />
              <span className={`text-sm ${file ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                {file ? file.name : 'Click to upload PDF'}
              </span>
            </div>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Uploading…' : 'Upload'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Audit Statement" message="This document will be permanently removed." confirmLabel="Delete" />
    </div>
  )
}
