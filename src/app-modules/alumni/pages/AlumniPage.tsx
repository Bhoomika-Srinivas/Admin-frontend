import { useState } from 'react'
import { Plus, Edit2, Trash2, Linkedin } from 'lucide-react'
import { alumniService } from '@/app-modules/alumni/api/alumniApi'
import type { Alumni } from '@/shared/types/models'
import { AlumniSchema } from '@/app-modules/alumni/types'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useAlumni } from '@/app-modules/alumni/hooks/useAlumni'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useFormErrors } from '@/shared/hooks/useFormErrors'

const deptOptions = [
  { value: 'CSE', label: 'CSE' }, { value: 'ECE', label: 'ECE' },
  { value: 'ME', label: 'ME' }, { value: 'Civil', label: 'Civil' },
  { value: 'EEE', label: 'EEE' }, { value: 'AIML', label: 'AIML' },
]

const emptyForm: Partial<Alumni> = {
  name: '', batch: '', department: 'CSE', company: '', designation: '', location: '', email: '', linkedin: ''
}

export default function AlumniPage() {
  const toast = useToast()

  const [deptFilter, setDeptFilter] = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Alumni | null>(null)
  const [form, setForm] = useState<Partial<Alumni>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const { errors, setErrors, validateField, clearErrors } = useFormErrors(AlumniSchema)

  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const deleteDialog = useConfirmDialog()

  const { alumni: allAlumni, loading, error, reload } = useAlumni({
    search: debouncedSearch || undefined,
    batch:  batchFilter    || undefined,
  })

  const alumni = deptFilter
    ? allAlumni.filter(a => a.department === deptFilter)
    : allAlumni

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(alumni)

  async function handleSave() {
    const parsed = AlumniSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearErrors()
    setSaving(true)
    try {
      if (editItem) {
        await alumniService.update(editItem.id, form as Record<string, unknown>)
        toast.success('Alumni updated')
      } else {
        await alumniService.create(form as Record<string, unknown>)
        toast.success('Alumni added')
      }
      reload()
      setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await alumniService.delete(deleteDialog.targetId)
      reload()
      deleteDialog.close()
      toast.success('Alumni deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); clearErrors(); setModalOpen(true) }
  const openEdit = (item: Alumni) => { setEditItem(item); setForm(item); clearErrors(); setModalOpen(true) }

  const columns: Column<Alumni>[] = [
    {
      key: 'name', header: 'Alumni',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold text-xs">
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-slate-800 text-sm">{row.name}</p>
            <p className="text-xs text-slate-400">Batch {row.batch} · {row.department}</p>
          </div>
        </div>
      )
    },
    { key: 'company',     header: 'Company',     render: row => <span className="font-medium text-sm">{row.company}</span> },
    { key: 'designation', header: 'Designation', render: row => <span className="text-sm text-slate-600">{row.designation}</span> },
    { key: 'location',    header: 'Location',    render: row => <span className="text-xs text-slate-500">📍 {row.location}</span> },
    {
      key: 'linkedin', header: '',
      render: row => row.linkedin ? (
        <a href={row.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
          <Linkedin size={15} />
        </a>
      ) : null
    },
    {
      key: 'actions', header: '', className: 'w-20',
      render: row => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <Edit2 size={14} />
          </button>
          <button onClick={() => deleteDialog.open(row.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={14} />
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Alumni</h2>
          <p className="text-sm text-slate-500">{alumni.length} alumni registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Alumni</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search alumni..." className="flex-1" />
          <SelectFilter value={deptFilter} onChange={v => { setDeptFilter(v); resetPage() }} options={deptOptions} placeholder="All Departments" className="sm:w-40" />
          <SelectFilter value={batchFilter} onChange={v => { setBatchFilter(v); resetPage() }} options={[...new Set(alumni.map(a => a.batch))].sort().reverse().map(b => ({ value: b, label: `Batch ${b}` }))} placeholder="All Batches" className="sm:w-36" />
        </div>
        {error && <p className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</p>}
        <DataTable
          columns={columns} data={paginated} loading={loading} keyExtractor={r => r.id}
          total={alumni.length} page={page} limit={limit} onPageChange={setPage}
          emptyTitle="No alumni found"
        />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); clearErrors() }} title={editItem ? 'Edit Alumni' : 'Add Alumni'} size="md">
        <div className="space-y-4">
          <FormField label="Full Name" required error={errors.name?.[0]}>
            <input className="input-field" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onBlur={e => validateField('name', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Batch Year" required error={errors.batch?.[0]}>
              <input className="input-field" value={form.batch ?? ''} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} placeholder="e.g. 2015" onBlur={e => validateField('batch', e.target.value)} />
            </FormField>
            <FormField label="Department" required error={errors.department?.[0]}>
              <select className="input-field" value={form.department ?? ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                {deptOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Current Company" required error={errors.company?.[0]}>
              <input className="input-field" value={form.company ?? ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} onBlur={e => validateField('company', e.target.value)} />
            </FormField>
            <FormField label="Designation" required error={errors.designation?.[0]}>
              <input className="input-field" value={form.designation ?? ''} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} onBlur={e => validateField('designation', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Location" error={errors.location?.[0]}>
            <input className="input-field" value={form.location ?? ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, Country" onBlur={e => validateField('location', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" error={errors.email?.[0]}>
              <input type="email" className="input-field" value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onBlur={e => validateField('email', e.target.value)} />
            </FormField>
            <FormField label="LinkedIn Profile" error={errors.linkedin?.[0]}>
              <input className="input-field" value={form.linkedin ?? ''} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." onBlur={e => validateField('linkedin', e.target.value)} />
            </FormField>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>{editItem ? 'Save Changes' : 'Add Alumni'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Remove Alumni" message="Are you sure you want to remove this alumni from the directory?"
        confirmLabel="Remove"
      />
    </div>
  )
}
