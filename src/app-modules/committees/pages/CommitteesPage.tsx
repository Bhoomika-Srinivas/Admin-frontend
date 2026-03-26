import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { committeeService } from '@/app-modules/committees/api/committeesApi'
import type { Committee } from '@/shared/types/models'
import { CommitteeSchema } from '@/app-modules/committees/types'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import Badge, { statusVariant } from '@/shared/components/common/Badge'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useCommittees } from '@/app-modules/committees/hooks/useCommittees'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useFormErrors } from '@/shared/hooks/useFormErrors'

const typeOptions = [
  { value: 'academic',       label: 'Academic' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'student',        label: 'Student' },
  { value: 'research',       label: 'Research' },
]

const emptyForm: Partial<Committee> = {
  name: '', type: 'academic', chairperson: '', members: [], status: 'active', description: ''
}

export default function CommitteesPage() {
  const { user } = useAuth()
  const toast = useToast()

  const { committees, loading, error, reload } = useCommittees()
  const [typeFilter, setTypeFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Committee | null>(null)
  const [form, setForm] = useState<Partial<Committee>>(emptyForm)
  const { errors, setErrors, validateField, clearErrors } = useFormErrors(CommitteeSchema)

  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const deleteDialog = useConfirmDialog()

  const filtered = useMemo(() => committees.filter(c => {
    const q = debouncedSearch.toLowerCase()
    return (
      (!q || c.name.toLowerCase().includes(q) || c.chairperson.toLowerCase().includes(q)) &&
      (!typeFilter || c.type === typeFilter)
    )
  }), [committees, debouncedSearch, typeFilter])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  function handleSave() {
    const parsed = CommitteeSchema.safeParse({ ...form, members: form.members ?? [] })
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearErrors()
    if (editItem) {
      committeeService.update(editItem.id, form, user)
      toast.success('Committee updated')
    } else {
      committeeService.create(form as Omit<Committee, 'id' | 'createdAt'>, user)
      toast.success('Committee created')
    }
    reload()
    setModalOpen(false)
  }

  function handleDelete() {
    if (!deleteDialog.targetId) return
    committeeService.delete(deleteDialog.targetId, user)
    reload()
    deleteDialog.close()
    toast.success('Committee deleted')
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); clearErrors(); setModalOpen(true) }
  const openEdit = (item: Committee) => { setEditItem(item); setForm(item); clearErrors(); setModalOpen(true) }

  const typeVariantMap: Record<Committee['type'], 'blue' | 'purple' | 'green' | 'yellow'> = {
    academic: 'blue', administrative: 'purple', student: 'green', research: 'yellow'
  }

  const columns: Column<Committee>[] = [
    {
      key: 'name', header: 'Committee',
      render: row => (
        <div>
          <p className="font-medium text-slate-800 text-sm">{row.name}</p>
          <p className="text-xs text-slate-400">{row.members.length} members</p>
        </div>
      )
    },
    { key: 'type',        header: 'Type',        render: row => <Badge variant={typeVariantMap[row.type]}>{row.type}</Badge> },
    { key: 'chairperson', header: 'Chairperson', render: row => <span className="text-sm">{row.chairperson}</span> },
    { key: 'description', header: 'Description', render: row => <span className="text-xs text-slate-500 line-clamp-2">{row.description}</span> },
    { key: 'status',      header: 'Status',      render: row => <Badge variant={statusVariant(row.status)}>{row.status}</Badge> },
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
          <h2 className="text-xl font-display font-bold text-slate-800">Committees</h2>
          <p className="text-sm text-slate-500">{filtered.length} committees</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Committee</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search committees..." className="flex-1" />
          <SelectFilter value={typeFilter} onChange={v => { setTypeFilter(v); resetPage() }} options={typeOptions} placeholder="All Types" className="sm:w-40" />
        </div>
        {error && <p className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</p>}
        <DataTable
          columns={columns} data={paginated} loading={loading} keyExtractor={r => r.id}
          total={filtered.length} page={page} limit={limit} onPageChange={setPage}
          emptyTitle="No committees found"
        />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); clearErrors() }} title={editItem ? 'Edit Committee' : 'Add Committee'} size="md">
        <div className="space-y-4">
          <FormField label="Committee Name" required error={errors.name?.[0]}>
            <input className="input-field" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onBlur={e => validateField('name', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" error={errors.type?.[0]}>
              <select className="input-field" value={form.type ?? ''} onChange={e => setForm(f => ({ ...f, type: e.target.value as Committee['type'] }))}>
                {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Status" error={errors.status?.[0]}>
              <select className="input-field" value={form.status ?? ''} onChange={e => setForm(f => ({ ...f, status: e.target.value as Committee['status'] }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>
          <FormField label="Chairperson" required error={errors.chairperson?.[0]}>
            <input className="input-field" value={form.chairperson ?? ''} onChange={e => setForm(f => ({ ...f, chairperson: e.target.value }))} onBlur={e => validateField('chairperson', e.target.value)} />
          </FormField>
          <FormField label="Members" hint="Comma separated names" error={errors.members?.[0]}>
            <input className="input-field" value={Array.isArray(form.members) ? form.members.join(', ') : ''} onChange={e => setForm(f => ({ ...f, members: e.target.value.split(',').map(m => m.trim()) }))} onBlur={e => validateField('members', e.target.value.split(',').map(m => m.trim()))} />
          </FormField>
          <FormField label="Description" error={errors.description?.[0]}>
            <textarea className="input-field h-24 resize-none" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} onBlur={e => validateField('description', e.target.value)} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Create Committee'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Committee" message="Are you sure you want to delete this committee?"
        confirmLabel="Delete"
      />
    </div>
  )
}
