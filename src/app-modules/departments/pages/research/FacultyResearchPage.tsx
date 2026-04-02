import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, FileText, ExternalLink, Download, X } from 'lucide-react'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { facultyResearchService } from '@/app-modules/departments/api/deptResearchApi'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import type { FacultyResearchSummary } from '@/shared/types/models'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import SearchBar from '@/shared/components/filters/SearchBar'
import FacultyCombobox from '@/app-modules/departments/components/FacultyCombobox'
import ProgressToggle from '@/app-modules/departments/components/ProgressToggle'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'
import { useSearch } from '@/shared/hooks/useSearch'
import clsx from 'clsx'

// ── PDF Uploader ──────────────────────────────────────────────────────────────

function PdfUploader({ value, onChange, deptId }: { value?: string; onChange: (url: string) => void; deptId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const url = await uploadToS3(file, 'dept-research', deptId)
      onChange(url)
    } catch {
      // upload failed — leave value unchanged
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <FileText size={18} className="text-brand-500 shrink-0" />
        <span className="flex-1 text-sm text-slate-600 truncate">Thesis document uploaded</span>
        <a href={value} target="_blank" rel="noreferrer"
          className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1">
          <ExternalLink size={12} /> View
        </a>
        <a href={value} download="thesis.pdf"
          className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1">
          <Download size={12} /> Download
        </a>
        <button type="button" onClick={() => onChange('')}
          className="text-slate-400 hover:text-red-500 ml-1">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
      <button type="button" onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition-colors w-full justify-center">
        <FileText size={15} /> Upload PDF
      </button>
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  )
}

// ── Empty form ────────────────────────────────────────────────────────────────

type FormData = Omit<FacultyResearchSummary, 'id' | 'deptId'>

