import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { adminProgramService, adminDeptService, adminCourseService } from '@/app-modules/departments/api/adminCoursesApi'
import type { AdminCourse, Faculty } from '@/shared/types/models'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import Badge from '@/shared/components/common/Badge'
import CatalogBreadcrumb from '@/app-modules/departments/components/CatalogBreadcrumb'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import clsx from 'clsx'

type CourseType = AdminCourse['type']

const TYPE_BADGE: Record<CourseType, 'blue' | 'green' | 'yellow' | 'purple' | 'gray'> = {
  Theory:   'blue',
  Lab:      'green',
  Elective: 'yellow',
  Project:  'purple',
  Seminar:  'gray',
}

type Form = Omit<AdminCourse, 'id' | 'programId' | 'departmentId' | 'semesterNumber' | 'batchYear'>

const blank = (): Form => ({
  code: '', name: '', type: 'Theory', credits: 3, hoursPerWeek: 3, facultyId: '',
})

export default function AdminCourseListPage() {
  const { programId, deptId, semester, batch } = useParams<{
    programId: string; deptId: string; semester: string; batch: string
  }>()
  const sem       = Number(semester)
  const batchYear = decodeURIComponent(batch!)
  const { user }  = useAuth()
  const toast     = useToast()

  const program = adminProgramService.getById(programId!)
  const dept    = adminDeptService.getById(deptId!)

  const [allFaculty, setAllFaculty] = useState<Faculty[]>([])

  useEffect(() => { facultyService.getAll().then(setAllFaculty).catch(() => {}) }, [])

  const [courses, setCourses] = useState(() =>
    adminCourseService.getByCourse(programId!, deptId!, sem, batchYear)
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<AdminCourse | null>(null)
  const [form, setForm]           = useState<Form>(blank)
  const deleteDialog              = useConfirmDialog()

  function reload() {
    setCourses(adminCourseService.getByCourse(programId!, deptId!, sem, batchYear))
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.code.trim() || !form.name.trim()) { toast.error('Code and name are required'); return }
    if (editItem) {
      adminCourseService.update(editItem.id, form, user)
      toast.success('Course updated')
    } else {
      adminCourseService.create({
        ...form,
        programId: programId!,
        departmentId: deptId!,
        semesterNumber: sem,
        batchYear,
        facultyId: form.facultyId || undefined,
      }, user)
      toast.success('Course added')
    }
    reload(); setModalOpen(false)
  }

  function handleDelete() {
    if (!deleteDialog.targetId) return
    adminCourseService.delete(deleteDialog.targetId, user)
    reload(); deleteDialog.close(); toast.success('Deleted')
  }

  function openAdd() { setEditItem(null); setForm(blank()); setModalOpen(true) }
  function openEdit(c: AdminCourse) {
    setEditItem(c)
    setForm({ code: c.code, name: c.name, type: c.type, credits: c.credits, hoursPerWeek: c.hoursPerWeek, facultyId: c.facultyId ?? '' })
    setModalOpen(true)
  }

  // Totals
  const totalCredits = courses.reduce((s, c) => s + c.credits, 0)
  const totalHours   = courses.reduce((s, c) => s + c.hoursPerWeek, 0)

  const getFacultyName = (id?: string) => id ? (allFaculty.find(f => f.id === id)?.name ?? '—') : '—'

  const columns: Column<AdminCourse>[] = [
    {
      key: 'code', header: '#',
      render: r => <span className="text-xs text-slate-400">{courses.indexOf(r) + 1}</span>,
    },
    {
      key: 'code', header: 'Code',
      render: r => (
        <span className={clsx(
          'font-mono text-xs font-semibold px-1.5 py-0.5 rounded',
          TYPE_BADGE[r.type] === 'blue'   && 'bg-blue-50 text-blue-700',
          TYPE_BADGE[r.type] === 'green'  && 'bg-emerald-50 text-emerald-700',
          TYPE_BADGE[r.type] === 'yellow' && 'bg-amber-50 text-amber-700',
          TYPE_BADGE[r.type] === 'purple' && 'bg-purple-50 text-purple-700',
          TYPE_BADGE[r.type] === 'gray'   && 'bg-slate-100 text-slate-600',
        )}>
          {r.code}
        </span>
      ),
    },
    {
      key: 'name', header: 'Course Name',
      render: r => <span className="font-medium text-sm text-slate-800">{r.name}</span>,
    },
    {
      key: 'type', header: 'Type',
      render: r => <Badge variant={TYPE_BADGE[r.type]}>{r.type}</Badge>,
    },
    { key: 'credits',     header: 'Credits',    render: r => <span className="text-sm">{r.credits}</span> },
    { key: 'hoursPerWeek', header: 'Hrs/Week',  render: r => <span className="text-sm">{r.hoursPerWeek}</span> },
    {
      key: 'facultyId', header: 'Faculty',
      render: r => <span className="text-sm text-slate-500">{getFacultyName(r.facultyId)}</span>,
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
      <CatalogBreadcrumb items={[
        { label: program?.name ?? programId!,  to: `/academics/catalog/${programId}` },
        { label: dept?.shortName ?? deptId!,   to: `/academics/catalog/${programId}/${deptId}` },
        { label: `Sem ${semester}`,            to: `/academics/catalog/${programId}/${deptId}/${semester}` },
        { label: batchYear },
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">
            {dept?.shortName} · Sem {semester} · {batchYear}
          </h2>
          <p className="text-sm text-slate-500">
            {courses.length} courses · {totalCredits} credits · {totalHours} hrs/week
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Course
        </button>
      </div>

      {/* Stats row */}
      {courses.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Courses', value: courses.length,  color: 'text-brand-600' },
            { label: 'Total Credits', value: totalCredits,    color: 'text-emerald-600' },
            { label: 'Hours / Week',  value: totalHours,      color: 'text-purple-600' },
            { label: 'Theory',        value: courses.filter(c => c.type === 'Theory').length, color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <DataTable
          columns={columns}
          data={courses}
          keyExtractor={r => r.id}
          total={courses.length}
          emptyTitle="No courses yet"
          emptyDescription="Add courses to this semester and batch using the button above."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Course' : 'Add Course'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course Code" required>
              <input className="input-field font-mono uppercase" value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="e.g. CS601" />
            </FormField>
            <FormField label="Type">
              <select className="input-field" value={form.type}
                onChange={e => set('type', e.target.value as CourseType)}>
                {(['Theory', 'Lab', 'Elective', 'Project', 'Seminar'] as CourseType[]).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Course Name" required>
            <input className="input-field" value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Data Structures & Algorithms" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Credits">
              <input type="number" className="input-field" min={1} max={10}
                value={form.credits} onChange={e => set('credits', Number(e.target.value))} />
            </FormField>
            <FormField label="Hours per Week">
              <input type="number" className="input-field" min={1} max={20}
                value={form.hoursPerWeek} onChange={e => set('hoursPerWeek', Number(e.target.value))} />
            </FormField>
          </div>
          <FormField label="Faculty (optional)">
            <select className="input-field" value={form.facultyId ?? ''}
              onChange={e => set('facultyId', e.target.value)}>
              <option value="">— Unassigned —</option>
              {allFaculty.filter(f => f.status === 'active').map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
              ))}
            </select>
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            {editItem ? 'Save Changes' : 'Add Course'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Course"
        message="This course will be permanently deleted."
        confirmLabel="Delete" />
    </div>
  )
}
