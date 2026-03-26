import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { deptCourseService } from '@/app-modules/departments/api/deptAcademicsApi'
import type { DeptCourse } from '@/shared/types/models'
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

const emptyForm: Omit<DeptCourse, 'id' | 'deptId'> = { code: '', name: '', semester: 1, credits: 3, type: 'theory', scheme: '' }
const typeColor = { theory: 'blue', lab: 'purple', elective: 'yellow' } as const
const semesterOptions = [1,2,3,4,5,6,7,8].map(s => ({ value: String(s), label: `Semester ${s}` }))

export default function CoursesPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast = useToast()
  const { data, reload } = useDepartmentSectionAsync(() => deptCourseService.getAll(deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<DeptCourse | null>(null)
  const [form, setForm] = useState<Omit<DeptCourse, 'id' | 'deptId'>>(emptyForm)
  const [semFilter, setSemFilter] = useState('')
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => data.filter(c => {
    const q = debouncedSearch.toLowerCase()
    return (
      (!q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) &&
      (!semFilter || c.semester === Number(semFilter))
    )
  }), [data, debouncedSearch, semFilter])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleSave() {
    if (!form.code || !form.name) { toast.error('Code and name are required'); return }
    try {
      if (editItem) {
        await deptCourseService.update(editItem.id, form)
        toast.success('Updated')
      } else {
        await deptCourseService.create({ ...form, deptId: deptId! })
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
      await deptCourseService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (item: DeptCourse) => { setEditItem(item); setForm({ code: item.code, name: item.name, semester: item.semester, credits: item.credits, type: item.type, scheme: item.scheme }); setModalOpen(true) }

  const columns: Column<DeptCourse>[] = [
    { key: 'code', header: 'Code', render: r => <span className="font-mono font-semibold text-sm text-brand-700">{r.code}</span> },
    { key: 'name', header: 'Course Name', render: r => <span className="font-medium text-sm">{r.name}</span> },
    { key: 'semester', header: 'Sem', render: r => <span className="text-sm">{r.semester}</span> },
    { key: 'credits', header: 'Credits', render: r => <span className="text-sm">{r.credits}</span> },
    { key: 'type', header: 'Type', render: r => <Badge variant={typeColor[r.type]}>{r.type}</Badge> },
    { key: 'scheme', header: 'Scheme', render: r => <span className="text-sm text-slate-500">{r.scheme}</span> },
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
        <div><h3 className="text-base font-display font-bold text-slate-800">Courses</h3><p className="text-sm text-slate-500">{data.length} courses</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Add Course</button>
      </div>
      <div className="card">
        <div className="p-4 border-b border-slate-100 flex gap-3">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search courses..." className="flex-1" />
          <SelectFilter value={semFilter} onChange={v => { setSemFilter(v); resetPage() }} options={semesterOptions} placeholder="All Semesters" className="w-40" />
        </div>
        <DataTable columns={columns} data={paginated} keyExtractor={r => r.id} total={filtered.length} page={page} limit={limit} onPageChange={setPage} emptyTitle="No courses yet" />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Course' : 'Add Course'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course Code" required><input className="input-field font-mono" placeholder="e.g. CS601" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></FormField>
            <FormField label="Type">
              <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DeptCourse['type'] }))}>
                <option value="theory">Theory</option><option value="lab">Lab</option><option value="elective">Elective</option>
              </select>
            </FormField>
          </div>
          <FormField label="Course Name" required><input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Semester">
              <select className="input-field" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: Number(e.target.value) }))}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Credits"><input type="number" className="input-field" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: Number(e.target.value) }))} /></FormField>
            <FormField label="Scheme"><input className="input-field" placeholder="e.g. 2021" value={form.scheme} onChange={e => setForm(f => ({ ...f, scheme: e.target.value }))} /></FormField>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add Course'}</button>
        </ModalFooter>
      </Modal>
      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete} title="Delete Course" message="This course will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}
