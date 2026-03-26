import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, GraduationCap } from 'lucide-react'
import { phdScholarService } from '@/app-modules/departments/api/deptResearchApi'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import type { PhdScholar, Faculty } from '@/shared/types/models'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import FacultyCombobox from '@/app-modules/departments/components/FacultyCombobox'
import ProgressToggle from '@/app-modules/departments/components/ProgressToggle'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import clsx from 'clsx'

// ── Types ──────────────────────────────────────────────────────────────────────

type StatusTab = 'all' | 'guiding' | 'guided'

type ScholarForm = Omit<PhdScholar, 'id' | 'deptId' | 'guideFacultyId' | 'department'>

function emptyForm(): ScholarForm {
  return {
    scholarName: '',
    institution: '',
    yearOfRegistration: new Date().getFullYear(),
    thesisTitle: '',
    yearOfDegreeAwarded: undefined,
    courseWorkCompleted: false,
    prePhdViva: false,
    finalThesisSubmitted: false,
    status: 'guiding',
  }
}

// ── Scholar Modal ─────────────────────────────────────────────────────────────

function ScholarModal({
  open,
  editItem,
  onClose,
  onSave,
}: {
  open: boolean
  editItem: PhdScholar | null
  onClose: () => void
  onSave: (form: ScholarForm) => void
}) {
  const [form, setForm] = useState<ScholarForm>(emptyForm)

  // Sync form when editItem changes
  useMemo(() => {
    setForm(editItem ? {
      scholarName:          editItem.scholarName,
      institution:          editItem.institution,
      yearOfRegistration:   editItem.yearOfRegistration,
      thesisTitle:          editItem.thesisTitle,
      yearOfDegreeAwarded:  editItem.yearOfDegreeAwarded,
      courseWorkCompleted:  editItem.courseWorkCompleted,
      prePhdViva:           editItem.prePhdViva,
      finalThesisSubmitted: editItem.finalThesisSubmitted,
      status:               editItem.status,
    } : emptyForm())
  }, [editItem, open])

  const set = <K extends keyof ScholarForm>(key: K, val: ScholarForm[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  function handleSave() {
    onSave(form)
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose}
      title={editItem ? 'Edit Research Scholar' : 'Add Research Scholar'} size="lg">
      <div className="space-y-5">

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormField label="Scholar Name" required>
              <input className="input-field" value={form.scholarName}
                onChange={e => set('scholarName', e.target.value)}
                placeholder="Full name of the scholar" />
            </FormField>
          </div>
          <FormField label="Institution" required>
            <input className="input-field" value={form.institution}
              onChange={e => set('institution', e.target.value)}
              placeholder="Affiliated university or institution" />
          </FormField>
          <FormField label="Year of Registration" required>
            <input type="number" className="input-field" min={1990} max={2099}
              value={form.yearOfRegistration}
              onChange={e => set('yearOfRegistration', Number(e.target.value))}
              placeholder="YYYY" />
          </FormField>
          <div className="col-span-2">
            <FormField label="Thesis Title" required>
              <textarea className="input-field resize-none h-20" value={form.thesisTitle}
                onChange={e => set('thesisTitle', e.target.value)}
                placeholder="Full thesis title" />
            </FormField>
          </div>
          <FormField label="Year of Degree Awarded">
            <input type="number" className="input-field" min={1990} max={2099}
              value={form.yearOfDegreeAwarded ?? ''}
              onChange={e => set('yearOfDegreeAwarded', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="YYYY (leave blank if ongoing)" />
          </FormField>
          <FormField label="Status">
            <select className="input-field" value={form.status}
              onChange={e => set('status', e.target.value as PhdScholar['status'])}>
              <option value="guiding">Guiding (Ongoing)</option>
              <option value="guided">Guided (Completed)</option>
            </select>
          </FormField>
        </div>

        {/* Research Progress */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Research Progress
          </p>
          <div className="space-y-2">
            <ProgressToggle label="Course Work Completed"
              checked={form.courseWorkCompleted}
              onChange={v => set('courseWorkCompleted', v)} />
            <ProgressToggle label="Pre-PhD Viva Voce Completed"
              checked={form.prePhdViva}
              onChange={v => set('prePhdViva', v)} />
            <ProgressToggle label="Final Thesis Submitted"
              checked={form.finalThesisSubmitted}
              onChange={v => set('finalThesisSubmitted', v)} />
          </div>
        </div>
      </div>

      <ModalFooter>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn-primary">
          {editItem ? 'Save Changes' : 'Add Scholar'}
        </button>
      </ModalFooter>
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PhDGuidePage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast      = useToast()

  const [allFaculty, setAllFaculty] = useState<Faculty[]>([])

  useEffect(() => { facultyService.getAll().then(setAllFaculty).catch(() => {}) }, [])

  // Guide selection
  const [guideFacultyId, setGuideFacultyId] = useState('')
  const [guideDept, setGuideDept]           = useState('')

  // Scholar data — driven by guideFacultyId
  const scholarLoader = useCallback(
    () => (guideFacultyId && deptId
      ? phdScholarService.getByGuide(deptId, guideFacultyId)
      : Promise.resolve([])),
    [deptId, guideFacultyId],
  )
  const { data: scholars, reload: reloadScholars } = useDepartmentSectionAsync(scholarLoader)

  // Re-fetch scholars whenever the selected guide changes
  useEffect(() => { if (guideFacultyId) reloadScholars() }, [guideFacultyId]) // eslint-disable-line react-hooks/exhaustive-deps

  const [tab, setTab]           = useState<StatusTab>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<PhdScholar | null>(null)
  const deleteDialog              = useConfirmDialog()

  // Faculty list scoped to this department
  const dept          = useDeptContext()
  const deptShortName = dept.shortName
  const facultyList   = useMemo(
    () => allFaculty.filter(f => f.department === deptShortName && f.status === 'active'),
    [allFaculty, deptShortName],
  )

  const selectedGuide = allFaculty.find(f => f.id === guideFacultyId)

  function handleGuideChange(id: string, dept: string) {
    setGuideFacultyId(id)
    setGuideDept(dept)
    setTab('all')
  }

  // Filtered by tab
  const displayed = useMemo(() => {
    if (tab === 'all') return scholars
    return scholars.filter(s => s.status === tab)
  }, [scholars, tab])

  const tabCounts = {
    all:     scholars.length,
    guiding: scholars.filter(s => s.status === 'guiding').length,
    guided:  scholars.filter(s => s.status === 'guided').length,
  }

  // Save (add or edit)
  async function handleSave(form: ScholarForm) {
    if (!form.scholarName.trim()) { toast.error('Scholar name is required'); return }
    if (!form.institution.trim()) { toast.error('Institution is required'); return }
    if (!form.thesisTitle.trim()) { toast.error('Thesis title is required'); return }
    if (!guideFacultyId)          { toast.error('Please select a guide first'); return }

    try {
      if (editItem) {
        await phdScholarService.update(editItem.id, form)
        toast.success('Scholar record updated')
      } else {
        await phdScholarService.create({
          ...form,
          deptId: deptId!,
          guideFacultyId,
          department: guideDept,
        })
        toast.success('Scholar added')
      }
      reloadScholars()
      setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save scholar')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await phdScholarService.delete(deleteDialog.targetId)
      reloadScholars()
      deleteDialog.close()
      toast.success('Scholar record deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete scholar')
    }
  }

  function openAdd() {
    setEditItem(null); setModalOpen(true)
  }

  function openEdit(item: PhdScholar) {
    setEditItem(item); setModalOpen(true)
  }

  // Progress dot indicator
  function ProgressDots({ s }: { s: PhdScholar }) {
    const milestones = [s.courseWorkCompleted, s.prePhdViva, s.finalThesisSubmitted]
    return (
      <div className="flex items-center gap-1.5">
        {milestones.map((done, i) => (
          <div key={i}
            title={['Course Work', 'Pre-PhD Viva', 'Final Thesis'][i]}
            className={clsx('w-2.5 h-2.5 rounded-full', done ? 'bg-emerald-400' : 'bg-slate-200')} />
        ))}
        <span className="text-xs text-slate-400 ml-1">{milestones.filter(Boolean).length}/3</span>
      </div>
    )
  }

  const columns: Column<PhdScholar>[] = [
    {
      key: 'scholarName', header: 'Scholar Name',
      render: r => (
        <div>
          <p className="font-medium text-sm text-slate-800">{r.scholarName}</p>
          <p className="text-xs text-slate-400 line-clamp-1">{r.thesisTitle}</p>
        </div>
      ),
    },
    {
      key: 'institution', header: 'Institution',
      render: r => <span className="text-sm text-slate-600">{r.institution}</span>,
    },
    {
      key: 'yearOfRegistration', header: 'Regn. Year',
      render: r => <span className="text-sm">{r.yearOfRegistration}</span>,
    },
    {
      key: 'yearOfDegreeAwarded', header: 'Degree Year',
      render: r => <span className="text-sm">{r.yearOfDegreeAwarded ?? '—'}</span>,
    },
    {
      key: 'courseWorkCompleted', header: 'Progress',
      render: r => <ProgressDots s={r} />,
    },
    {
      key: 'status', header: 'Status',
      render: r => (
        <span className={clsx(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          r.status === 'guiding'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-emerald-50 text-emerald-700',
        )}>
          {r.status === 'guiding' ? 'Guiding' : 'Guided'}
        </span>
      ),
    },
    {
      key: 'actions', header: '', className: 'w-16',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <Edit2 size={14} />
          </button>
          <button onClick={() => deleteDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h3 className="text-base font-display font-bold text-slate-800">PhD Guide Details</h3>
        <p className="text-sm text-slate-500">Select a guide to manage their research scholars</p>
      </div>

      {/* Guide Selection Card */}
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Guide Selection</p>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Guide" required>
            <FacultyCombobox
              facultyList={facultyList}
              value={guideFacultyId}
              onChange={handleGuideChange}
              placeholder="Search and select a PhD guide…"
            />
          </FormField>
          <FormField label="Department">
            <input className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"
              value={guideDept} readOnly
              placeholder="Auto-filled from selected guide" />
          </FormField>
        </div>
      </div>

      {/* Scholars Section */}
      {guideFacultyId ? (
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-700">
                Scholars under {selectedGuide?.name ?? 'selected guide'}
              </h4>
              <p className="text-xs text-slate-400">{scholars.length} scholar{scholars.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
              <Plus size={15} /> Add Scholar
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {(['all', 'guiding', 'guided'] as StatusTab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                  tab === t ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700',
                )}>
                {t === 'all' ? 'All' : t === 'guiding' ? 'Guiding' : 'Guided'}
                <span className={clsx(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  tab === t ? 'bg-brand-50 text-brand-600' : 'bg-slate-200 text-slate-500',
                )}>
                  {tabCounts[t]}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="card">
            <DataTable
              columns={columns}
              data={displayed}
              keyExtractor={r => r.id}
              total={displayed.length}
              emptyTitle={tab === 'all' ? 'No scholars yet' : `No ${tab === 'guiding' ? 'ongoing' : 'completed'} scholars`}
              emptyDescription={tab === 'all' ? 'Add a research scholar using the button above.' : undefined}
            />
          </div>
        </div>
      ) : (
        /* Empty state — no guide selected */
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
            <GraduationCap size={22} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">No guide selected</p>
          <p className="text-xs text-slate-400 mt-1">Select a PhD guide above to view and manage their research scholars.</p>
        </div>
      )}

      {/* Scholar Modal */}
      <ScholarModal
        open={modalOpen}
        editItem={editItem}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete Scholar Record"
        message="This scholar record will be permanently deleted."
        confirmLabel="Delete"
      />
    </div>
  )
}
