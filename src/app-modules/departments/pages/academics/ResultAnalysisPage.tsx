import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, FileDown, ImageIcon, X, Upload } from 'lucide-react'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { resultAnalysisService } from '@/app-modules/departments/api/deptAcademicsApi'
import type { ResultAnalysis } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'

// ── Constants ─────────────────────────────────────────────────────────────────

const SEMESTER_OPTIONS = [
  '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
  '5th Semester', '6th Semester', '7th Semester', '8th Semester',
]

// ── File uploader components ──────────────────────────────────────────────────

function PdfUploader({ value, onChange, deptId }: { value: string; onChange: (url: string) => void; deptId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    try {
      const url = await uploadToS3(file, 'dept-academics', deptId)
      onChange(url)
    } catch {
      onChange(''); setFileName('')
    }
  }

  function clear() {
    onChange(''); setFileName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  if (value && fileName) {
    return (
      <div className="flex items-center gap-2 p-3 border border-emerald-200 bg-emerald-50 rounded-lg">
        <FileDown size={15} className="text-emerald-600 shrink-0" />
        <span className="text-sm text-emerald-700 flex-1 truncate font-medium">{fileName}</span>
        <button type="button" onClick={clear} className="text-slate-400 hover:text-red-500 shrink-0">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <button type="button" onClick={() => inputRef.current?.click()}
      className="w-full flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-brand-300 hover:bg-brand-50/30 transition-colors text-slate-400 hover:text-brand-600">
      <Upload size={20} />
      <span className="text-sm font-medium">Upload Result Analysis Report</span>
      <span className="text-xs">PDF only · Click to browse</span>
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
    </button>
  )
}

function ImageUploader({ value, onChange, deptId }: { value: string; onChange: (url: string) => void; deptId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    onChange(URL.createObjectURL(file))
    try {
      const url = await uploadToS3(file, 'dept-academics', deptId)
      onChange(url)
    } catch {
      onChange(''); setFileName('')
    }
  }

  function clear() {
    onChange(''); setFileName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img src={value} alt="Graph preview" className="w-full max-h-40 object-contain" />
          <button type="button" onClick={clear}
            className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-slate-500 hover:text-red-500">
            <X size={12} />
          </button>
        </div>
        <p className="text-xs text-slate-400 truncate">{fileName}</p>
      </div>
    )
  }

  return (
    <button type="button" onClick={() => inputRef.current?.click()}
      className="w-full flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-brand-300 hover:bg-brand-50/30 transition-colors text-slate-400 hover:text-brand-600">
      <ImageIcon size={20} />
      <span className="text-sm font-medium">Upload Result Analysis Graph</span>
      <span className="text-xs">JPG · PNG · SVG · Click to browse</span>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.svg" className="hidden" onChange={handleFile} />
    </button>
  )
}

// ── Form type ─────────────────────────────────────────────────────────────────

type Form = {
  title: string
  semester: number
  batch: string
  pdfUrl: string
  graphImageUrl: string
}

const blank = (): Form => ({ title: '', semester: 1, batch: '', pdfUrl: '', graphImageUrl: '' })

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResultAnalysisPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast      = useToast()

  const { data, reload } = useDepartmentSectionAsync(() => resultAnalysisService.getAll(deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<ResultAnalysis | null>(null)
  const [form, setForm]           = useState<Form>(blank)
  const deleteDialog              = useConfirmDialog()
  const { page, setPage, limit, data: paginated } = usePagination(data)

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.batch.trim()) { toast.error('Batch is required'); return }

    const entry: Omit<ResultAnalysis, 'id'> = {
      deptId:        deptId!,
      title:         form.title.trim(),
      semester:      form.semester,
      batch:         form.batch.trim(),
      pdfUrl:        form.pdfUrl || undefined,
      graphImageUrl: form.graphImageUrl || undefined,
      uploadedAt:    new Date().toISOString(),
    }

    try {
      if (editItem) {
        await resultAnalysisService.update(editItem.id, entry)
        toast.success('Result updated')
      } else {
        await resultAnalysisService.create(entry)
        toast.success('Result added')
      }
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await resultAnalysisService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  function openAdd() {
    setEditItem(null); setForm(blank()); setModalOpen(true)
  }
  function openEdit(item: ResultAnalysis) {
    setEditItem(item)
    setForm({
      title:         item.title,
      semester:      item.semester,
      batch:         item.batch,
      pdfUrl:        item.pdfUrl ?? '',
      graphImageUrl: item.graphImageUrl ?? '',
    })
    setModalOpen(true)
  }

  const columns: Column<ResultAnalysis>[] = [
    {
      key: 'title', header: 'Title',
      render: r => (
        <div>
          <p className="font-medium text-sm text-slate-800">{r.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{SEMESTER_OPTIONS[r.semester - 1]} · {r.batch}</p>
        </div>
      ),
    },
    {
      key: 'semester', header: 'Semester',
      render: r => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
          Sem {r.semester}
        </span>
      ),
    },
    {
      key: 'batch', header: 'Batch',
      render: r => <span className="text-sm text-slate-600">{r.batch}</span>,
    },
    {
      key: 'pdfUrl', header: 'Report',
      render: r => r.pdfUrl ? (
        <a href={r.pdfUrl} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium">
          <FileDown size={13} /> View PDF
        </a>
      ) : <span className="text-xs text-slate-300">—</span>,
    },
    {
      key: 'graphImageUrl', header: 'Graph',
      render: r => r.graphImageUrl ? (
        <a href={r.graphImageUrl} target="_blank" rel="noreferrer">
          <img src={r.graphImageUrl} alt="graph"
            className="w-12 h-8 object-cover rounded border border-slate-200 hover:opacity-80 transition-opacity" />
        </a>
      ) : <span className="text-xs text-slate-300">—</span>,
    },
    {
      key: 'actions', header: '', className: 'w-16',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <Edit2 size={14} />
          </button>
          <button onClick={() => deleteDialog.open(r.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
          <h3 className="text-base font-display font-bold text-slate-800">Result Analysis</h3>
          <p className="text-sm text-slate-500">{data.length} record{data.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Result Analysis
        </button>
      </div>

      <div className="card">
        <DataTable columns={columns} data={paginated} keyExtractor={r => r.id}
          total={data.length} page={page} limit={limit} onPageChange={setPage}
          emptyTitle="No results yet"
          emptyDescription="Add result analysis records using the button above." />
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Result Analysis' : 'Add Result Analysis'} size="lg">
        <div className="space-y-5">

          {/* Title */}
          <FormField label="Title" required>
            <input className="input-field" placeholder="e.g. 4th Semester Result Analysis"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </FormField>

          {/* Semester + Batch */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Semester" required>
              <select className="input-field" value={form.semester}
                onChange={e => set('semester', Number(e.target.value))}>
                {SEMESTER_OPTIONS.map((label, i) => (
                  <option key={i + 1} value={i + 1}>{label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Batch" required>
              <input className="input-field" placeholder="e.g. 2022–2026"
                value={form.batch} onChange={e => set('batch', e.target.value)} />
            </FormField>
          </div>

          {/* PDF upload */}
          <FormField label="Result Analysis PDF">
            <PdfUploader value={form.pdfUrl} onChange={v => set('pdfUrl', v)} deptId={deptId!} />
          </FormField>

          {/* Graph image upload */}
          <FormField label="Result Analysis Graph / Chart">
            <ImageUploader value={form.graphImageUrl} onChange={v => set('graphImageUrl', v)} deptId={deptId!} />
          </FormField>

        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            {editItem ? 'Save Changes' : 'Save'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Result"
        message="This result analysis record will be permanently deleted."
        confirmLabel="Delete" />
    </div>
  )
}
