import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, ExternalLink, Upload, FileText, X } from 'lucide-react'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { deptCourseService, learningMaterialService } from '@/app-modules/departments/api/deptAcademicsApi'
import { adminProgramService } from '@/app-modules/departments/api/adminCoursesApi'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import type { LearningMaterial, LMaterialType, Faculty } from '@/shared/types/models'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useSearch } from '@/shared/hooks/useSearch'
import clsx from 'clsx'

type MaterialMeta = { label: string; color: string; bg: string; border: string }

const MATERIAL_TYPES: Record<LMaterialType, MaterialMeta> = {
  ppt:        { label: 'PPT / Slides',  color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200'  },
  notes:      { label: 'Notes',         color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200'    },
  pyq:        { label: 'PYQ',           color: 'text-purple-700',  bg: 'bg-purple-50',   border: 'border-purple-200'  },
  model_qp:   { label: 'Model QP',      color: 'text-indigo-700',  bg: 'bg-indigo-50',   border: 'border-indigo-200'  },
  lab_manual: { label: 'Lab Manual',    color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  reference:  { label: 'Reference',     color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200'   },
  assignment: { label: 'Assignment',    color: 'text-rose-700',    bg: 'bg-rose-50',     border: 'border-rose-200'    },
  other:      { label: 'Other',         color: 'text-slate-600',   bg: 'bg-slate-100',   border: 'border-slate-200'   },
}

const TYPE_OPTIONS = Object.entries(MATERIAL_TYPES).map(([v, m]) => ({ value: v, label: m.label }))

function TypeBadge({ type }: { type: LMaterialType }) {
  const m = MATERIAL_TYPES[type] ?? MATERIAL_TYPES.other
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium border', m.color, m.bg, m.border)}>
      {m.label}
    </span>
  )
}

type Form = { title: string; type: LMaterialType; uploadedBy: string; fileUrl: string }
const blank = (): Form => ({ title: '', type: 'notes', uploadedBy: '', fileUrl: '' })

function FileUploader({ value, onChange, deptId }: { value: string; onChange: (url: string) => void; deptId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    try {
      const url = await uploadToS3(file, 'dept-academics', deptId)
      onChange(url)
    } catch { setFileName('') }
  }

  function clear() { onChange(''); setFileName(''); if (inputRef.current) inputRef.current.value = '' }

  if (value && fileName) {
    return (
      <div className="flex items-center gap-2 p-2.5 border border-emerald-200 bg-emerald-50 rounded-lg">
        <FileText size={14} className="text-emerald-600 shrink-0" />
        <span className="text-sm text-emerald-700 flex-1 truncate">{fileName}</span>
        <button onClick={clear} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
          <Upload size={13} /> Upload File
        </button>
        <span className="text-xs text-slate-400">or</span>
        <input className="input-field text-sm flex-1" placeholder="Paste URL (https://...)"
          value={value && !fileName ? value : ''}
          onChange={e => { setFileName(''); onChange(e.target.value) }} />
      </div>
      <input ref={inputRef} type="file" className="hidden"
        accept=".pdf,.ppt,.pptx,.doc,.docx,.xlsx,.zip,.png,.jpg"
        onChange={handleFile} />
    </div>
  )
}

export default function DeptLMMaterialsPage() {
  const { deptId, programId, semester, batch, courseId } = useParams<{
    deptId: string; programId: string; semester: string; batch: string; courseId: string
  }>()
  const _sem     = Number(semester)
  const batchName = decodeURIComponent(batch!)
  const navigate = useNavigate()
  const toast    = useToast()
  const dept     = useDeptContext()
  const program  = adminProgramService.getById(programId!)

  const [allFaculty, setAllFaculty] = useState<Faculty[]>([])
  useEffect(() => { facultyService.getAll().then(setAllFaculty).catch(() => {}) }, [])

  // Fetch course from GraphQL by id
  const { data: allCourses } = useDepartmentSectionAsync(() => deptCourseService.getAll(deptId!))
  const course = allCourses.find(c => c.id === courseId)

  // Fetch materials from GraphQL filtered by courseCode
  const { data: materials, reload } = useDepartmentSectionAsync(
    () => course ? learningMaterialService.getAll(deptId!, course.code) : Promise.resolve([])
  )

  const [modalOpen, setModalOpen]   = useState(false)
  const [editItem, setEditItem]     = useState<LearningMaterial | null>(null)
  const [form, setForm]             = useState<Form>(blank)
  const [typeFilter, setTypeFilter] = useState('')
  const deleteDialog                = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => materials.filter(m => {
    const q = debouncedSearch.toLowerCase()
    return (
      (!q || m.title.toLowerCase().includes(q)) &&
      (!typeFilter || m.type === typeFilter)
    )
  }), [materials, debouncedSearch, typeFilter])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!course) { toast.error('Course not found'); return }

    const entry: Omit<LearningMaterial, 'id'> = {
      deptId:      deptId!,
      courseCode:  course.code,
      courseName:  course.name,
      title:       form.title.trim(),
      type:        form.type,
      uploadedBy:  form.uploadedBy,
      fileUrl:     form.fileUrl.trim(),
      uploadedAt:  new Date().toISOString(),
    }

    try {
      if (editItem) {
        await learningMaterialService.update(editItem.id, entry)
        toast.success('Material updated')
      } else {
        await learningMaterialService.create(entry)
        toast.success('Material uploaded')
      }
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await learningMaterialService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  function openAdd() { setEditItem(null); setForm(blank()); setModalOpen(true) }
  function openEdit(m: LearningMaterial) {
    setEditItem(m)
    setForm({ title: m.title, type: m.type, uploadedBy: m.uploadedBy ?? '', fileUrl: m.fileUrl ?? '' })
    setModalOpen(true)
  }

  const semBase   = `/departments/${deptId}/academics/materials/${programId}/${semester}`
  const batchBase = `${semBase}/${encodeURIComponent(batchName)}`

  const typeCounts = Object.keys(MATERIAL_TYPES).map(t => ({
    type: t as LMaterialType,
    count: materials.filter(m => m.type === t).length,
  })).filter(t => t.count > 0)

  const columns: Column<LearningMaterial>[] = [
    {
      key: 'title', header: 'Material',
      render: r => (
        <div>
          <p className="font-medium text-sm text-slate-800">{r.title}</p>
        </div>
      ),
    },
    { key: 'type',       header: 'Type',        render: r => <TypeBadge type={r.type} /> },
    { key: 'uploadedBy', header: 'Uploaded By',  render: r => <span className="text-sm text-slate-600">{r.uploadedBy || '—'}</span> },
    { key: 'uploadedAt', header: 'Date',         render: r => <span className="text-xs text-slate-400">{new Date(r.uploadedAt).toLocaleDateString()}</span> },
    {
      key: 'actions', header: '', className: 'w-24',
      render: r => (
        <div className="flex gap-1">
          {r.fileUrl && (
            <a href={r.fileUrl} target="_blank" rel="noreferrer"
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
              <ExternalLink size={14} />
            </a>
          )}
          <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={14} /></button>
          <button onClick={() => deleteDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm flex-wrap">
        <button onClick={() => navigate(`/departments/${deptId}/academics/materials`)} className="text-slate-500 hover:text-brand-600">Materials</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(`/departments/${deptId}/academics/materials/${programId}`)} className="text-slate-500 hover:text-brand-600">{program?.name}</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(semBase)} className="text-slate-500 hover:text-brand-600">Sem {semester}</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(batchBase)} className="text-slate-500 hover:text-brand-600">{batchName}</button>
        <span className="text-slate-300">›</span>
        <span className="text-slate-700 font-medium">{course?.code ?? '...'}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">
            {course?.code} — {course?.name}
          </h3>
          <p className="text-sm text-slate-500">
            {materials.length} material{materials.length !== 1 ? 's' : ''} • {dept.shortName} · Sem {semester} · {batchName}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Upload Material
        </button>
      </div>

      {typeCounts.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {typeCounts.map(({ type, count }) => {
            const m = MATERIAL_TYPES[type]
            return (
              <button key={type} onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
                className={clsx('text-xs px-2.5 py-1 rounded-full border font-medium transition-all', m.color, m.bg, m.border,
                  typeFilter === type && 'ring-1 ring-current')}>
                {m.label} · {count}
              </button>
            )
          })}
          {typeFilter && (
            <button onClick={() => setTypeFilter('')} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <X size={11} /> Clear
            </button>
          )}
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <SearchBar value={searchTerm} onChange={v => setSearchTerm(v)} placeholder="Search materials..." className="max-w-xs" />
          <SelectFilter value={typeFilter} onChange={v => setTypeFilter(v)} options={TYPE_OPTIONS} placeholder="All Types" className="w-44" />
        </div>
        <DataTable columns={columns} data={filtered} keyExtractor={r => r.id}
          total={filtered.length} emptyTitle="No materials yet" emptyDescription="Upload materials using the button above." />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Material' : 'Upload Material'} size="lg">
        <div className="space-y-4">
          <FormField label="Title" required>
            <input className="input-field" placeholder="e.g. Unit 3 Notes — Sorting Algorithms"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" required>
              <select className="input-field" value={form.type} onChange={e => set('type', e.target.value as LMaterialType)}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Uploaded By (Faculty)">
              <select className="input-field" value={form.uploadedBy} onChange={e => set('uploadedBy', e.target.value)}>
                <option value="">— Select Faculty —</option>
                {allFaculty.filter(f => f.status === 'active').map(f => (
                  <option key={f.id} value={f.name}>{f.name} ({f.department})</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="File / URL">
            <FileUploader value={form.fileUrl} onChange={v => set('fileUrl', v)} deptId={deptId!} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Upload'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Material" message="This material will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}
