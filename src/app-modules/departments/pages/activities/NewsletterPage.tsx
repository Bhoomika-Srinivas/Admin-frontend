import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, FileDown, Upload, X } from 'lucide-react'
import { newsletterService } from '@/app-modules/departments/api/deptActivitiesApi'
import type { DeptNewsletter } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'

// ── File uploader ──────────────────────────────────────────────────────────────

function PdfUploader({
  value, fileName, onChange, onClear, deptId,
}: {
  value: string
  fileName: string
  onChange: (url: string, name: string) => void
  onClear: () => void
  deptId: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadToS3(file, 'dept-activities', deptId)
      onChange(url, file.name)
    } catch {
      toast.error('Upload failed')
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-2 p-3 border border-emerald-200 bg-emerald-50 rounded-lg">
        <FileDown size={14} className="text-emerald-600 shrink-0" />
        <span className="text-sm text-emerald-700 flex-1 truncate font-medium">{fileName || 'File uploaded'}</span>
        <button type="button" onClick={onClear} className="text-slate-400 hover:text-red-500 shrink-0">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <>
      <button type="button" onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-brand-300 hover:bg-brand-50/30 transition-colors text-slate-400 hover:text-brand-600 text-sm">
        <Upload size={15} />
        <span>Click to upload PDF</span>
      </button>
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const emptyForm = { year: '', fileUrl: '', fileName: '' }

export default function NewsletterPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast = useToast()
  const { data, reload } = useDepartmentSectionAsync<DeptNewsletter>(() => newsletterService.getAll(deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<DeptNewsletter | null>(null)
  const [form, setForm] = useState(emptyForm)
  const deleteDialog = useConfirmDialog()
  const { page, setPage, limit, data: paginated } = usePagination(data)

  async function handleSave() {
    if (!form.year.trim()) { toast.error('Year is required'); return }
    if (!form.fileUrl) { toast.error('Please upload a file'); return }
    try {
      if (editItem) {
        await newsletterService.update(editItem.id, { year: form.year.trim(), fileUrl: form.fileUrl })
        toast.success('Updated')
      } else {
        await newsletterService.create({ deptId: deptId!, year: form.year.trim(), fileUrl: form.fileUrl })
        toast.success('Published')
      }
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await newsletterService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (item: DeptNewsletter) => {
    setEditItem(item)
    setForm({ year: item.year, fileUrl: item.fileUrl, fileName: '' })
    setModalOpen(true)
  }

  const columns: Column<DeptNewsletter>[] = [
    {
      key: 'year', header: 'Year',
      render: r => <span className="font-semibold text-sm text-slate-800">{r.year}</span>,
    },
    {
      key: 'fileUrl', header: 'File',
      render: r => r.fileUrl
        ? <a href={r.fileUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline">
            <FileDown size={14} /> Download
          </a>
        : <span className="text-xs text-slate-400">—</span>,
    },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <Edit2 size={14} />
          </button>
          <button onClick={() => deleteDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">Newsletter</h3>
          <p className="text-sm text-slate-500">{data.length} issue{data.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Publish Issue
        </button>
      </div>

      <div className="card">
        <DataTable columns={columns} data={paginated} keyExtractor={r => r.id}
          total={data.length} page={page} limit={limit} onPageChange={setPage}
          emptyTitle="No newsletters yet" emptyDescription="Publish an issue using the button above." />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Newsletter' : 'Publish Newsletter Issue'} size="lg">
        <div className="space-y-4">
          <FormField label="Year" required>
            <input className="input-field" placeholder="e.g. 2024-25"
              value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
          </FormField>
          <FormField label="Newsletter PDF" required>
            <PdfUploader
              value={form.fileUrl}
              fileName={form.fileName}
              deptId={deptId!}
              onChange={(url, name) => setForm(f => ({ ...f, fileUrl: url, fileName: name }))}
              onClear={() => setForm(f => ({ ...f, fileUrl: '', fileName: '' }))}
            />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Publish'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Newsletter"
        message="This newsletter issue will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}
