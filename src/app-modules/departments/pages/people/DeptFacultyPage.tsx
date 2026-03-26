import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Upload, FileText, X, Loader2, Edit2, Trash2 } from 'lucide-react'
import FacultySlideOver from '@/app-modules/faculty/components/FacultySlideOver'
import { facultyService } from '@/app-modules/faculty/api/facultyApi'
import { useFaculty } from '@/app-modules/faculty/hooks/useFaculty'
import type { Faculty } from '@/shared/types/models'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Badge, { statusVariant } from '@/shared/components/common/Badge'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'
import { useSearch } from '@/shared/hooks/useSearch'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import { useToast } from '@/shared/context/ToastContext'
import { uploadToS3 } from '@/shared/utils/s3Upload'

type Form = {
  name: string
  designation: string
  status: 'active' | 'inactive'
  profileImage: string
  cvUrl: string
  order: string
}

const blank = (): Form => ({
  name: '', designation: '', status: 'active',
  profileImage: '', cvUrl: '', order: '',
})

export default function DeptFacultyPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const dept = useDeptContext()
  const [slideOver, setSlideOver] = useState<Faculty | null>(null)
  const { success, error } = useToast()

  const [designationOptions, setDesignationOptions] = useState<string[]>([])
  const [designationFilter, setDesignationFilter] = useState('')
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const deleteDialog = useConfirmDialog()

  const [modalOpen, setModalOpen]           = useState(false)
  const [editItem, setEditItem]             = useState<Faculty | null>(null)
  const [form, setForm]                     = useState<Form>(blank)
  const [saving, setSaving]                 = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCv, setUploadingCv]       = useState(false)
  const [insertConfirmOpen, setInsertConfirmOpen] = useState(false)
  const photoRef                            = useRef<HTMLInputElement>(null)
  const cvRef                               = useRef<HTMLInputElement>(null)

  useEffect(() => {
    facultyService.getDesignationOptions()
      .then(setDesignationOptions)
      .catch(() => setDesignationOptions([]))
  }, [])

  const { faculty, loading, reload } = useFaculty({
    deptId:      deptId,
    search:      debouncedSearch || undefined,
    designation: designationFilter || undefined,
  })

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(faculty)

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }))

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadingPhoto(true)
    try {
      const url = await uploadToS3(file, 'faculty', `tmp-${Date.now()}`)
      set('profileImage', url)
    } catch {
      error('Photo upload failed')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleCv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadingCv(true)
    try {
      const url = await uploadToS3(file, 'faculty-cv', `tmp-${Date.now()}`)
      set('cvUrl', url)
    } catch {
      error('CV upload failed')
    } finally {
      setUploadingCv(false)
    }
  }

  const openAdd = () => {
    setEditItem(null)
    setForm(blank())
    setModalOpen(true)
  }

  const openEdit = (item: Faculty) => {
    setEditItem(item)
    setForm({
      name:         item.name,
      designation:  item.designation ?? '',
      status:       item.status,
      profileImage: item.profileImage ?? '',
      cvUrl:        item.cvUrl ?? '',
      order:        item.order !== undefined ? String(item.order) : '',
    })
    setModalOpen(true)
  }

  async function handleSave(insertMode = false) {
    if (!form.name.trim()) { error('Name is required'); return }

    const enteredOrder = form.order !== '' ? Number(form.order) : undefined
    if (!insertMode && enteredOrder !== undefined) {
      const conflict = faculty.find(f => f.order === enteredOrder && f.id !== editItem?.id)
      if (conflict) { setInsertConfirmOpen(true); return }
    }

    setSaving(true)
    try {
      if (editItem) {
        await facultyService.update(editItem.id, {
          name:         form.name.trim(),
          designation:  form.designation,
          deptId:       deptId,
          department:   dept.shortName,
          status:       form.status,
          profileImage: form.profileImage || undefined,
          cvUrl:        form.cvUrl || undefined,
          order:        enteredOrder,
          insertMode:   insertMode || undefined,
        })
        success('Faculty member updated')
      } else {
        await facultyService.create({
          name:         form.name.trim(),
          designation:  form.designation,
          deptId:       deptId,
          department:   dept.shortName,
          status:       form.status,
          profileImage: form.profileImage || undefined,
          cvUrl:        form.cvUrl || undefined,
          order:        enteredOrder,
          insertMode:   insertMode || undefined,
        })
        success('Faculty member added')
      }
      reload()
      setModalOpen(false)
      setInsertConfirmOpen(false)
    } catch (err) {
      error(err instanceof Error ? err.message : editItem ? 'Failed to update faculty' : 'Failed to add faculty')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await facultyService.delete(deleteDialog.targetId)
      reload()
      deleteDialog.close()
      success('Faculty member removed')
    } catch (err) {
      error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const designationSelectOptions = designationOptions.map(d => ({ value: d, label: d }))

  const columns: Column<Faculty>[] = [
    {
      key: 'name', header: 'Faculty',
      render: r => (
        <div className="flex items-center gap-3">
          {r.profileImage
            ? <img src={r.profileImage} alt={r.name} className="w-9 h-9 rounded-full object-cover" />
            : <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">{r.name[0]}</div>
          }
          <div>
            <p className="font-medium text-sm">{r.name}</p>
            <p className="text-xs text-slate-400">{r.designation}</p>
          </div>
        </div>
      ),
    },
    { key: 'designation', header: 'Designation', render: r => <span className="text-sm">{r.designation}</span> },
    { key: 'status',      header: 'Status',      render: r => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
    {
      key: 'actions', header: '', className: 'w-16',
      render: r => (
        <div className="flex items-center gap-1">
          <button
            onClick={e => { e.stopPropagation(); openEdit(r) }}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); deleteDialog.open(r.id) }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">Faculty</h3>
          <p className="text-sm text-slate-500">{faculty.length} faculty members · {dept.shortName}</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add Faculty
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }}
            placeholder="Search faculty..." className="max-w-xs" />
          <SelectFilter
            value={designationFilter}
            onChange={v => { setDesignationFilter(v); resetPage() }}
            options={designationSelectOptions}
            placeholder="All Designations"
            className="w-44"
          />
        </div>
        <DataTable columns={columns} data={paginated} loading={loading} keyExtractor={r => r.id}
          total={faculty.length} page={page} limit={limit} onPageChange={setPage}
          onRowClick={r => setSlideOver(r)}
          emptyTitle="No faculty in this department" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Faculty Member' : 'Add Faculty Member'} size="lg">
        <div className="space-y-4">

          <FormField label="Profile Photo">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                {form.profileImage
                  ? <img src={form.profileImage} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xl font-bold text-slate-400">
                      {form.name ? form.name[0].toUpperCase() : '?'}
                    </span>
                }
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50">
                  {uploadingPhoto ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploadingPhoto ? 'Uploading…' : 'Upload Photo'}
                </button>
                {form.profileImage && (
                  <button type="button" onClick={() => set('profileImage', '')}
                    className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                )}
              </div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
          </FormField>

          <FormField label="Full Name" required>
            <input className="input-field" value={form.name} placeholder="Dr. Jane Smith"
              onChange={e => set('name', e.target.value)} />
          </FormField>

          <FormField label="Designation">
            <select className="input-field" value={form.designation}
              onChange={e => set('designation', e.target.value)}>
              <option value="">Select designation</option>
              {designationOptions.map(d => <option key={d}>{d}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status">
              <select className="input-field" value={form.status}
                onChange={e => set('status', e.target.value as 'active' | 'inactive')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
            <FormField label="Display Order">
              <input className="input-field" type="number" min={1} value={form.order}
                onChange={e => set('order', e.target.value)}
                placeholder={`auto (${faculty.length + 1})`} />
            </FormField>
          </div>

          <FormField label="CV / Resume (PDF)">
            {form.cvUrl ? (
              <div className="flex items-center gap-2 p-2.5 border border-emerald-200 bg-emerald-50 rounded-lg">
                <FileText size={14} className="text-emerald-600 shrink-0" />
                <a href={form.cvUrl} target="_blank" rel="noreferrer"
                  className="text-sm text-emerald-700 flex-1 truncate hover:underline">View uploaded CV</a>
                <button type="button" onClick={() => set('cvUrl', '')}
                  className="text-slate-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => cvRef.current?.click()} disabled={uploadingCv}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50">
                  {uploadingCv ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploadingCv ? 'Uploading…' : 'Upload PDF'}
                </button>
                <span className="text-xs text-slate-400">PDF only</span>
              </div>
            )}
            <input ref={cvRef} type="file" accept=".pdf" className="hidden" onChange={handleCv} />
          </FormField>

        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={saving}>Cancel</button>
          <button onClick={() => handleSave()} className="btn-primary" disabled={saving || uploadingPhoto || uploadingCv}>
            {saving ? (editItem ? 'Saving…' : 'Adding…') : (editItem ? 'Save Changes' : 'Add Faculty')}
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
