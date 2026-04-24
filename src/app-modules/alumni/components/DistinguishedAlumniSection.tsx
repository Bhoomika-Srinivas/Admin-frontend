import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { deptAboutService } from '@/app-modules/departments/api/deptAboutApi'
import type { DistinguishedAlumnus } from '@/shared/types/models'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'
import SearchBar from '@/shared/components/filters/SearchBar'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'

interface Props {
  deptId: string
  alumni: DistinguishedAlumnus[]
  reload: () => void
}

const emptyForm: Omit<DistinguishedAlumnus, 'id' | 'deptId'> = {
  name: '',
  batch: '',
  currentRole: '',
  organization: '',
  achievement: '',
  imageUrl: '',
  linkedin: '',
}

export default function DistinguishedAlumniSection({ deptId, alumni, reload }: Props) {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<DistinguishedAlumnus | null>(null)
  const [form, setForm] = useState<Omit<DistinguishedAlumnus, 'id' | 'deptId'>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => {
    if (!debouncedSearch) return alumni
    const q = debouncedSearch.toLowerCase()
    return alumni.filter(
      a =>
        a.name.toLowerCase().includes(q) ||
        a.currentRole.toLowerCase().includes(q) ||
        a.organization.toLowerCase().includes(q)
    )
  }, [alumni, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  const columns: Column<DistinguishedAlumnus>[] = [
    {
      key: 'name',
      header: 'Alumnus',
      render: r => (
        <div className="flex items-center gap-3">
          {r.imageUrl ? (
            <img src={r.imageUrl} alt={r.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
              {r.name[0]}
            </div>
          )}
          <div>
            <span className="font-medium text-sm text-slate-800">{r.name}</span>
            <div className="text-xs text-slate-500">Batch {r.batch}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Current Role',
      render: r => (
        <div className="text-sm">
          <span className="font-medium text-slate-700">{r.currentRole}</span>
          <span className="text-slate-400"> @ </span>
          <span className="text-slate-600">{r.organization}</span>
        </div>
      ),
    },
    {
      key: 'achievement',
      header: 'Achievement',
      render: r => <span className="text-sm text-slate-600">{r.achievement || '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-20',
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

  function openEdit(item: DistinguishedAlumnus) {
    setEditItem(item)
    setForm({ name: item.name, batch: item.batch, currentRole: item.currentRole, organization: item.organization, achievement: item.achievement, imageUrl: item.imageUrl || '', linkedin: item.linkedin || '' })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.batch.trim() || !form.currentRole.trim() || !form.organization.trim()) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      if (editItem) {
        await deptAboutService.updateAlumnus(editItem.id, form)
        toast.success('Updated')
      } else {
        await deptAboutService.createAlumnus({ ...form, deptId })
        toast.success('Added')
      }
      reload()
      setModalOpen(false)
    } catch {
      toast.error(editItem ? 'Failed to update' : 'Failed to add')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await deptAboutService.deleteAlumnus(deleteDialog.targetId)
      deleteDialog.close()
      reload()
      toast.success('Removed')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">Distinguished Alumni ({filtered.length})</h3>
        <button onClick={() => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Alumnus
        </button>
      </div>
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search…" className="max-w-sm" />
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={r => r.id}
          total={filtered.length}
          page={page}
          limit={limit}
          onPageChange={setPage}
          emptyTitle="No distinguished alumni yet"
        />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit' : 'Add Distinguished Alumnus'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Batch" required>
              <input className="input-field" value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} placeholder="e.g. 2010" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Current Role" required>
              <input className="input-field" value={form.currentRole} onChange={e => setForm(f => ({ ...f, currentRole: e.target.value }))} />
            </FormField>
            <FormField label="Organization" required>
              <input className="input-field" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Achievement" hint="Optional">
            <input className="input-field" value={form.achievement} onChange={e => setForm(f => ({ ...f, achievement: e.target.value }))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={saving}><X size={14} /> Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={saving}><Save size={14} /> {saving ? 'Saving…' : 'Save'}</button>
        </ModalFooter>
      </Modal>
      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete} title="Remove Alumnus" message="This alumnus will be permanently removed." confirmLabel="Remove" />
    </div>
  )
}
