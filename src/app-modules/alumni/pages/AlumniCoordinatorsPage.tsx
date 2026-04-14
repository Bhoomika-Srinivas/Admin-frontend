import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Save, X, Mail } from 'lucide-react'
import { useCoordinators } from '../hooks/useAlumni'
import { alumniService } from '../api/alumniApi'
import type { AlumniCoordinator, CoordinatorRole } from '@/shared/types/models'
import { ALUMNI_DEPARTMENTS, DEPARTMENT_FILTER_OPTIONS } from '@/shared/constants/departments'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'
import Badge from '@/shared/components/common/Badge'
import SearchBar from '@/shared/components/filters/SearchBar'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'

const emptyForm: Omit<AlumniCoordinator, 'id'> = {
  name: '',
  roleType: 'COORDINATOR',
  department: '',
  email: null,
  isActive: true,
}

const roleLabels: Record<CoordinatorRole, string> = {
  DEAN: 'Dean',
  COORDINATOR: 'Coordinator',
}

const roleBadgeVariant: Record<CoordinatorRole, 'yellow' | 'green'> = {
  DEAN: 'yellow',
  COORDINATOR: 'green',
}

export default function AlumniCoordinatorsPage() {
  const toast = useToast()
  const [departmentFilter, setDepartmentFilter] = useState('')
  const { coordinators, loading, reload } = useCoordinators({ department: departmentFilter || undefined })
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<AlumniCoordinator | null>(null)
  const [form, setForm] = useState<Omit<AlumniCoordinator, 'id'>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => {
    if (!debouncedSearch) return coordinators
    const q = debouncedSearch.toLowerCase()
    return coordinators.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        (c.email?.toLowerCase() || '').includes(q)
    )
  }, [coordinators, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  const columns: Column<AlumniCoordinator>[] = [
    {
      key: 'name',
      header: 'Name',
      render: r => <span className="font-medium text-sm text-slate-800">{r.name}</span>,
    },
    {
      key: 'roleType',
      header: 'Role',
      render: r => (
        <Badge variant={roleBadgeVariant[r.roleType]} className="text-xs">
          {roleLabels[r.roleType]}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: r => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {r.department}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: r =>
        r.email ? (
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Mail size={12} className="text-slate-400" />
            {r.email}
          </div>
        ) : (
          <span className="text-sm text-slate-400 italic">— Not provided —</span>
        ),
    },
    {
      key: 'isActive',
      header: 'Status',
      className: 'w-24',
      render: r => (
        <Badge variant={r.isActive ? 'green' : 'gray'} className="text-xs">
          {r.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
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

  function openAdd() {
    setEditItem(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(item: AlumniCoordinator) {
    setEditItem(item)
    setForm({
      name: item.name,
      roleType: item.roleType,
      department: item.department,
      email: item.email,
      isActive: item.isActive,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.department) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      if (editItem) {
        await alumniService.updateCoordinator(editItem.id, form)
        toast.success('Coordinator updated')
      } else {
        await alumniService.createCoordinator(form)
        toast.success('Coordinator added')
      }
      await reload()
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
      await alumniService.deleteCoordinator(deleteDialog.targetId)
      deleteDialog.close()
      await reload()
      toast.success('Coordinator deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) {
    return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Coordinators</h2>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} coordinators</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Coordinator
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchBar
            value={searchTerm}
            onChange={v => {
              setSearchTerm(v)
              resetPage()
            }}
            placeholder="Search coordinators…"
            className="max-w-sm"
          />
          <div className="flex items-center gap-3 shrink-0">
            <select
              className="input-field text-sm py-1.5"
              value={departmentFilter}
              onChange={e => {
                setDepartmentFilter(e.target.value)
                resetPage()
              }}
            >
              {DEPARTMENT_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={r => r.id}
          total={filtered.length}
          page={page}
          limit={limit}
          onPageChange={setPage}
          emptyTitle="No coordinators yet"
          emptyDescription="Add Dean and Alumni Coordinators for each department."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Coordinator' : 'Add Coordinator'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Role" required>
              <select
                className="input-field"
                value={form.roleType}
                onChange={e => setForm(f => ({ ...f, roleType: e.target.value as CoordinatorRole }))}
              >
                <option value="DEAN">Dean</option>
                <option value="COORDINATOR">Coordinator</option>
              </select>
            </FormField>
          </div>
          <FormField label="Department" required>
            <select
              className="input-field"
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
            >
              <option value="">Select Department</option>
              {ALUMNI_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Email" hint="Optional - leave empty if not available">
            <input
              className="input-field"
              type="email"
              value={form.email || ''}
              onChange={e => setForm(f => ({ ...f, email: e.target.value || null }))}
              placeholder="email@biet.edu"
            />
          </FormField>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-slate-300"
            />
            <label htmlFor="isActive" className="text-sm text-slate-600">Active (visible on website)</label>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={saving}>
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            <Save size={14} /> {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Coordinator'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete Coordinator"
        message="This coordinator will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  )
}
