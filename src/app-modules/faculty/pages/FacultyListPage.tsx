import { useState, useRef, useEffect } from 'react'
import { Plus, Edit2, Trash2, Upload, X, FileText, Loader2 } from 'lucide-react'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'
import FacultySlideOver from '@/app-modules/faculty/components/FacultySlideOver'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import type { Faculty, Designation, Department } from '@/shared/types/models'
import { departmentService } from '@/app-modules/departments/api/departmentsApi'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { isSuperAdmin, canManageDepartment } from '@/shared/utils/permissions'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import Badge, { statusVariant } from '@/shared/components/common/Badge'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useFaculty } from '@/app-modules/faculty/hooks/useFaculty'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'


type FacultyForm = {
  name: string
  designation: Designation
  deptId: string
  profileImage: string
  cvUrl: string
  status: Faculty['status']
  order: string
}

const emptyForm = (): FacultyForm => ({
  name: '', designation: 'Assistant Professor', deptId: '',
  profileImage: '', cvUrl: '', status: 'active', order: '',
})

export default function FacultyListPage() {
  const { user } = useAuth()
  const toast = useToast()
  const superAdmin = isSuperAdmin(user)
  const [slideOver, setSlideOver] = useState<Faculty | null>(null)

  const [departments, setDepartments] = useState<Department[]>([])
  const [designationOptions, setDesignationOptions] = useState<{ value: string; label: string }[]>([])
  const [deptFilter, setDeptFilter] = useState('')
  const [designationFilter, setDesignationFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Faculty | null>(null)
  const [form, setForm] = useState<FacultyForm>(emptyForm())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)
  const [insertConfirmOpen, setInsertConfirmOpen] = useState(false)

  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const deleteDialog = useConfirmDialog()

  useEffect(() => {
    departmentService.getAll(user.tenantId ?? '').then(setDepartments).catch(() => setDepartments([]))
    facultyService.getDesignationOptions()
      .then(items => setDesignationOptions(items.map(d => ({ value: d, label: d }))))
      .catch(() => setDesignationOptions([]))
  }, [])

  const deptOptions = departments.map(d => ({ value: d.id, label: d.shortName }))

  const { faculty, loading, error, reload } = useFaculty({
    deptId:      deptFilter || undefined,
    designation: designationFilter || undefined,
    search:      debouncedSearch || undefined,
  })

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(faculty)

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadingImage(true)
    try {
      const entityId = editItem?.id ?? `tmp-${Date.now()}`
      const url = await uploadToS3(file, 'faculty', entityId)
      setForm(f => ({ ...f, profileImage: url }))
    } catch { toast.error('Image upload failed') }
    finally { setUploadingImage(false) }
  }

  async function handleCvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadingCv(true)
    try {
      const entityId = editItem?.id ?? `tmp-${Date.now()}`
      const url = await uploadToS3(file, 'faculty-cv', entityId)
      setForm(f => ({ ...f, cvUrl: url }))
    } catch { toast.error('CV upload failed') }
    finally { setUploadingCv(false) }
  }

  async function handleSave(insertMode = false) {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.designation) errs.designation = 'Designation is required'
    if (!form.deptId) errs.deptId = 'Department is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})

    const enteredOrder = form.order !== '' ? Number(form.order) : undefined
    if (!insertMode && enteredOrder !== undefined) {
      const conflict = faculty.find(f => f.order === enteredOrder && f.id !== editItem?.id)
      if (conflict) { setInsertConfirmOpen(true); return }
    }

    const dept = departments.find(d => d.id === form.deptId)
    try {
      if (editItem) {
        await facultyService.update(editItem.id, {
          ...form,
          department: dept?.shortName,
          order: enteredOrder,
          insertMode: insertMode || undefined,
        } as Record<string, unknown>)
        toast.success('Faculty updated')
      } else {
        await facultyService.create({
          ...form,
          department: dept?.shortName,
          order: enteredOrder,
          insertMode: insertMode || undefined,
        } as Record<string, unknown>)
        toast.success('Faculty added')
      }
      reload()
      setModalOpen(false)
      setInsertConfirmOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await facultyService.delete(deleteDialog.targetId)
      reload()
      deleteDialog.close()
      toast.success('Faculty deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const openAdd = () => {
    setEditItem(null)
    const defaultDept = superAdmin
      ? (deptOptions[0]?.value ?? '')
      : (departments.find(d => d.shortName === user.department)?.id ?? '')
    setForm({ ...emptyForm(), deptId: defaultDept })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (item: Faculty) => {
    setEditItem(item)
    setForm({
      name:         item.name,
      designation:  item.designation,
      deptId:       item.deptId ?? departments.find(d => d.shortName === item.department)?.id ?? '',
      profileImage: item.profileImage ?? '',
      cvUrl:        item.cvUrl ?? '',
      status:       item.status,
      order:        item.order !== undefined ? String(item.order) : '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const columns: Column<Faculty>[] = [
    {
      key: 'name', header: 'Faculty Member',
      render: row => (
        <div className="flex items-center gap-3">
          {row.profileImage ? (
            <img src={row.profileImage} alt={row.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-bold text-xs text-slate-600 flex-shrink-0">
              {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div>
            <p className="font-medium text-slate-800 text-sm">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'designation', header: 'Designation', render: row => <span className="text-sm">{row.designation}</span> },
    { key: 'department',  header: 'Dept',        render: row => <span className="badge badge-blue">{row.department}</span> },
    { key: 'status',      header: 'Status',      render: row => <Badge variant={statusVariant(row.status)}>{row.status}</Badge> },
    {
      key: 'actions', header: '', className: 'w-16',
      render: row => {
        const canEdit   = canManageDepartment(user, row.department)
        const canDelete = superAdmin
        return (
          <div className="flex items-center gap-1">
            {canEdit && (
              <button
                onClick={e => { e.stopPropagation(); openEdit(row) }}
                className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
              >
                <Edit2 size={14} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={e => { e.stopPropagation(); deleteDialog.open(row.id) }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )
      }
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Faculty</h2>
          <p className="text-sm text-slate-500">
            {faculty.length} faculty member{faculty.length !== 1 ? 's' : ''}
            {!superAdmin && user.department ? ` · ${user.department} dept` : ''}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Faculty</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search faculty..." className="flex-1" />
          {superAdmin && (
            <SelectFilter value={deptFilter} onChange={v => { setDeptFilter(v); resetPage() }} options={deptOptions} placeholder="All Departments" className="sm:w-40" />
          )}
          <SelectFilter value={designationFilter} onChange={v => { setDesignationFilter(v); resetPage() }} options={designationOptions} placeholder="All Designations" className="sm:w-44" />
        </div>
        {error && <p className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</p>}
        <DataTable
          columns={columns} data={paginated} loading={loading} keyExtractor={r => r.id}
          total={faculty.length} page={page} limit={limit} onPageChange={setPage}
          onRowClick={row => setSlideOver(row)}
          emptyTitle="No faculty members found"
        />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setErrors({}) }} title={editItem ? 'Edit Faculty' : 'Add Faculty'} size="lg">
        <div className="space-y-4">

          {/* Profile Image */}
          <FormField label="Profile Photo">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                {form.profileImage ? (
                  <img src={form.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-slate-400">
                    {form.name ? form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50">
                  {uploadingImage ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploadingImage ? 'Uploading…' : 'Upload Photo'}
                </button>
                {form.profileImage && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, profileImage: '' }))}
                    className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                )}
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            </div>
          </FormField>

          {/* Name */}
          <FormField label="Full Name" required error={errors.name}>
            <input className="input-field" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Dr. Anitha Rao" />
          </FormField>

          {/* Designation + Department */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Designation" required error={errors.designation}>
              <select className="input-field" value={form.designation}
                onChange={e => setForm(f => ({ ...f, designation: e.target.value as Designation }))}>
                {designationOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Department" required error={errors.deptId}>
              {superAdmin ? (
                <select className="input-field" value={form.deptId}
                  onChange={e => setForm(f => ({ ...f, deptId: e.target.value }))}>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.shortName} — {d.name}</option>)}
                </select>
              ) : (
                <input className="input-field bg-slate-50 cursor-not-allowed" value={user.department ?? ''} readOnly />
              )}
            </FormField>
          </div>

          {/* CV / Resume */}
          <FormField label="CV / Resume (PDF)">
            {form.cvUrl ? (
              <div className="flex items-center gap-2 p-2.5 border border-emerald-200 bg-emerald-50 rounded-lg">
                <FileText size={14} className="text-emerald-600 shrink-0" />
                <a href={form.cvUrl} target="_blank" rel="noreferrer"
                  className="text-sm text-emerald-700 flex-1 truncate hover:underline">
                  View uploaded CV
                </a>
                <button type="button" onClick={() => setForm(f => ({ ...f, cvUrl: '' }))}
                  className="text-slate-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => cvInputRef.current?.click()}
                  disabled={uploadingCv}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50">
                  {uploadingCv ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploadingCv ? 'Uploading…' : 'Upload PDF'}
                </button>
                <span className="text-xs text-slate-400">PDF only</span>
              </div>
            )}
            <input ref={cvInputRef} type="file" accept=".pdf" className="hidden" onChange={handleCvFile} />
          </FormField>

          {/* Status + Order */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status">
              <select className="input-field" value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Faculty['status'] }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
            <FormField label="Display Order">
              <input className="input-field" type="number" min={1} value={form.order}
                onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                placeholder={`auto (${faculty.length + 1})`} />
            </FormField>
          </div>

        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={() => handleSave()} className="btn-primary"
            disabled={uploadingImage || uploadingCv}>
            {editItem ? 'Save Changes' : 'Add Faculty'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Remove Faculty" message="Are you sure you want to remove this faculty member?"
        confirmLabel="Remove"
      />

      <ConfirmDialog
        open={insertConfirmOpen} onClose={() => setInsertConfirmOpen(false)} onConfirm={() => handleSave(true)}
        title="Order already taken"
        message={`Position ${form.order} is already occupied. Insert here and shift everything from position ${form.order} down by 1?`}
        confirmLabel="Insert & Shift"
      />

      {slideOver && (
        <FacultySlideOver faculty={slideOver} onClose={() => setSlideOver(null)} />
      )}
    </div>
  )
}