function emptyForm(): FormData {
  return {
    facultyId: '',
    department: '',
    researchArea: '',
    guideName: '',
    guideDesignation: '',
    guideInstitution: '',
    guideType: 'internal',
    thesisTitle: '',
    university: '',
    yearOfRegistration: undefined,
    yearOfDegreeAwarded: undefined,
    courseWorkCompleted: false,
    prePhDVivaVoce: false,
    finalThesisSubmitted: false,
    researchStatus: '',
    thesisDocumentUrl: '',
    remarks: '',
  }
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FacultyResearchPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast      = useToast()

  const researchLoader = useCallback(() => facultyResearchService.getAll(deptId!), [deptId])
  const { data, reload, error: listError } = useDepartmentSectionAsync<FacultyResearchSummary>(researchLoader)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editItem, setEditItem]     = useState<FacultyResearchSummary | null>(null)
  const [form, setForm]             = useState<FormData>(emptyForm)
  const deleteDialog                = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  // Faculty list for this department
  const dept          = useDeptContext()
  const deptShortName = dept.shortName
  const [allFaculty, setAllFaculty] = useState<import('@/shared/types/models').Faculty[]>([])

  useEffect(() => {
    facultyService.getAll().then(setAllFaculty).catch(() => setAllFaculty([]))
  }, [])

  const facultyList = useMemo(
    () => allFaculty.filter(f => f.department === deptShortName && f.status === 'active'),
    [allFaculty, deptShortName],
  )

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  // Derived faculty name for display
  function getFacultyName(facultyId: string) {
    return allFaculty.find(f => f.id === facultyId)?.name ?? '—'
  }

  const filtered = useMemo(() => data.filter(r => {
    const q   = debouncedSearch.toLowerCase()
    const name = getFacultyName(r.facultyId).toLowerCase()
    return !q || name.includes(q) || (r.thesisTitle ?? '').toLowerCase().includes(q) || (r.researchArea ?? '').toLowerCase().includes(q)
  }), [data, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleSave() {
    if (!form.facultyId) { toast.error('Please select a faculty member'); return }
    if (!form.guideName.trim()) { toast.error('Guide name is required'); return }
    try {
      if (editItem) {
        await facultyResearchService.update(editItem.id, form)
        toast.success('Research record updated')
      } else {
        await facultyResearchService.create({ ...form, deptId: deptId! })
        toast.success('Research record added')
      }
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save research record')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await facultyResearchService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete record')
    }
  }

  function openAdd() {
    setEditItem(null); setForm(emptyForm()); setModalOpen(true)
  }

  function openEdit(item: FacultyResearchSummary) {
    setEditItem(item)
    setForm({
      facultyId:            item.facultyId,
      department:           item.department,
      researchArea:         item.researchArea,
      guideName:            item.guideName,
      guideDesignation:     item.guideDesignation ?? '',
      guideInstitution:     item.guideInstitution ?? '',
      guideType:            item.guideType,
      thesisTitle:          item.thesisTitle ?? '',
      university:           item.university ?? '',
      yearOfRegistration:   item.yearOfRegistration,
      yearOfDegreeAwarded:  item.yearOfDegreeAwarded,
      courseWorkCompleted:  item.courseWorkCompleted,
      prePhDVivaVoce:       item.prePhDVivaVoce,
      finalThesisSubmitted: item.finalThesisSubmitted,
      researchStatus:       item.researchStatus ?? '',
      thesisDocumentUrl:    item.thesisDocumentUrl ?? '',
      remarks:              item.remarks ?? '',
    })
    setModalOpen(true)
  }

  // Progress indicator for a record
  function progressCount(r: FacultyResearchSummary) {
    return [r.courseWorkCompleted, r.prePhDVivaVoce, r.finalThesisSubmitted].filter(Boolean).length
  }

  const columns: Column<FacultyResearchSummary>[] = [
    {
      key: 'facultyId', header: 'Faculty',
      render: r => (
        <div>
          <p className="font-medium text-sm text-slate-800">{getFacultyName(r.facultyId)}</p>
          <p className="text-xs text-slate-400">{r.department}</p>
        </div>
      ),
    },
    {
      key: 'thesisTitle', header: 'Thesis / Area',
      render: r => (
        <div>
          {r.thesisTitle
            ? <p className="text-sm text-slate-700 line-clamp-1">{r.thesisTitle}</p>
            : <p className="text-sm text-slate-400 italic">No thesis title</p>}
          <p className="text-xs text-slate-400">{r.researchArea}</p>
        </div>
      ),
    },
    {
      key: 'guideName', header: 'Guide',
      render: r => (
        <div>
          <p className="text-sm text-slate-700">{r.guideName}</p>
          <span className={clsx(
            'text-xs px-1.5 py-0.5 rounded-md font-medium',
            r.guideType === 'internal'
              ? 'bg-brand-50 text-brand-700'
              : 'bg-purple-50 text-purple-700',
          )}>
            {r.guideType === 'internal' ? 'Internal' : 'External'}
          </span>
        </div>
      ),
    },
    {
      key: 'courseWorkCompleted', header: 'Progress',
      render: r => {
        const count = progressCount(r)
        return (
          <div className="flex items-center gap-1.5">
            {[r.courseWorkCompleted, r.prePhDVivaVoce, r.finalThesisSubmitted].map((done, i) => (
              <div key={i} title={['Course Work', 'Pre-PhD Viva', 'Final Thesis'][i]}
                className={clsx('w-2.5 h-2.5 rounded-full', done ? 'bg-emerald-400' : 'bg-slate-200')} />
            ))}
            <span className="text-xs text-slate-400 ml-1">{count}/3</span>
          </div>
        )
      },
    },
    {
      key: 'researchStatus', header: 'Status',
      render: r => r.researchStatus
        ? <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{r.researchStatus}</span>
        : <span className="text-slate-300 text-xs">—</span>,
    },
    {
      key: 'thesisDocumentUrl', header: '',
      render: r => r.thesisDocumentUrl
        ? <a href={r.thesisDocumentUrl} target="_blank" rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-1.5 text-brand-500 hover:text-brand-700 hover:bg-brand-50 rounded-lg inline-flex">
            <FileText size={14} />
          </a>
        : null,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">Faculty Research Details</h3>
          <p className="text-sm text-slate-500">{data.length} records</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add
        </button>
      </div>

      {listError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {listError}
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }}
            placeholder="Search by faculty, thesis or area…" className="max-w-sm" />
        </div>
        <DataTable columns={columns} data={paginated} keyExtractor={r => r.id}
          total={filtered.length} page={page} limit={limit} onPageChange={setPage}
          emptyTitle="No research records yet"
          emptyDescription="Add a faculty research record using the button above." />
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Research Details' : 'Add Research Details'} size="lg">
        <div className="space-y-5">

          {/* ── Faculty Information ── */}
          <SectionHeader label="Faculty Information" />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField label="Faculty" required>
                <FacultyCombobox
                  facultyList={facultyList}
                  value={form.facultyId}
                  onChange={(id, dept) => setForm(f => ({ ...f, facultyId: id, department: dept }))}
                />
              </FormField>
            </div>
            <FormField label="Department">
              <input className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"
                value={form.department} readOnly
                placeholder="Auto-filled from selected faculty" />
            </FormField>
            <FormField label="Research Area">
              <input className="input-field" value={form.researchArea}
                onChange={e => set('researchArea', e.target.value)}
                placeholder="e.g. Machine Learning, VLSI" />
            </FormField>
          </div>

          {/* ── Guide Information ── */}
          <SectionHeader label="Guide Information" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Guide Name" required>
              <input className="input-field" value={form.guideName}
                onChange={e => set('guideName', e.target.value)}
                placeholder="Guide's full name" />
            </FormField>
            <FormField label="Guide Designation">
              <input className="input-field" value={form.guideDesignation ?? ''}
                onChange={e => set('guideDesignation', e.target.value)}
                placeholder="e.g. Professor" />
            </FormField>
            <FormField label="Guide Institution">
              <input className="input-field" value={form.guideInstitution ?? ''}
                onChange={e => set('guideInstitution', e.target.value)}
                placeholder="University or college name" />
            </FormField>
            <FormField label="Guide Type">
              <select className="input-field" value={form.guideType}
                onChange={e => set('guideType', e.target.value as 'internal' | 'external')}>
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </FormField>
          </div>

          {/* ── Research Details ── */}
          <SectionHeader label="Research Details" />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormField label="Thesis Title">
                <input className="input-field" value={form.thesisTitle ?? ''}
                  onChange={e => set('thesisTitle', e.target.value)}
                  placeholder="Full thesis title" />
              </FormField>
            </div>
            <FormField label="University">
              <input className="input-field" value={form.university ?? ''}
                onChange={e => set('university', e.target.value)}
                placeholder="Affiliated university" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Year of Registration">
                <input type="number" className="input-field" min={1990} max={2099}
                  value={form.yearOfRegistration ?? ''}
                  onChange={e => set('yearOfRegistration', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="YYYY" />
              </FormField>
              <FormField label="Year of Degree">
                <input type="number" className="input-field" min={1990} max={2099}
                  value={form.yearOfDegreeAwarded ?? ''}
                  onChange={e => set('yearOfDegreeAwarded', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="YYYY" />
              </FormField>
            </div>
          </div>

          {/* ── Research Progress ── */}
          <SectionHeader label="Research Progress" />
          <div className="space-y-2">
            <ProgressToggle label="Course Work Completed"
              checked={form.courseWorkCompleted}
              onChange={v => set('courseWorkCompleted', v)} />
            <ProgressToggle label="Pre-PhD Viva Voce Completed"
              checked={form.prePhDVivaVoce}
              onChange={v => set('prePhDVivaVoce', v)} />
            <ProgressToggle label="Final Thesis Submitted"
              checked={form.finalThesisSubmitted}
              onChange={v => set('finalThesisSubmitted', v)} />
          </div>

          {/* ── Additional ── */}
          <SectionHeader label="Additional" />
          <FormField label="Research Status">
            <input className="input-field" value={form.researchStatus ?? ''}
              onChange={e => set('researchStatus', e.target.value)}
              placeholder="e.g. Ongoing, Submitted, Awarded" />
          </FormField>
          <FormField label="Thesis Document (PDF)">
            <PdfUploader
              value={form.thesisDocumentUrl}
              onChange={url => set('thesisDocumentUrl', url)}
              deptId={deptId!} />
          </FormField>
          <FormField label="Remarks">
            <textarea className="input-field resize-none h-20" value={form.remarks ?? ''}
              onChange={e => set('remarks', e.target.value)}
              placeholder="Any additional notes…" />
          </FormField>
        </div>

        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            {editItem ? 'Save Changes' : 'Add Record'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Record"
        message="This research record will be permanently deleted."
        confirmLabel="Delete" />
    </div>
  )
}
