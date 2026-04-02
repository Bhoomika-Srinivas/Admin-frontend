import { useState, useMemo, useEffect } from 'react'
import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, FileText, ExternalLink, Download, X, Images } from 'lucide-react'
import { innovativeTeachingService } from '@/app-modules/departments/api/deptAcademicsApi'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import type { InnovativeTeaching, Faculty, FacultyRef } from '@/shared/types/models'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import SearchBar from '@/shared/components/filters/SearchBar'
import FacultyCombobox from '@/app-modules/departments/components/FacultyCombobox'
import EventImageGrid from '@/app-modules/events/components/EventImageGrid'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'
import { useSearch } from '@/shared/hooks/useSearch'

// ── PDF Uploader ───────────────────────────────────────────────────────────────

function PdfUploader({ value, onChange, deptId }: { value?: string; onChange: (url: string) => void; deptId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const url = await uploadToS3(file, 'dept-academics', deptId)
      onChange(url)
    } catch {
      // upload failed
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <FileText size={18} className="text-brand-500 shrink-0" />
        <span className="flex-1 text-sm text-slate-600 truncate">PDF uploaded</span>
        <a href={value} target="_blank" rel="noreferrer"
          className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1">
          <ExternalLink size={12} /> View
        </a>
        <a href={value} download
          className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1">
          <Download size={12} /> Download
        </a>
        <button type="button" onClick={() => onChange('')} className="text-slate-400 hover:text-red-500 ml-1">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
      <button type="button" onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition-colors w-full justify-center">
        <FileText size={15} /> Upload PDF
      </button>
    </div>
  )
}

// ── Multi-Faculty Picker ───────────────────────────────────────────────────────

function MultiFacultyPicker({
  selected,
  facultyList,
  allFaculty,
  onChange,
}: {
  selected: FacultyRef[]
  facultyList: Faculty[]
  allFaculty: Faculty[]
  onChange: (v: FacultyRef[]) => void
}) {
  const [comboValue, setComboValue] = useState('')

  function handleAdd(id: string) {
    if (!id || selected.some(f => f.facultyId === id)) return
    const faculty = allFaculty.find(f => f.id === id)
    if (!faculty) return
    onChange([...selected, { facultyId: id, facultyName: faculty.name }])
    setComboValue('')
  }

  function handleRemove(facultyId: string) {
    onChange(selected.filter(f => f.facultyId !== facultyId))
  }

  const available = facultyList.filter(f => !selected.some(s => s.facultyId === f.id))

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(f => (
            <span key={f.facultyId}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 text-sm rounded-lg border border-brand-100">
              {f.facultyName}
              <button type="button" onClick={() => handleRemove(f.facultyId)}
                className="text-brand-400 hover:text-brand-700">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      {available.length > 0 && (
        <FacultyCombobox
          facultyList={available}
          value={comboValue}
          onChange={handleAdd}
        />
      )}
      {available.length === 0 && selected.length > 0 && (
        <p className="text-xs text-slate-400">All faculty in this department have been added.</p>
      )}
    </div>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────────

type FormData = Omit<InnovativeTeaching, 'id' | 'deptId'>

const emptyForm = (): FormData => ({
  faculties: [],
  description: '',
  imageUrls: [],
  pdfUrl: '',
})

// ── Page ───────────────────────────────────────────────────────────────────────

export default function InnovativeTeachingPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast = useToast()
  const dept = useDeptContext()

  const { data, reload } = useDepartmentSectionAsync(() => innovativeTeachingService.getAll(deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<InnovativeTeaching | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const [allFaculty, setAllFaculty] = useState<Faculty[]>([])
  useEffect(() => {
    facultyService.getAll().then(setAllFaculty).catch(() => setAllFaculty([]))
  }, [])

  const facultyList = useMemo(
    () => allFaculty.filter(f => f.department === dept.shortName && f.status === 'active'),
    [allFaculty, dept.shortName],
  )

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  const filtered = useMemo(() => data.filter(t => {
    const q = debouncedSearch.toLowerCase()
    const names = t.faculties.map(f => f.facultyName.toLowerCase()).join(' ')
    return !q || names.includes(q) || t.description.toLowerCase().includes(q)
  }), [data, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleSave() {
    if (form.faculties.length === 0) { toast.error('Please select at least one faculty member'); return }
    try {
      if (editItem) {
        await innovativeTeachingService.update(editItem.id, form)
        toast.success('Updated')
      } else {
        await innovativeTeachingService.create({ ...form, deptId: deptId! })
        toast.success('Added')
      }
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await innovativeTeachingService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm()); setModalOpen(true) }
  const openEdit = (item: InnovativeTeaching) => {
    setEditItem(item)
    setForm({
      faculties:   item.faculties ?? [],
      description: item.description,
      imageUrls:   item.imageUrls ?? [],
      pdfUrl:      item.pdfUrl ?? '',
    })
    setModalOpen(true)
  }

  const columns: Column<InnovativeTeaching>[] = [
    {
      key: 'faculties', header: 'Faculty',
      render: r => (
        <div className="flex flex-wrap gap-1">
          {r.faculties.map(f => (
            <span key={f.facultyId} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
              {f.facultyName}
            </span>
          ))}
        </div>
      ),
    },
    { key: 'description', header: 'Description', render: r => <span className="text-sm text-slate-500 line-clamp-2">{r.description}</span> },
    {
      key: 'imageUrls', header: 'Media',
      render: r => (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {(r.imageUrls?.length ?? 0) > 0 && <span className="flex items-center gap-1"><Images size={12} />{r.imageUrls!.length}</span>}
          {r.pdfUrl && <span className="flex items-center gap-1"><FileText size={12} />PDF</span>}
        </div>
      ),
    },
    {
      key: 'actions', header: '', className: 'w-16',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={14} /></button>
          <button onClick={() => deleteDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">Innovative Teaching Methods</h3>
          <p className="text-sm text-slate-500">{data.length} records</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Add</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }}
            placeholder="Search by faculty or description..." className="max-w-sm" />
        </div>
        <DataTable columns={columns} data={paginated} keyExtractor={r => r.id}
          total={filtered.length} page={page} limit={limit} onPageChange={setPage}
          emptyTitle="No records yet" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Record' : 'Add Innovative Teaching Method'} size="lg">
        <div className="space-y-4">
          <FormField label="Faculty" required>
            <MultiFacultyPicker
              selected={form.faculties}
              facultyList={facultyList}
              allFaculty={allFaculty}
              onChange={v => set('faculties', v)}
            />
          </FormField>

          <FormField label="Description">
            <textarea className="input-field h-24 resize-none" value={form.description}
              onChange={e => set('description', e.target.value)} />
          </FormField>

          <EventImageGrid
            images={form.imageUrls ?? []}
            onChange={imgs => set('imageUrls', imgs)}
            deptId={deptId!}
          />

          <FormField label="PDF Document">
            <PdfUploader
              value={form.pdfUrl}
              onChange={url => set('pdfUrl', url)}
              deptId={deptId!}
            />
          </FormField>
        </div>

        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Record"
        message="This record will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}
