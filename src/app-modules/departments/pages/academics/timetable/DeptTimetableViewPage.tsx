import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Info } from 'lucide-react'
import { deptCourseService, deptSectionService, deptSlotService } from '@/app-modules/departments/api/deptAcademicsApi'
import type { TimetableDay, DeptCourse, DeptSection, DeptSlot, Faculty } from '@/shared/types/models'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import clsx from 'clsx'

const DAYS: TimetableDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PERIODS = [1, 2, 3, 4, 5, 6, 7]

const PERIOD_TIMES: Record<number, string> = {
  1: '8:00 – 9:00',
  2: '9:00 – 10:00',
  3: '10:30 – 11:30',
  4: '11:30 – 12:30',
  5: '2:00 – 3:00',
  6: '3:00 – 4:00',
  7: '4:00 – 5:00',
}

// Breaks inserted after these periods (in the grid)
const BREAK_AFTER: Record<number, { label: string; time: string }> = {
  2: { label: 'Break',  time: '10:00 – 10:30' },
  4: { label: 'Lunch',  time: '12:30 – 2:00'  },
}

// Saturday only runs periods 1–4
const SAT_MAX_PERIOD = 4

const TYPE_CELL: Record<DeptCourse['type'], string> = {
  theory:   'bg-blue-50   text-blue-800   border border-blue-200',
  lab:      'bg-emerald-50 text-emerald-800 border border-emerald-200',
  elective: 'bg-amber-50  text-amber-800  border border-amber-200',
}

type SlotForm = { day: TimetableDay; period: number; courseId: string; facultyId: string; editId?: string }
const blankForm = (day: TimetableDay = 'Mon', period = 1): SlotForm => ({ day, period, courseId: '', facultyId: '' })

