import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, GraduationCap, BookOpen, Microscope, Clock, Users } from 'lucide-react'
import { admissionsService } from '@/app-modules/admissions/api/admissionsApi'
import type { UGCourse, PGCourse, AdmissionsProgram } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import clsx from 'clsx'

// ─── Tab ─────────────────────────────────────────────────────────────────────

type Tab = 'ug' | 'pg' | 'research'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'ug',       label: 'Undergraduate (UG)', icon: GraduationCap },
  { id: 'pg',       label: 'Postgraduate (PG)',  icon: BookOpen      },
  { id: 'research', label: 'Research (PhD)',      icon: Microscope    },
]

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({ program, onEdit, onDelete }: {
  program: AdmissionsProgram
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-brand-600" />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-slate-800 text-base leading-tight">{program.name}</h3>
        {program.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{program.description}</p>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto pt-2 border-t border-slate-100">
        {program.duration && (
          <span className="flex items-center gap-1"><Clock size={12} />{program.duration}</span>
        )}
        {program.seats > 0 && (
          <span className="flex items-center gap-1"><Users size={12} />{program.seats} seats</span>
        )}
      </div>
    </div>
  )
}

// ─── Program form (add/edit AdmissionsProgram) ────────────────────────────────

type ProgForm = { name: string; duration: string; seats: string; description: string; eligibility: string }
const emptyProg = (defaults?: Partial<ProgForm>): ProgForm => ({
  name: '', duration: '', seats: '', description: '', eligibility: '', ...defaults,
})

function ProgramModal({ open, onClose, onSave, editItem, level, defaultDuration }: {
  open: boolean; onClose: () => void; onSave: (f: ProgForm) => Promise<void>
  editItem: AdmissionsProgram | null; level: string; defaultDuration: string
}) {
  const [form, setForm] = useState<ProgForm>(emptyProg())
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setForm(editItem
        ? { name: editItem.name, duration: editItem.duration, seats: String(editItem.seats), description: editItem.description, eligibility: editItem.eligibility }
        : emptyProg({ duration: defaultDuration })
      )
    }
  }, [open, editItem, defaultDuration])

  async function handle() {
    if (!form.name.trim()) return toast.error('Program name is required')
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  const f = (k: keyof ProgForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <Modal open={open} onClose={onClose} title={editItem ? `Edit ${level} Program` : `Add ${level} Program`}>
      <div className="space-y-4 p-5">
        <FormField label="Program Name" required>
          <input className="input-field" value={form.name} onChange={f('name')}
            placeholder={level === 'UG' ? 'e.g. BE' : level === 'PG' ? 'e.g. MTech' : 'e.g. PhD'} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Duration">
            <input className="input-field" value={form.duration} onChange={f('duration')} placeholder={defaultDuration} />
          </FormField>
          <FormField label="Seats">
            <input className="input-field" type="number" min={0} value={form.seats} onChange={f('seats')} placeholder="60" />
          </FormField>
        </div>
        {level === 'Research' && (
          <FormField label="Eligibility">
            <input className="input-field" value={form.eligibility} onChange={f('eligibility')}
              placeholder="e.g. ME/MTech with 55% aggregate" />
          </FormField>
        )}
        <FormField label="Description">
          <textarea className="input-field min-h-[80px] resize-none" value={form.description} onChange={f('description')}
            placeholder="Brief description of the program..." />
        </FormField>
      </div>
      <ModalFooter>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handle} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Program'}
        </button>
      </ModalFooter>
    </Modal>
  )
}

// ─── UG Course form ───────────────────────────────────────────────────────────

type CourseForm = { name: string; code: string; duration: string; seats: string; description: string }
const emptyCourse = (dur = ''): CourseForm => ({ name: '', code: '', duration: dur, seats: '', description: '' })

function CourseModal({ open, onClose, onSave, editItem, label, defaultDuration }: {
  open: boolean; onClose: () => void
  onSave: (f: CourseForm) => Promise<void>
  editItem: (UGCourse | PGCourse) | null
  label: string; defaultDuration: string
}) {
  const [form, setForm] = useState<CourseForm>(emptyCourse())
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setForm(editItem
        ? { name: editItem.name, code: editItem.code, duration: editItem.duration, seats: String(editItem.seats), description: editItem.description }
        : emptyCourse(defaultDuration)
      )
    }
  }, [open, editItem, defaultDuration])

  async function handle() {
    if (!form.name.trim()) return toast.error('Branch name is required')
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  const f = (k: keyof CourseForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <Modal open={open} onClose={onClose} title={editItem ? `Edit ${label}` : `Add ${label}`}>
      <div className="space-y-4 p-5">
        <FormField label="Branch / Specialization Name" required>
          <input className="input-field" value={form.name} onChange={f('name')}
            placeholder="e.g. Computer Science and Engineering" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Code">
            <input className="input-field" value={form.code} onChange={f('code')} placeholder="e.g. CSE" />
          </FormField>
          <FormField label="Duration">
            <input className="input-field" value={form.duration} onChange={f('duration')} placeholder={defaultDuration} />
          </FormField>
        </div>
        <FormField label="Total Seats">
          <input className="input-field" type="number" min={0} value={form.seats} onChange={f('seats')} placeholder="60" />
        </FormField>
        <FormField label="Description">
          <textarea className="input-field min-h-[80px] resize-none" value={form.description} onChange={f('description')}
            placeholder="Brief description..." />
        </FormField>
      </div>
      <ModalFooter>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handle} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Branch'}
        </button>
      </ModalFooter>
    </Modal>
  )
}

