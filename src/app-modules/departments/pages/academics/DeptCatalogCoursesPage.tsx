import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { deptCourseService } from '@/app-modules/departments/api/deptAcademicsApi'
import { adminProgramService } from '@/app-modules/departments/api/adminCoursesApi'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import type { DeptCourse } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import Badge from '@/shared/components/common/Badge'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'
import { useSearch } from '@/shared/hooks/useSearch'

const TYPE_BADGE: Record<DeptCourse['type'], 'blue' | 'purple' | 'yellow'> = {
  theory: 'blue', lab: 'purple', elective: 'yellow',
}

const emptyForm = (): Omit<DeptCourse, 'id' | 'deptId' | 'semester'> => ({
  code: '', name: '', type: 'theory', credits: 3, scheme: '',
})

export default function DeptCatalogCoursesPage() {
  const { deptId, programId, semester, batch } = useParams<{
    deptId: string; programId: string; semester: string; batch: string
  }>()
  const sem       = Number(semester)
  const batchYear = decodeURIComponent(batch!)
  const navigate  = useNavigate()
  const toast     = useToast()
  const dept      = useDeptContext()
  const program   = adminProgramService.getById(programId!)

  const { data: allCourses, reload } = useDepartmentSectionAsync(
    () => deptCourseService.getAll(deptId!)
  )

  // Filter to this semester client-side
  const semesterCourses = useMemo(
    () => allCourses.filter(c => c.semester === sem),
    [allCourses, sem]
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<DeptCourse | null>(null)
  const [form, setForm]           = useState(emptyForm)
  const [typeFilter, setTypeFilter] = useState('')
  const deleteDialog              = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => semesterCourses.filter(c => {
    const q = debouncedSearch.toLowerCase()
    return (
      (!q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) &&
      (!typeFilter || c.type === typeFilter)
    )
  }), [semesterCourses, debouncedSearch, typeFilter])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Code and name are required')
      return
    }
    try {
      if (editItem) {
        await deptCourseService.update(editItem.id, form)
        toast.success('Course updated')
      } else {
        await deptCourseService.create({ ...form, deptId: deptId!, semester: sem })
        toast.success('Course added')
      }
      reload()
      setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await deptCourseService.delete(deleteDialog.targetId)
      reload()
      deleteDialog.close()
      toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  function openAdd() { setEditItem(null); setForm(emptyForm()); setModalOpen(true) }
  function openEdit(c: DeptCourse) {
    setEditItem(c)
    setForm({ code: c.code, name: c.name, type: c.type, credits: c.credits, scheme: c.scheme })
    setModalOpen(true)
  }

  const totalCredits = semesterCourses.reduce((s, c) => s + c.credits, 0)

  const columns: Column<DeptCourse>[] = [
    { key: 'index',   header: '#',           render: r => <span className="text-xs text-slate-400">{semesterCourses.indexOf(r) + 1}</span> },
    { key: 'code',    header: 'Code',         render: r => <span className="font-mono text-xs font-semibold text-brand-700">{r.code}</span> },
    { key: 'name',    header: 'Course Name',  render: r => <span className="font-medium text-sm">{r.name}</span> },
    { key: 'type',    header: 'Type',         render: r => <Badge variant={TYPE_BADGE[r.type]}>{r.type}</Badge> },
    { key: 'credits', header: 'Credits',      render: r => <span className="text-sm">{r.credits}</span> },
    { key: 'scheme',  header: 'Scheme',       render: r => <span className="text-sm text-slate-500">{r.scheme}</span> },
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

  const semBase = `/departments/${deptId}/academics/courses/${programId}/${semester}`

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm flex-wrap">
        <button onClick={() => navigate(`/departments/${deptId}/academics/courses`)}
          className="text-slate-500 hover:text-brand-600">Courses</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(`/departments/${deptId}/academics/courses/${programId}`)}
          className="text-slate-500 hover:text-brand-600">{program?.name}</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(semBase)} className="text-slate-500 hover:text-brand-600">
          Semester {semester}
        </button>
        <span className="text-slate-300">›</span>
        <span className="text-slate-700 font-medium">{batchYear}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">
            {dept.shortName} · Sem {semester} · {batchYear}
          </h3>
          <p className="text-sm text-slate-500">
            {semesterCourses.length} courses · {totalCredits} credits
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Course
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <SearchBar
            value={searchTerm}
            onChange={v => { setSearchTerm(v); resetPage() }}
            placeholder="Search courses..."
            className="max-w-xs"
          />
          <SelectFilter
            value={typeFilter}
            onChange={v => { setTypeFilter(v); resetPage() }}
            options={[
              { value: 'theory', label: 'Theory' },
              { value: 'lab', label: 'Lab' },
              { value: 'elective', label: 'Elective' },
            ]}
            placeholder="All Types"
            className="w-36"
          />
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={r => r.id}
          total={filtered.length}
          page={page}
          limit={limit}
          onPageChange={setPage}
          emptyTitle="No courses yet"
          emptyDescription="Add courses using the button above."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Course' : 'Add Course'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course Code" required>
              <input className="input-field font-mono uppercase" value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. CS601" />
            </FormField>
            <FormField label="Type">
              <select className="input-field" value={form.type}
                onChange={e => set('type', e.target.value as DeptCourse['type'])}>
                <option value="theory">Theory</option>
                <option value="lab">Lab</option>
                <option value="elective">Elective</option>
              </select>
            </FormField>
          </div>
          <FormField label="Course Name" required>
            <input className="input-field" value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="e.g. Data Structures & Algorithms" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Credits">
              <input type="number" className="input-field" min={1} max={10}
                value={form.credits} onChange={e => set('credits', Number(e.target.value))} />
            </FormField>
            <FormField label="Scheme">
              <input className="input-field" value={form.scheme}
                onChange={e => set('scheme', e.target.value)} placeholder="e.g. 2021" />
            </FormField>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add Course'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Course"
        message="This course will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}