export default function DeptTimetableViewPage() {
  const { deptId, programType, program, semester, batch, section } = useParams<{
    deptId: string; programType: string; program: string; semester: string; batch: string; section: string
  }>()
  const sem       = Number(semester)
  const prog      = decodeURIComponent(program!)
  const batchName = decodeURIComponent(batch!)
  const navigate  = useNavigate()
  const { user: _user } = useAuth()
  const toast     = useToast()
  const base      = `/departments/${deptId}/academics/timetable`
  const semBase   = `${base}/${programType}/${program}/${semester}`

  const [allFaculty, setAllFaculty]             = useState<Faculty[]>([])
  const [availableCourses, setAvailableCourses] = useState<DeptCourse[]>([])
  const [sectionObj, setSectionObj]             = useState<DeptSection | undefined>()
  const [slots, setSlots]                       = useState<DeptSlot[]>([])
  const [modalOpen, setModalOpen]               = useState(false)
  const [form, setForm]                         = useState<SlotForm>(blankForm())
  const deleteDialog                            = useConfirmDialog()

  // Fetch courses from GraphQL, filter by semester
  useEffect(() => {
    deptCourseService.getAll(deptId!)
      .then(courses => setAvailableCourses(courses.filter(c => c.semester === sem)))
      .catch(() => {})
  }, [deptId, sem])

  // Fetch section then slots from GraphQL
  useEffect(() => {
    deptSectionService.getAll(deptId!, prog, sem, batchName)
      .then(sections => {
        const found = sections.find(s => s.name === section)
        setSectionObj(found)
        if (found) {
          deptSlotService.getAll(deptId!, found.id)
            .then(setSlots)
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [deptId, prog, sem, batchName, section])

  useEffect(() => { facultyService.getAll().then(setAllFaculty).catch(() => {}) }, [])

  function reloadSlots() {
    if (sectionObj) {
      deptSlotService.getAll(deptId!, sectionObj.id).then(setSlots).catch(() => {})
    }
  }

  function openAdd(day: TimetableDay, period: number) {
    setForm(blankForm(day, period)); setModalOpen(true)
  }

  function openEdit(slot: DeptSlot) {
    const course = availableCourses.find(c => c.code === slot.courseCode)
    setForm({ day: slot.day, period: slot.period, courseId: course?.id ?? '', facultyId: slot.facultyId ?? '', editId: slot.id })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!sectionObj) { toast.error('Section not found'); return }
    if (!form.courseId) { toast.error('Select a course'); return }
    const course = availableCourses.find(c => c.id === form.courseId)
    if (!course) { toast.error('Course not found'); return }

    // Client-side conflict check
    const conflict = slots.find(s => s.day === form.day && s.period === form.period && s.id !== form.editId)
    if (conflict) { toast.error('This slot already has a course assigned'); return }

    try {
      if (form.editId) {
        await deptSlotService.update(form.editId, {
          courseCode: course.code,
          courseName: course.name,
          type:       course.type,
          facultyId:  form.facultyId || undefined,
        })
        toast.success('Slot updated')
      } else {
        await deptSlotService.create({
          deptId:     deptId!,
          sectionId:  sectionObj.id,
          day:        form.day,
          period:     form.period,
          courseCode: course.code,
          courseName: course.name,
          type:       course.type,
          facultyId:  form.facultyId || undefined,
        })
        toast.success('Slot added')
      }
      reloadSlots(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save slot')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await deptSlotService.delete(deleteDialog.targetId)
      reloadSlots(); deleteDialog.close(); toast.success('Slot removed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove slot')
    }
  }

  const getSlot = (day: TimetableDay, period: number) => slots.find(s => s.day === day && s.period === period)
  const getFacultyName = (id?: string) => id ? (allFaculty.find(f => f.id === id)?.name.split(' ').slice(-1)[0] ?? '—') : ''
  const filledSlots = slots.length
  const totalSlots  = DAYS.length * PERIODS.length

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm flex-wrap">
        <button onClick={() => navigate(base)} className="text-slate-500 hover:text-brand-600">Timetable</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(`${base}/${programType}`)} className="text-slate-500 hover:text-brand-600">{programType}</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(`${base}/${programType}/${program}`)} className="text-slate-500 hover:text-brand-600">{prog}</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(semBase)} className="text-slate-500 hover:text-brand-600">Sem {semester}</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(`${semBase}/${encodeURIComponent(batchName)}`)} className="text-slate-500 hover:text-brand-600">{batchName}</button>
        <span className="text-slate-300">›</span>
        <span className="text-slate-700 font-medium">Section {section}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">
            Section {section} — {prog} · Sem {semester} · {batchName}
          </h3>
          <p className="text-sm text-slate-500">
            {filledSlots} / {totalSlots} slots filled • {programType} · {prog}
          </p>
        </div>
      </div>

      {availableCourses.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            No courses configured for Sem {semester}. Add courses in the <strong>Courses</strong> section first.
          </p>
        </div>
      )}

      <div className="card overflow-x-auto">
        <div className="min-w-[780px]">
          {/* Header */}
          <div className="grid gap-px bg-slate-100" style={{ gridTemplateColumns: '100px repeat(6, 1fr)' }}>
            <div className="bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-400 flex items-center justify-center">Period</div>
            {DAYS.map(day => (
              <div key={day} className="bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 text-center">
                {day}
                {day === 'Sat' && <span className="block text-slate-400 font-normal">till 12:30</span>}
              </div>
            ))}
          </div>

          {PERIODS.map(period => (
            <>
              {/* Period row */}
              <div key={period} className="grid gap-px bg-slate-100" style={{ gridTemplateColumns: '100px repeat(6, 1fr)' }}>
                {/* Period label + time */}
                <div className="bg-white px-2 py-2 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{period}</span>
                  <span className="text-[10px] text-slate-400 text-center leading-tight">{PERIOD_TIMES[period]}</span>
                </div>

                {DAYS.map(day => {
                  const isSatOff = day === 'Sat' && period > SAT_MAX_PERIOD
                  const slot     = !isSatOff ? getSlot(day, period) : undefined
                  return (
                    <div key={day} className="bg-white p-1.5 min-h-[72px] relative group">
                      {isSatOff ? (
                        <div className="w-full h-full min-h-[56px] bg-slate-50 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-slate-300">—</span>
                        </div>
                      ) : slot ? (
                        <div className={clsx('rounded-lg p-2 h-full flex flex-col justify-between relative', TYPE_CELL[slot.type as DeptCourse['type']])}>
                          <div>
                            <p className="font-mono text-xs font-bold leading-tight">{slot.courseCode}</p>
                            <p className="text-xs mt-0.5 text-current opacity-75 leading-tight line-clamp-2">{slot.courseName}</p>
                          </div>
                          {slot.facultyId && (
                            <p className="text-xs mt-1 opacity-60 leading-tight">{getFacultyName(slot.facultyId)}</p>
                          )}
                          <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5 bg-white/80 rounded p-0.5">
                            <button onClick={() => openEdit(slot)} className="p-1 text-slate-500 hover:text-brand-600 rounded"><Edit2 size={10} /></button>
                            <button onClick={() => deleteDialog.open(slot.id)} className="p-1 text-slate-500 hover:text-red-600 rounded"><Trash2 size={10} /></button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openAdd(day, period)}
                          disabled={availableCourses.length === 0}
                          className="w-full h-full min-h-[56px] flex items-center justify-center text-slate-200 hover:text-brand-400 hover:bg-brand-50 rounded-lg border-2 border-dashed border-transparent hover:border-brand-200 transition-all disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-transparent"
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Break row */}
              {BREAK_AFTER[period] && (
                <div key={`break-${period}`} className="grid gap-px bg-slate-100" style={{ gridTemplateColumns: '100px repeat(6, 1fr)' }}>
                  <div className="bg-amber-50 px-2 py-1.5 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">{BREAK_AFTER[period].label}</span>
                    <span className="text-[10px] text-amber-500">{BREAK_AFTER[period].time}</span>
                  </div>
                  {DAYS.map(day => (
                    <div key={day} className="bg-amber-50 flex items-center justify-center py-1.5">
                      <span className="text-[10px] text-amber-400 italic">{BREAK_AFTER[period].label}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs text-slate-400 font-medium">Legend:</span>
        {(Object.keys(TYPE_CELL) as DeptCourse['type'][]).map(type => (
          <span key={type} className={clsx('text-xs px-2 py-0.5 rounded font-medium capitalize', TYPE_CELL[type])}>{type}</span>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.editId ? 'Edit Slot' : 'Add Slot'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Day">
              <select className="input-field" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value as TimetableDay }))}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Period">
              <select className="input-field" value={form.period} onChange={e => setForm(f => ({ ...f, period: Number(e.target.value) }))}>
                {PERIODS.map(p => <option key={p} value={p}>Period {p}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Course" required>
            <select className="input-field" value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}>
              <option value="">— Select Course —</option>
              {availableCourses.map(c => (
                <option key={c.id} value={c.id}>{c.code} — {c.name} ({c.type}, {c.credits} cr)</option>
              ))}
            </select>
          </FormField>
          <FormField label="Faculty (optional)">
            <select className="input-field" value={form.facultyId} onChange={e => setForm(f => ({ ...f, facultyId: e.target.value }))}>
              <option value="">— Unassigned —</option>
              {allFaculty.filter(f => f.status === 'active').map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
              ))}
            </select>
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{form.editId ? 'Save Changes' : 'Add Slot'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Remove Slot" message="This timetable slot will be removed." confirmLabel="Remove" />
    </div>
  )
}
