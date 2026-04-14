import { useRef, useState } from 'react'
import { Plus, Edit2, Trash2, FileText, ExternalLink, Upload } from 'lucide-react'
import { admissionsService } from '../api/admissionsApi'
import { useFeeDocuments } from '../hooks/useAdmissions'
import type { FeeDocument } from '@/shared/types/models'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'

function stripBase64(dataUrl: string): string {
  const i = dataUrl.indexOf(',')
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl
}

export default function FeeStructureSection() {
  const toast = useToast()
  const { data: docs, loading, reload } = useFeeDocuments()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<FeeDocument | null>(null)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<{ name: string; dataUrl: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const deleteDialog = useConfirmDialog()

  function openAdd() {
    setEditItem(null); setTitle(''); setFile(null); setErrors({}); setModalOpen(true)
  }

  function openEdit(d: FeeDocument) {
    setEditItem(d); setTitle(d.title); setFile(null); setErrors({}); setModalOpen(true)
  }

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
    if (!title.trim()) e.title = 'Title is required'
    if (!file && !editItem) e.file = 'PDF file is required'
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (editItem) {
        await admissionsService.updateFeeDocument(editItem.id, {
          title,
          ...(file ? { fileName: file.name, fileBase64: stripBase64(file.dataUrl) } : {}),
        })
        toast.success('Document updated')
      } else {
        await admissionsService.createFeeDocument({
          title,
          fileName:   file!.name,
          fileBase64: stripBase64(file!.dataUrl),
        })
        toast.success('Document added')
      }
      reload(); setModalOpen(false)
    } catch {
      toast.error(editItem ? 'Failed to update document' : 'Failed to add document')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await admissionsService.deleteFeeDocument(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Document deleted')
    } catch {
      toast.error('Failed to delete document')
    }
  }

  if (loading) return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Fee Structure</h3>
          <p className="text-xs text-slate-500 mt-0.5">{docs.length} documents</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Document
        </button>
      </div>

      {docs.length === 0 ? (
        <div className="card p-10 text-center text-slate-400 text-sm">No fee structure documents uploaded.</div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {docs.map(d => (
            <div key={d.id} className="px-4 py-3 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{d.title}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{d.fileName} · {d.uploadedAt}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {d.fileUrl && (
                  <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary text-xs flex items-center gap-1">
                    <ExternalLink size={11} /> View
                  </a>
                )}
                <button onClick={() => openEdit(d)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => deleteDialog.open(d.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Document' : 'Add Fee Document'} size="md">
        <div className="space-y-4">
          <FormField label="Title" required error={errors.title}>
            <input className="input-field" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Fee Structure for B.E. Course" />
          </FormField>

          <FormField label="PDF File" required={!editItem} error={errors.file}>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-brand-300 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-brand-50 transition-colors"
            >
              <FileText size={16} className={file ? 'text-red-500' : 'text-slate-300'} />
              <span className={`text-sm ${file ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                {file ? file.name : editItem ? `Current: ${editItem.fileName} (click to replace)` : 'Click to upload PDF'}
              </span>
              <Upload size={14} className="ml-auto text-slate-300" />
            </div>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Document'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Document" message="This fee structure document will be permanently removed." confirmLabel="Delete" />
    </div>
  )
}
