import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { admissionsService } from '../api/admissionsApi'
import { usePrograms, useUGCourses, usePGCourses } from '../hooks/useAdmissions'
import type { AdmissionsProgram, UGCourse, PGCourse } from '@/shared/types/models'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'

type LevelTab = 'UG' | 'PG'

// ─── UG Courses Table ─────────────────────────────────────────────────────────

function UGCoursesTable() {
  const toast = useToast()
  const { data: courses, loading, reload } = useUGCourses()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<UGCourse | null>(null)
  const [form, setForm]           = useState<Omit<UGCourse, 'id'>>({ name: '', code: '', duration: '', seats: 0, description: '', order: 0 })
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const deleteDialog = useConfirmDialog()

  function openAdd()            { setEditItem(null); setForm({ name: '', code: '', duration: '', seats: 0, description: '', order: courses.length + 1 }); setErrors({}); setModalOpen(true) }
  function openEdit(r: UGCourse) { setEditItem(r); setForm({ name: r.name, code: r.code, duration: r.duration, seats: r.seats, description: r.description, order: r.order }); setErrors({}); setModalOpen(true) }

  async function handleSave() {
    if (!form.name.trim()) { setErrors({ name: 'Required' }); return }
    try {
      if (editItem) await admissionsService.updateUGCourse(editItem.id, form)
      else await admissionsService.createUGCourse(form)
      reload(); setModalOpen(false); toast.success(editItem ? 'Course updated' : 'Course added')
    } catch { toast.error('Failed to save') }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await admissionsService.deleteUGCourse(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Course deleted')
    } catch { toast.error('Failed to delete') }
  }

  const totalSeats = courses.reduce((s, r) => s + r.seats, 0)

  const columns: Column<UGCourse>[] = [
    { key: 'name',     header: 'Course',    render: r => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: 'code',     header: 'Code',      render: r => <span className="text-xs text-slate-500">{r.code || '—'}</span> },
    { key: 'duration', header: 'Duration',  render: r => <span className="text-sm">{r.duration || '—'}</span> },
    { key: 'seats',    header: 'Seats',     render: r => <span className="font-semibold">{r.seats}</span>, className: 'text-center' },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)}            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={13} /></button>
          <button onClick={() => deleteDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="card">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">UG Courses</p>
            <p className="text-xs text-slate-400 mt-0.5">Total seats: <span className="font-bold text-slate-600">{totalSeats}</span></p>
          </div>
          <button onClick={openAdd} className="btn-secondary text-xs flex items-center gap-1"><Plus size={13} /> Add</button>
        </div>
        <DataTable columns={columns} data={courses} loading={loading} keyExtractor={r => r.id} emptyTitle="No UG courses added" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit UG Course' : 'Add UG Course'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course Name" required error={errors.name}>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. CSE, AI & ML" />
            </FormField>
            <FormField label="Code">
              <input className="input-field" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. CS21" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration">
              <input className="input-field" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 4 Years" />
            </FormField>
            <FormField label="Total Seats">
              <input type="number" min={0} className="input-field" value={form.seats} onChange={e => setForm(f => ({ ...f, seats: Number(e.target.value) }))} />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea className="input-field resize-none h-20" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add Course'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Course" message="This course will be removed." confirmLabel="Delete" />
    </>
  )
}

// ─── PG Courses Table ─────────────────────────────────────────────────────────

function PGCoursesTable() {
  const toast = useToast()
  const { data: courses, loading, reload } = usePGCourses()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<PGCourse | null>(null)
  const [form, setForm]           = useState<Omit<PGCourse, 'id'>>({ name: '', code: '', duration: '', seats: 0, description: '', order: 0 })
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const deleteDialog = useConfirmDialog()

  function openAdd()             { setEditItem(null); setForm({ name: '', code: '', duration: '', seats: 0, description: '', order: courses.length + 1 }); setErrors({}); setModalOpen(true) }
  function openEdit(r: PGCourse) { setEditItem(r); setForm({ name: r.name, code: r.code, duration: r.duration, seats: r.seats, description: r.description, order: r.order }); setErrors({}); setModalOpen(true) }

  async function handleSave() {
    if (!form.name.trim()) { setErrors({ name: 'Required' }); return }
    try {
      if (editItem) await admissionsService.updatePGCourse(editItem.id, form)
      else await admissionsService.createPGCourse(form)
      reload(); setModalOpen(false); toast.success(editItem ? 'Course updated' : 'Course added')
    } catch { toast.error('Failed to save') }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await admissionsService.deletePGCourse(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Course deleted')
    } catch { toast.error('Failed to delete') }
  }

  const totalSeats = courses.reduce((s, r) => s + r.seats, 0)

  const columns: Column<PGCourse>[] = [
    { key: 'name',     header: 'Course',   render: r => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: 'code',     header: 'Code',     render: r => <span className="text-xs text-slate-500">{r.code || '—'}</span> },
    { key: 'duration', header: 'Duration', render: r => <span className="text-sm">{r.duration || '—'}</span> },
    { key: 'seats',    header: 'Seats',    render: r => <span className="font-semibold">{r.seats}</span> },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)}            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={13} /></button>
          <button onClick={() => deleteDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="card">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">PG Courses</p>
            <p className="text-xs text-slate-400 mt-0.5">Total seats: <span className="font-bold text-slate-600">{totalSeats}</span></p>
          </div>
          <button onClick={openAdd} className="btn-secondary text-xs flex items-center gap-1"><Plus size={13} /> Add</button>
        </div>
        <DataTable columns={columns} data={courses} loading={loading} keyExtractor={r => r.id} emptyTitle="No PG courses added" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit PG Course' : 'Add PG Course'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course Name" required error={errors.name}>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. MCA, MBA" />
            </FormField>
            <FormField label="Code">
              <input className="input-field" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration">
              <input className="input-field" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 2 Years" />
            </FormField>
            <FormField label="Seats">
              <input type="number" min={0} className="input-field" value={form.seats} onChange={e => setForm(f => ({ ...f, seats: Number(e.target.value) }))} />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea className="input-field resize-none h-20" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add Course'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Course" message="This course will be removed." confirmLabel="Delete" />
    </>
  )
}

