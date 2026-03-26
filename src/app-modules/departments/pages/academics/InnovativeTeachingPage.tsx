import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { innovativeTeachingService } from '@/app-modules/departments/api/deptAcademicsApi'
import type { InnovativeTeaching } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import SearchBar from '@/shared/components/filters/SearchBar'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'
import { useSearch } from '@/shared/hooks/useSearch'

const emptyForm: Omit<InnovativeTeaching, 'id' | 'deptId'> = { facultyName: '', method: '', description: '', courseApplied: '', year: String(new Date().getFullYear()), outcome: '' }

export default function InnovativeTeachingPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast = useToast()
  const { data, reload } = useDepartmentSectionAsync(() => innovativeTeachingService.getAll(deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<InnovativeTeaching | null>(null)
  const [form, setForm] = useState<Omit<InnovativeTeaching, 'id' | 'deptId'>>(emptyForm)
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => data.filter(t => {
    const q = debouncedSearch.toLowerCase()
    return !q || t.facultyName.toLowerCase().includes(q) || t.method.toLowerCase().includes(q) || t.courseApplied.toLowerCase().includes(q)
  }), [data, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleSave() {
    if (!form.facultyName || !form.method) { toast.error('Faculty and method are required'); return }
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

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (item: InnovativeTeaching) => { setEditItem(item); setForm({ facultyName: item.facultyName, method: item.method, description: item.description, courseApplied: item.courseApplied, year: item.year, outcome: item.outcome }); setModalOpen(true) }

  const columns: Column<InnovativeTeaching>[] = [
    { key: 'facultyName', header: 'Faculty', render: r => <span className="font-medium text-sm">{r.facultyName}</span> },
    { key: 'method', header: 'Method', render: r => <span className="font-medium text-sm text-brand-700">{r.method}</span> },
    { key: 'courseApplied', header: 'Course', render: r => <span className="text-sm">{r.courseApplied}</span> },
    { key: 'year', header: 'Year', render: r => <span className="text-sm">{r.year}</span> },
    { key: 'outcome', header: 'Outcome', render: r => <span className="text-sm text-slate-500 line-clamp-2">{r.outcome}</span> },
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
        <div><h3 className="text-base font-display font-bold text-slate-800">Innovative Teaching Methods</h3><p className="text-sm text-slate-500">{data.length} records</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Add</button>
      </div>
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search by faculty, method, or course..." className="max-w-sm" />
        </div>
        <DataTable columns={columns} data={paginated} keyExtractor={r => r.id} total={filtered.length} page={page} limit={limit} onPageChange={setPage} emptyTitle="No records yet" />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Record' : 'Add Innovative Teaching Method'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Faculty Name" required><input className="input-field" value={form.facultyName} onChange={e => setForm(f => ({ ...f, facultyName: e.target.value }))} /></FormField>
            <FormField label="Method" required><input className="input-field" placeholder="e.g. Flipped Classroom" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} /></FormField>
            <FormField label="Course Applied"><input className="input-field" value={form.courseApplied} onChange={e => setForm(f => ({ ...f, courseApplied: e.target.value }))} /></FormField>
            <FormField label="Year"><input className="input-field" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} /></FormField>
          </div>
          <FormField label="Description"><textarea className="input-field h-20 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></FormField>
          <FormField label="Outcome"><textarea className="input-field h-20 resize-none" value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} /></FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add'}</button>
        </ModalFooter>
      </Modal>
      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete} title="Delete Record" message="This record will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}