// ─── UG Tab ───────────────────────────────────────────────────────────────────

function UGTab() {
  const toast = useToast()

  const [programs, setPrograms]   = useState<AdmissionsProgram[]>([])
  const [courses, setCourses]     = useState<UGCourse[]>([])
  const [loadingP, setLoadingP]   = useState(true)
  const [loadingC, setLoadingC]   = useState(true)

  const [progModal, setProgModal]     = useState(false)
  const [editProg, setEditProg]       = useState<AdmissionsProgram | null>(null)
  const [courseModal, setCourseModal] = useState(false)
  const [editCourse, setEditCourse]   = useState<UGCourse | null>(null)

  const deleteProgDialog   = useConfirmDialog()
  const deleteCourseDialog = useConfirmDialog()

  useEffect(() => { loadPrograms(); loadCourses() }, [])

  async function loadPrograms() {
    setLoadingP(true)
    try { setPrograms(await admissionsService.getPrograms('UG')) }
    catch { toast.error('Failed to load programs') }
    finally { setLoadingP(false) }
  }
  async function loadCourses() {
    setLoadingC(true)
    try { setCourses(await admissionsService.getUGCourses()) }
    catch { toast.error('Failed to load courses') }
    finally { setLoadingC(false) }
  }

  async function saveProg(f: ProgForm) {
    const payload = { level: 'UG', ...f, seats: Number(f.seats) || 0, order: editProg?.order ?? programs.length, eligibility: f.eligibility }
    if (editProg) await admissionsService.updateProgram(editProg.id, payload)
    else          await admissionsService.createProgram(payload)
    toast.success(editProg ? 'Program updated' : 'Program added')
    setProgModal(false); loadPrograms()
  }
  async function deleteProg() {
    if (!deleteProgDialog.targetId) return
    try { await admissionsService.deleteProgram(deleteProgDialog.targetId); toast.success('Deleted'); loadPrograms() }
    catch { toast.error('Failed to delete') }
    deleteProgDialog.close()
  }

  async function saveCourse(f: CourseForm) {
    const payload = { ...f, seats: Number(f.seats) || 0, order: editCourse?.order ?? courses.length }
    if (editCourse) await admissionsService.updateUGCourse(editCourse.id, payload)
    else            await admissionsService.createUGCourse(payload)
    toast.success(editCourse ? 'Branch updated' : 'Branch added')
    setCourseModal(false); loadCourses()
  }
  async function deleteCourse() {
    if (!deleteCourseDialog.targetId) return
    try { await admissionsService.deleteUGCourse(deleteCourseDialog.targetId); toast.success('Deleted'); loadCourses() }
    catch { toast.error('Failed to delete') }
    deleteCourseDialog.close()
  }

  const courseColumns: Column<UGCourse>[] = [
    { key: 'name',     header: 'Branch',    render: r => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: 'code',     header: 'Code',      render: r => r.code ? <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{r.code}</span> : <span className="text-slate-400">—</span> },
    { key: 'duration', header: 'Duration',  render: r => r.duration || '—' },
    { key: 'seats',    header: 'Seats',     render: r => r.seats || '—' },
    { key: 'description', header: 'Description', render: r => <span className="text-slate-500 text-xs line-clamp-1">{r.description || '—'}</span> },
    {
      key: 'id', header: '',
      render: r => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setEditCourse(r); setCourseModal(true) }} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={14} /></button>
          <button onClick={() => deleteCourseDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8 p-5">
      {/* Programs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800">Degree Programs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Top-level UG degree types offered (e.g. BE, BTech)</p>
          </div>
          <button onClick={() => { setEditProg(null); setProgModal(true) }} className="btn-primary">
            <Plus size={15} /> Add Program
          </button>
        </div>

        {loadingP ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(2)].map((_, i) => <div key={i} className="card p-5 h-36 animate-pulse bg-slate-50" />)}
          </div>
        ) : programs.length === 0 ? (
          <div className="text-sm text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">No UG programs added yet</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {programs.map(p => (
              <ProgramCard key={p.id} program={p}
                onEdit={() => { setEditProg(p); setProgModal(true) }}
                onDelete={() => deleteProgDialog.open(p.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="border-slate-100" />

      {/* Courses / Branches */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Branches / Specializations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Individual UG branches with intake details</p>
          </div>
          <button onClick={() => { setEditCourse(null); setCourseModal(true) }} className="btn-primary"><Plus size={15} /> Add Branch</button>
        </div>
        <DataTable columns={courseColumns} data={courses} keyExtractor={r => r.id} loading={loadingC}
          emptyTitle="No UG branches added yet"
        />
      </div>

      {/* Modals */}
      <ProgramModal open={progModal} onClose={() => setProgModal(false)} onSave={saveProg}
        editItem={editProg} level="UG" defaultDuration="4 Years" />
      <CourseModal open={courseModal} onClose={() => setCourseModal(false)} onSave={saveCourse}
        editItem={editCourse} label="UG Branch" defaultDuration="4 Years" />
      <ConfirmDialog open={deleteProgDialog.isOpen} onConfirm={deleteProg} onClose={deleteProgDialog.close}
        title="Delete Program" message="This will permanently remove the program." />
      <ConfirmDialog open={deleteCourseDialog.isOpen} onConfirm={deleteCourse} onClose={deleteCourseDialog.close}
        title="Delete Branch" message="This will permanently remove the branch." />
    </div>
  )
}

// ─── PG Tab ───────────────────────────────────────────────────────────────────

function PGTab() {
  const toast = useToast()

  const [programs, setPrograms]   = useState<AdmissionsProgram[]>([])
  const [courses, setCourses]     = useState<PGCourse[]>([])
  const [loadingP, setLoadingP]   = useState(true)
  const [loadingC, setLoadingC]   = useState(true)

  const [progModal, setProgModal]     = useState(false)
  const [editProg, setEditProg]       = useState<AdmissionsProgram | null>(null)
  const [courseModal, setCourseModal] = useState(false)
  const [editCourse, setEditCourse]   = useState<PGCourse | null>(null)

  const deleteProgDialog   = useConfirmDialog()
  const deleteCourseDialog = useConfirmDialog()

  useEffect(() => { loadPrograms(); loadCourses() }, [])

  async function loadPrograms() {
    setLoadingP(true)
    try { setPrograms(await admissionsService.getPrograms('PG')) }
    catch { toast.error('Failed to load programs') }
    finally { setLoadingP(false) }
  }
  async function loadCourses() {
    setLoadingC(true)
    try { setCourses(await admissionsService.getPGCourses()) }
    catch { toast.error('Failed to load courses') }
    finally { setLoadingC(false) }
  }

  async function saveProg(f: ProgForm) {
    const payload = { level: 'PG', ...f, seats: Number(f.seats) || 0, order: editProg?.order ?? programs.length, eligibility: f.eligibility }
    if (editProg) await admissionsService.updateProgram(editProg.id, payload)
    else          await admissionsService.createProgram(payload)
    toast.success(editProg ? 'Program updated' : 'Program added')
    setProgModal(false); loadPrograms()
  }
  async function deleteProg() {
    if (!deleteProgDialog.targetId) return
    try { await admissionsService.deleteProgram(deleteProgDialog.targetId); toast.success('Deleted'); loadPrograms() }
    catch { toast.error('Failed to delete') }
    deleteProgDialog.close()
  }

  async function saveCourse(f: CourseForm) {
    const payload = { ...f, seats: Number(f.seats) || 0, order: editCourse?.order ?? courses.length }
    if (editCourse) await admissionsService.updatePGCourse(editCourse.id, payload)
    else            await admissionsService.createPGCourse(payload)
    toast.success(editCourse ? 'Specialization updated' : 'Specialization added')
    setCourseModal(false); loadCourses()
  }
  async function deleteCourse() {
    if (!deleteCourseDialog.targetId) return
    try { await admissionsService.deletePGCourse(deleteCourseDialog.targetId); toast.success('Deleted'); loadCourses() }
    catch { toast.error('Failed to delete') }
    deleteCourseDialog.close()
  }

  const courseColumns: Column<PGCourse>[] = [
    { key: 'name',     header: 'Specialization', render: r => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: 'code',     header: 'Code',           render: r => r.code ? <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{r.code}</span> : <span className="text-slate-400">—</span> },
    { key: 'duration', header: 'Duration',       render: r => r.duration || '—' },
    { key: 'seats',    header: 'Seats',          render: r => r.seats || '—' },
    { key: 'description', header: 'Description', render: r => <span className="text-slate-500 text-xs line-clamp-1">{r.description || '—'}</span> },
    {
      key: 'id', header: '',
      render: r => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setEditCourse(r); setCourseModal(true) }} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={14} /></button>
          <button onClick={() => deleteCourseDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8 p-5">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800">Degree Programs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Top-level PG degree types offered (e.g. MTech, MCA, MBA)</p>
          </div>
          <button onClick={() => { setEditProg(null); setProgModal(true) }} className="btn-primary">
            <Plus size={15} /> Add Program
          </button>
        </div>

        {loadingP ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="card p-5 h-36 animate-pulse bg-slate-50" />)}
          </div>
        ) : programs.length === 0 ? (
          <div className="text-sm text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">No PG programs added yet</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {programs.map(p => (
              <ProgramCard key={p.id} program={p}
                onEdit={() => { setEditProg(p); setProgModal(true) }}
                onDelete={() => deleteProgDialog.open(p.id)}
              />
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Specializations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Individual PG specializations with intake details</p>
          </div>
          <button onClick={() => { setEditCourse(null); setCourseModal(true) }} className="btn-primary"><Plus size={15} /> Add Specialization</button>
        </div>
        <DataTable columns={courseColumns} data={courses} keyExtractor={r => r.id} loading={loadingC}
          emptyTitle="No PG specializations added yet"
        />
      </div>

      <ProgramModal open={progModal} onClose={() => setProgModal(false)} onSave={saveProg}
        editItem={editProg} level="PG" defaultDuration="2 Years" />
      <CourseModal open={courseModal} onClose={() => setCourseModal(false)} onSave={saveCourse}
        editItem={editCourse} label="PG Specialization" defaultDuration="2 Years" />
      <ConfirmDialog open={deleteProgDialog.isOpen} onConfirm={deleteProg} onClose={deleteProgDialog.close}
        title="Delete Program" message="This will permanently remove the program." />
      <ConfirmDialog open={deleteCourseDialog.isOpen} onConfirm={deleteCourse} onClose={deleteCourseDialog.close}
        title="Delete Specialization" message="This will permanently remove the specialization." />
    </div>
  )
}

// ─── Research Tab ─────────────────────────────────────────────────────────────

function ResearchTab() {
  const toast = useToast()
  const [programs, setPrograms] = useState<AdmissionsProgram[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editItem, setEditItem] = useState<AdmissionsProgram | null>(null)
  const deleteDialog            = useConfirmDialog()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setPrograms(await admissionsService.getPrograms('Research')) }
    catch { toast.error('Failed to load research programs') }
    finally { setLoading(false) }
  }

  async function save(f: ProgForm) {
    const payload = { level: 'Research', ...f, seats: Number(f.seats) || 0, order: editItem?.order ?? programs.length }
    if (editItem) await admissionsService.updateProgram(editItem.id, payload)
    else          await admissionsService.createProgram(payload)
    toast.success(editItem ? 'Program updated' : 'Program added')
    setModal(false); load()
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try { await admissionsService.deleteProgram(deleteDialog.targetId); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
    deleteDialog.close()
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Doctoral / Research Programs</h3>
          <p className="text-xs text-slate-500 mt-0.5">PhD and research programs offered by the institution</p>
        </div>
        <button onClick={() => { setEditItem(null); setModal(true) }} className="btn-primary">
          <Plus size={15} /> Add Program
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="card p-5 h-36 animate-pulse bg-slate-50" />)}
        </div>
      ) : programs.length === 0 ? (
        <div className="text-sm text-slate-400 py-10 text-center border border-dashed border-slate-200 rounded-xl">No research programs added yet</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {programs.map(p => (
            <ProgramCard key={p.id} program={p}
              onEdit={() => { setEditItem(p); setModal(true) }}
              onDelete={() => deleteDialog.open(p.id)}
            />
          ))}
        </div>
      )}

      <ProgramModal open={modal} onClose={() => setModal(false)} onSave={save}
        editItem={editItem} level="Research" defaultDuration="3–5 Years" />
      <ConfirmDialog open={deleteDialog.isOpen} onConfirm={handleDelete} onClose={deleteDialog.close}
        title="Delete Research Program" message="This will permanently remove the program." />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProgramsOfferedPage() {
  const [tab, setTab] = useState<Tab>('ug')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-800">Programs Offered</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage UG, PG, and Research programs at BIET</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors',
              tab === t.id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card overflow-hidden">
        {tab === 'ug'       && <UGTab />}
        {tab === 'pg'       && <PGTab />}
        {tab === 'research' && <ResearchTab />}
      </div>
    </div>
  )
}
