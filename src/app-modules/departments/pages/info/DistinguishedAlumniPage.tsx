import { useState, useMemo, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, ExternalLink, Upload, X, Loader2 } from 'lucide-react'
import { deptAboutService } from '@/app-modules/departments/api/deptAboutApi'
import type { DistinguishedAlumnus } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'
import { useSearch } from '@/shared/hooks/useSearch'
import SearchBar from '@/shared/components/filters/SearchBar'

const emptyForm: Omit<DistinguishedAlumnus, 'id' | 'deptId'> = {
  name: '', batch: '', currentRole: '', organization: '', achievement: '', imageUrl: '', linkedin: '',
}

export default function DistinguishedAlumniPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast = useToast()

  const loader = useCallback(
    () => deptAboutService.getAlumni(deptId!),
    [deptId],
  )
  const { data, reload } = useDepartmentSectionAsync(loader)

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<DistinguishedAlumnus | null>(null)
  const [form, setForm] = useState<Omit<DistinguishedAlumnus, 'id' | 'deptId'>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => data.filter(a => {
    const q = debouncedSearch.toLowerCase()
    return !q || a.name.toLowerCase().includes(q) || a.organization.toLowerCase().includes(q)
  }), [data, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleSave() {
    if (!form.name || !form.batch) { toast.error('Name and batch are required'); return }
    setSaving(true)
    try {
      if (editItem) {
        await deptAboutService.updateAlumnus(editItem.id, form)
        toast.success('Updated')
      } else {
        await deptAboutService.createAlumnus({ ...form, deptId: deptId! })
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

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (item: DistinguishedAlumnus) => {
    setEditItem(item)
    setForm({ name: item.name, batch: item.batch, currentRole: item.currentRole, organization: item.organization, achievement: item.achievement, imageUrl: item.imageUrl ?? '', linkedin: item.linkedin ?? '' })
    setModalOpen(true)
  }

  const columns: Column<DistinguishedAlumnus>[] = [
    {
      key: 'name', header: 'Alumnus',
      render: r => (
        <div className="flex items-center gap-3">
          {r.imageUrl
            ? <img src={r.imageUrl} alt={r.name} className="w-9 h-9 rounded-full object-cover" />
            : <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">{r.name[0]}</div>
          }
          <div>
            <p className="font-medium text-sm">{r.name}</p>
            <p className="text-xs text-slate-400">Batch {r.batch}</p>
          </div>
        </div>
      ),
    },
    { key: 'currentRole', header: 'Current Role', render: r => <span className="text-sm">{r.currentRole} @ {r.organization}</span> },
    { key: 'achievement', header: 'Achievement', render: r => <span className="text-sm text-slate-500 line-clamp-2">{r.achievement}</span> },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1">
          {r.linkedin && <a href={r.linkedin} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"><ExternalLink size={14} /></a>}
          <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={14} /></button>
          <button onClick={() => deleteDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">Distinguished Alumni</h3>
          <p className="text-sm text-slate-500">{data.length} alumni</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Add Alumnus</button>
      </div>
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search alumni..." className="max-w-sm" />
        </div>
        <DataTable columns={columns} data={paginated} keyExtractor={r => r.id} total={filtered.length} page={page} limit={limit} onPageChange={setPage} emptyTitle="No alumni yet" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Alumnus' : 'Add Distinguished Alumnus'} size="lg">
        <div className="space-y-4">
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
                    : <span className="text-base font-bold text-slate-400">
                        {form.name ? form.name[0].toUpperCase() : '?'}
                      </span>
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
          <button onClick={handleSave} className="btn-primary" disabled={saving || uploadingPhoto}>{saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete} title="Remove Alumnus" message="This alumnus record will be permanently deleted." confirmLabel="Remove" />
    </div>
  )
}
