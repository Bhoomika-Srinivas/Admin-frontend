import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, FileDown } from 'lucide-react'
import { timetableService } from '@/app-modules/departments/api/deptAcademicsApi'
import type { DeptTimetable } from '@/shared/types/models'
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

const now = new Date()
const emptyForm: Omit<DeptTimetable, 'id' | 'deptId'> = { section: '', semester: 1, academicYear: `${now.getFullYear()}-${now.getFullYear() + 1}`, fileUrl: '', uploadedAt: '' }

export default function TimetablePage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast = useToast()
  const { data, reload } = useDepartmentSectionAsync(() => timetableService.getAll(deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<DeptTimetable | null>(null)
  const [form, setForm] = useState<Omit<DeptTimetable, 'id' | 'deptId'>>(emptyForm)
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => data.filter(t => {
    const q = debouncedSearch.toLowerCase()
    return !q || t.section.toLowerCase().includes(q) || t.academicYear.includes(q)
  }), [data, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleSave() {
    if (!form.section) { toast.error('Section is required'); return }
    const entry = { ...form, uploadedAt: new Date().toISOString() }
    try {
      if (editItem) {
        await timetableService.update(editItem.id, entry)
        toast.success('Updated')
      } else {
        await timetableService.create({ ...entry, deptId: deptId! })
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
      await timetableService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (item: DeptTimetable) => { setEditItem(item); setForm({ section: item.section, semester: item.semester, academicYear: item.academicYear, fileUrl: item.fileUrl ?? '', uploadedAt: item.uploadedAt }); setModalOpen(true) }

  const columns: Column<DeptTimetable>[] = [
    { key: 'section', header: 'Section', render: r => <span className="font-semibold text-sm">{r.section}</span> },
    { key: 'semester', header: 'Semester', render: r => <span className="text-sm">Sem {r.semester}</span> },
    { key: 'academicYear', header: 'Academic Year', render: r => <span className="text-sm">{r.academicYear}</span> },
    { key: 'uploadedAt', header: 'Updated', render: r => <span className="text-xs text-slate-400">{r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : '—'}</span> },
    {
      key: 'actions', header: '', className: 'w-24',
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
        <div><h3 className="text-base font-display font-bold text-slate-800">Timetable (Section-wise)</h3><p className="text-sm text-slate-500">{data.length} entries</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Add Timetable</button>
      </div>
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search by section or year..." className="max-w-sm" />
        </div>
        <DataTable columns={columns} data={paginated} keyExtractor={r => r.id} total={filtered.length} page={page} limit={limit} onPageChange={setPage} emptyTitle="No timetables yet" />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Timetable' : 'Add Timetable'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Section" required><input className="input-field" placeholder="e.g. A, B, C" value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} /></FormField>
            <FormField label="Semester">
              <select className="input-field" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: Number(e.target.value) }))}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Academic Year"><input className="input-field" placeholder="e.g. 2024-2025" value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} /></FormField>
          <FormField label="File URL (PDF)"><input className="input-field" placeholder="https://..." value={form.fileUrl ?? ''} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} /></FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add'}</button>
        </ModalFooter>
      </Modal>
      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete} title="Delete Timetable" message="This timetable entry will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}
