import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, FileDown } from 'lucide-react'
import { learningMaterialService } from '@/app-modules/departments/api/deptAcademicsApi'
import type { LearningMaterial } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import Badge from '@/shared/components/common/Badge'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'
import { useSearch } from '@/shared/hooks/useSearch'

const emptyForm: Omit<LearningMaterial, 'id' | 'deptId'> = { courseCode: '', courseName: '', title: '', type: 'notes', fileUrl: '', uploadedBy: '', uploadedAt: '' }
const typeOptions = [
  { value: 'ppt', label: 'PPT / Slides' }, { value: 'notes', label: 'Notes' },
  { value: 'pyq', label: 'PYQ' }, { value: 'model_qp', label: 'Model QP' },
  { value: 'lab_manual', label: 'Lab Manual' }, { value: 'reference', label: 'Reference' },
  { value: 'assignment', label: 'Assignment' }, { value: 'other', label: 'Other' },
]
const typeColor: Record<string, 'blue' | 'yellow' | 'purple' | 'green' | 'red' | 'gray'> = {
  ppt: 'red', notes: 'blue', pyq: 'purple', model_qp: 'purple',
  lab_manual: 'green', reference: 'green', assignment: 'yellow', other: 'gray',
}

export default function LearningMaterialsPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast = useToast()
  const { data, reload } = useDepartmentSectionAsync(() => learningMaterialService.getAll(deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<LearningMaterial | null>(null)
  const [form, setForm] = useState<Omit<LearningMaterial, 'id' | 'deptId'>>(emptyForm)
  const [typeFilter, setTypeFilter] = useState('')
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => data.filter(m => {
    const q = debouncedSearch.toLowerCase()
    return (
      (!q || m.title.toLowerCase().includes(q) || m.courseCode.toLowerCase().includes(q) || m.courseName.toLowerCase().includes(q)) &&
      (!typeFilter || m.type === typeFilter)
    )
  }), [data, debouncedSearch, typeFilter])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleSave() {
    if (!form.title || !form.courseCode) { toast.error('Title and course code are required'); return }
    const entry = { ...form, uploadedAt: new Date().toISOString() }
    try {
      if (editItem) {
        await learningMaterialService.update(editItem.id, entry)
        toast.success('Updated')
      } else {
        await learningMaterialService.create({ ...entry, deptId: deptId! })
        toast.success('Uploaded')
      }
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await learningMaterialService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (item: LearningMaterial) => { setEditItem(item); setForm({ courseCode: item.courseCode, courseName: item.courseName, title: item.title, type: item.type, fileUrl: item.fileUrl, uploadedBy: item.uploadedBy, uploadedAt: item.uploadedAt }); setModalOpen(true) }

  const columns: Column<LearningMaterial>[] = [
    { key: 'title', header: 'Material', render: r => <div><p className="font-medium text-sm">{r.title}</p><p className="text-xs text-slate-400">{r.courseCode} · {r.courseName}</p></div> },
    { key: 'type', header: 'Type', render: r => <Badge variant={typeColor[r.type]}>{r.type.replace('_', ' ')}</Badge> },
    { key: 'uploadedBy', header: 'Uploaded By', render: r => <span className="text-sm">{r.uploadedBy}</span> },
    { key: 'uploadedAt', header: 'Date', render: r => <span className="text-xs text-slate-400">{r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : '—'}</span> },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1">
          {r.fileUrl && <a href={r.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg"><FileDown size={14} /></a>}
          <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={14} /></button>
          <button onClick={() => deleteDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h3 className="text-base font-display font-bold text-slate-800">Learning Materials</h3><p className="text-sm text-slate-500">{data.length} files</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Upload Material</button>
      </div>
      <div className="card">
        <div className="p-4 border-b border-slate-100 flex gap-3">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search materials..." className="flex-1" />
          <SelectFilter value={typeFilter} onChange={v => { setTypeFilter(v); resetPage() }} options={typeOptions} placeholder="All Types" className="w-40" />
        </div>
        <DataTable columns={columns} data={paginated} keyExtractor={r => r.id} total={filtered.length} page={page} limit={limit} onPageChange={setPage} emptyTitle="No materials yet" />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Material' : 'Upload Learning Material'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course Code" required><input className="input-field font-mono" placeholder="e.g. CS601" value={form.courseCode} onChange={e => setForm(f => ({ ...f, courseCode: e.target.value }))} /></FormField>
            <FormField label="Course Name"><input className="input-field" value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} /></FormField>
          </div>
          <FormField label="Title" required><input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></FormField>
          <FormField label="Type">
            <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as LearningMaterial['type'] }))}>
              <option value="notes">Notes</option><option value="assignment">Assignment</option><option value="question_paper">Question Paper</option><option value="reference">Reference</option>
            </select>
          </FormField>
          <FormField label="File URL"><input className="input-field" placeholder="https://..." value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} /></FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Upload'}</button>
        </ModalFooter>
      </Modal>
      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete} title="Delete Material" message="This file will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}