// ─── Programs List ────────────────────────────────────────────────────────────

function ProgramsList({ level }: { level: LevelTab }) {
  const toast = useToast()
  const { data: allPrograms, loading, reload } = usePrograms()
  const programs = allPrograms.filter(p => p.level === level)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<AdmissionsProgram | null>(null)
  const [form, setForm]           = useState<Omit<AdmissionsProgram, 'id'>>({ level, name: '', duration: '', seats: 0, description: '', eligibility: '', order: 0 })
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const deleteDialog = useConfirmDialog()

  function openAdd()                { setEditItem(null); setForm({ level, name: '', duration: '', seats: 0, description: '', eligibility: '', order: programs.length + 1 }); setErrors({}); setModalOpen(true) }
  function openEdit(p: AdmissionsProgram) { setEditItem(p); setForm({ level: p.level, name: p.name, duration: p.duration, seats: p.seats, description: p.description, eligibility: p.eligibility, order: p.order }); setErrors({}); setModalOpen(true) }

  async function handleSave() {
    if (!form.name.trim()) { setErrors({ name: 'Required' }); return }
    try {
      if (editItem) await admissionsService.updateProgram(editItem.id, form)
      else await admissionsService.createProgram(form)
      reload(); setModalOpen(false); toast.success(editItem ? 'Program updated' : 'Program added')
    } catch { toast.error('Failed to save') }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await admissionsService.deleteProgram(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Program deleted')
    } catch { toast.error('Failed to delete') }
  }

  const columns: Column<AdmissionsProgram>[] = [
    { key: 'name',     header: 'Program Name', render: r => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: 'duration', header: 'Duration',     render: r => <span className="text-sm">{r.duration || '—'}</span> },
    { key: 'seats',    header: 'Seats',        render: r => <span className="badge badge-blue text-xs">{r.seats}</span> },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)}            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={13} /></button>
          <button onClick={() => deleteDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="card">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">{level} Programs</p>
          <button onClick={openAdd} className="btn-secondary text-xs flex items-center gap-1"><Plus size={13} /> Add</button>
        </div>
        <DataTable columns={columns} data={programs} loading={loading} keyExtractor={r => r.id} emptyTitle={`No ${level} programs added`} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Program' : `Add ${level} Program`} size="md">
        <div className="space-y-4">
          <FormField label="Program Name" required error={errors.name}>
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. B.E. Computer Science & Engineering" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration">
              <input className="input-field" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 4 Years" />
            </FormField>
            <FormField label="Seats">
              <input type="number" min={0} className="input-field" value={form.seats} onChange={e => setForm(f => ({ ...f, seats: Number(e.target.value) }))} />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea className="input-field resize-none h-20" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
          <FormField label="Eligibility">
            <textarea className="input-field resize-none h-20" value={form.eligibility} onChange={e => setForm(f => ({ ...f, eligibility: e.target.value }))} placeholder="Eligibility criteria for this program…" />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add Program'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Program" message="This program will be removed." confirmLabel="Delete" />
    </>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const TABS: { id: LevelTab; label: string }[] = [
  { id: 'UG', label: 'Under Graduate' },
  { id: 'PG', label: 'Post Graduate' },
]

export default function ProgramsSection() {
  const [tab, setTab] = useState<LevelTab>('UG')

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-800">Programs Offered</h3>
        <p className="text-xs text-slate-500 mt-0.5">Manage programs and course listings.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={clsx('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'UG' && <div className="space-y-5"><ProgramsList level="UG" /><UGCoursesTable /></div>}
      {tab === 'PG' && <div className="space-y-5"><ProgramsList level="PG" /><PGCoursesTable /></div>}
    </div>
  )
}
