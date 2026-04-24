import { useState, useMemo, useRef, useEffect } from 'react'
import { Plus, Edit2, Trash2, ExternalLink, Upload, X, Loader2 } from 'lucide-react'
import { deptAboutService } from '@/app-modules/departments/api/deptAboutApi'
import type { DistinguishedAlumnus } from '@/shared/types/models'
import { departmentService } from '@/app-modules/departments/api/departmentsApi'
import type { Department } from '@/shared/types/models'
import { useAuth } from '@/auth/AuthContext'
import { useDistinguishedAlumni } from '../hooks/useAlumni'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'
import SearchBar from '@/shared/components/filters/SearchBar'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { uploadToS3 } from '@/shared/utils/s3Upload'

const emptyForm: Omit<DistinguishedAlumnus, 'id' | 'deptId'> = {
  name: '', batch: '', currentRole: '', organization: '', achievement: '', imageUrl: '', linkedin: '',
}

export default function AlumniDistinguishedPage() {
  const toast = useToast()
  const { user } = useAuth()

  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState('')

  useEffect(() => {
    if (!user.tenantId) return
    departmentService.getAll(user.tenantId).then(setDepartments).catch(() => {})
  }, [user.tenantId])

  const { alumni, loading, reload } = useDistinguishedAlumni()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<DistinguishedAlumnus | null>(null)
  const [form, setForm] = useState<Omit<DistinguishedAlumnus, 'id' | 'deptId'>>(emptyForm)
  const [modalDeptId, setModalDeptId] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => {
    return alumni.filter(a => {
      if (selectedDeptId && a.deptId?.toLowerCase() !== selectedDeptId.toLowerCase()) return false
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase()
        if (
          !a.name.toLowerCase().includes(q) &&
          !a.currentRole.toLowerCase().includes(q) &&
          !a.organization.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [alumni, selectedDeptId, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  function openAdd() {
    setEditItem(null)
    setForm(emptyForm)
    const dept = departments.find(d => d.shortName.toLowerCase() === selectedDeptId.toLowerCase())
    setModalDeptId(dept?.id ?? '')
    setModalOpen(true)
  }

  function openEdit(item: DistinguishedAlumnus) {
    setEditItem(item)
    setForm({
      name:         item.name,
      batch:        item.batch,
      currentRole:  item.currentRole,
      organization: item.organization,
      achievement:  item.achievement,
      imageUrl:     item.imageUrl ?? '',
      linkedin:     item.linkedin ?? '',
    })
    setModalDeptId(item.deptId)
    setModalOpen(true)
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadingPhoto(true)
    try {
      const entityId = editItem?.id ?? `tmp-${Date.now()}`
      const url = await uploadToS3(file, 'alumni', entityId)
      setForm(f => ({ ...f, imageUrl: url }))
    } catch {
      toast.error('Photo upload failed')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSave() {
    if (!form.name || !form.batch) { toast.error('Name and batch are required'); return }
    if (!editItem && !modalDeptId) { toast.error('Please select a department'); return }
    setSaving(true)
    try {
      if (editItem) {
        await deptAboutService.updateAlumnus(editItem.id, form)
        toast.success('Updated')
      } else {
        await deptAboutService.createAlumnus({ ...form, deptId: modalDeptId })
        toast.success('Added')
      }
      await reload()
      setModalOpen(false)
    } catch {
      toast.error(editItem ? 'Failed to update alumnus' : 'Failed to add alumnus')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await deptAboutService.deleteAlumnus(deleteDialog.targetId)
      deleteDialog.close()
      await reload()
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete alumnus')
    }
  }

  const columns: Column<DistinguishedAlumnus>[] = [
    {
      key: 'name',
      header: 'Alumnus',
      render: r => (
        <div className="flex items-center gap-3">
          {r.imageUrl
            ? <img src={r.imageUrl} alt={r.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
            : <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">{r.name[0]}</div>
          }
          <div>
            <p className="font-medium text-sm text-slate-800">{r.name}</p>
            <p className="text-xs text-slate-400">Batch {r.batch}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Current Role',
      render: r => <span className="text-sm text-slate-700">{r.currentRole} @ {r.organization}</span>,
    },
    {
      key: 'achievement',
      header: 'Achievement',
      render: r => <span className="text-sm text-slate-500 line-clamp-2">{r.achievement || '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: r => (
        <div className="flex gap-1">
          {r.linkedin && (
            <a href={r.linkedin} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg">
              <ExternalLink size={14} />
            </a>
          )}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Distinguished Alumni</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Loading…' : `${filtered.length} alumni${selectedDeptId ? ' in selected department' : ' across all departments'}`}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Alumnus
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchBar
            value={searchTerm}
            onChange={v => { setSearchTerm(v); resetPage() }}
            placeholder="Search distinguished alumni…"
            className="max-w-sm"
          />
          <select
            className="input-field text-sm py-1.5 shrink-0"
            value={selectedDeptId}
            onChange={e => { setSelectedDeptId(e.target.value); resetPage() }}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.shortName}>{d.name} ({d.shortName})</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading…</div>
        ) : (
          <DataTable
            columns={columns}
            data={paginated}
            keyExtractor={r => r.id}
            total={filtered.length}
            page={page}
            limit={limit}
            onPageChange={setPage}
            emptyTitle="No distinguished alumni yet"
            emptyDescription={selectedDeptId ? 'No alumni found for this department.' : 'Add notable alumni to get started.'}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Alumnus' : 'Add Distinguished Alumnus'} size="lg">
        <div className="space-y-4">
          {!editItem && (
            <FormField label="Department" required>
              <select
                className="input-field"
                value={modalDeptId}
                onChange={e => setModalDeptId(e.target.value)}
              >
                <option value="">Select department…</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.shortName})</option>
                ))}
              </select>
            </FormField>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Batch" required>
              <input className="input-field" placeholder="e.g. 2010" value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} />
            </FormField>
            <FormField label="Current Role">
              <input className="input-field" value={form.currentRole} onChange={e => setForm(f => ({ ...f, currentRole: e.target.value }))} />
            </FormField>
            <FormField label="Organization">
              <input className="input-field" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Achievement">
            <textarea className="input-field h-20 resize-none" value={form.achievement} onChange={e => setForm(f => ({ ...f, achievement: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Profile Photo">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                  {form.imageUrl
                    ? <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                    : <span className="text-base font-bold text-slate-400">{form.name ? form.name[0].toUpperCase() : '?'}</span>
                  }
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50">
                    {uploadingPhoto ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    {uploadingPhoto ? 'Uploading…' : 'Upload'}
                  </button>
                  {form.imageUrl && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                      className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                  )}
                </div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </div>
            </FormField>
            <FormField label="LinkedIn URL">
              <input className="input-field" placeholder="https://linkedin.com/..." value={form.linkedin ?? ''} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} />
            </FormField>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={saving}>Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={saving || uploadingPhoto}>
            {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Remove Distinguished Alumnus"
        message="This alumnus will be permanently removed from the distinguished list."
        confirmLabel="Remove"
      />
    </div>
  )
}
