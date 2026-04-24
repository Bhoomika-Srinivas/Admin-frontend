import { useState, useMemo } from 'react'
import { Plus, Edit2, PowerOff } from 'lucide-react'
import { format } from 'date-fns'
import { useColleges } from '../hooks/useColleges'
import { collegeService } from '../api/collegeApi'
import { CollegeFormSchema, type CollegeFormData } from '../types'
import type { College } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useFormErrors } from '@/shared/hooks/useFormErrors'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import Badge, { statusVariant } from '@/shared/components/common/Badge'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'

const EMPTY_FORM: CollegeFormData = {
  name:       '',
  shortCode:  '',
  adminEmail: '',
}

export default function CollegeManagementPage() {
  const toast = useToast()
  const { colleges, loading, error, reload } = useColleges()
  const confirmDisable = useConfirmDialog<string>()
  const { errors, setErrors, clearErrors } = useFormErrors(CollegeFormSchema)

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<College | null>(null)
  const [form, setForm] = useState<CollegeFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [disabling, setDisabling] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return colleges
    return colleges.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.shortCode.toLowerCase().includes(q) ||
        c.adminEmail.toLowerCase().includes(q)
    )
  }, [colleges, search])

  function openCreate() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    clearErrors()
    setModalOpen(true)
  }

  function openEdit(college: College) {
    setEditTarget(college)
    setForm({ name: college.name, shortCode: college.shortCode, adminEmail: college.adminEmail })
    clearErrors()
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditTarget(null)
  }

  async function handleSave() {
    const parsed = CollegeFormSchema.safeParse(form)
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setErrors(
        Object.fromEntries(
          Object.entries(flat).map(([k, v]) => [k, v ?? []])
        ) as Record<string, string[]>
      )
      return
    }
    setSaving(true)
    try {
      if (editTarget) {
        await collegeService.update(editTarget.id, parsed.data)
        toast.success('College updated')
      } else {
        await collegeService.create(parsed.data)
        toast.success('College created')
      }
      closeModal()
      reload()
    } catch {
      toast.error(editTarget ? 'Failed to update college' : 'Failed to create college')
    } finally {
      setSaving(false)
    }
  }

  async function handleDisable() {
    if (!confirmDisable.targetId) return
    setDisabling(true)
    try {
      await collegeService.disable(confirmDisable.targetId)
      toast.success('College disabled')
      confirmDisable.close()
      reload()
    } catch {
      toast.error('Failed to disable college')
    } finally {
      setDisabling(false)
    }
  }

  const columns: Column<College>[] = [
    {
      key: 'name',
      header: 'College',
      render: row => (
        <div>
          <p className="font-medium text-slate-800">{row.name}</p>
          <p className="text-xs text-slate-400">{row.shortCode}</p>
        </div>
      ),
    },
    {
      key: 'adminEmail',
      header: 'Admin Email',
      render: row => <span className="text-sm text-slate-600">{row.adminEmail}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: row => <Badge variant={statusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: row => (
        <span className="text-sm text-slate-500">
          {row.createdAt ? format(new Date(row.createdAt), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: row => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="btn-secondary text-xs px-2 py-1">
            <Edit2 size={12} />
            Edit
          </button>
          {row.status === 'active' && (
            <button
              onClick={() => confirmDisable.open(row.id)}
              className="btn-danger text-xs px-2 py-1"
            >
              <PowerOff size={12} />
              Disable
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">College Management</h2>
          <p className="text-sm text-slate-500">
            {colleges.length} college{colleges.length !== 1 ? 's' : ''} • Create, edit, and disable tenant colleges
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Add College
        </button>
      </div>

      {error && (
        <p className="px-4 py-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {/* Filter row */}
      <div className="flex items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search colleges..."
          className="max-w-xs"
        />
      </div>

      {/* Table */}
      <DataTable<College>
        columns={columns}
        data={filtered}
        keyExtractor={r => r.id}
        loading={loading}
        emptyTitle="No colleges found"
      />

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editTarget ? 'Edit College' : 'Add College'}
      >
        <div className="space-y-4">
          <FormField label="College Name" error={errors.name?.[0]}>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Bapuji Institute of Engineering & Technology"
            />
          </FormField>
          <FormField
            label="Short Code"
            hint="Uppercase alphanumeric, e.g. BIET"
            error={errors.shortCode?.[0]}
          >
            <input
              type="text"
              className="input-field uppercase"
              value={form.shortCode}
              onChange={e => setForm(f => ({ ...f, shortCode: e.target.value.toUpperCase() }))}
              placeholder="BIET"
              maxLength={10}
            />
          </FormField>
          <FormField label="Admin Email" error={errors.adminEmail?.[0]}>
            <input
              type="email"
              className="input-field"
              value={form.adminEmail}
              onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))}
              placeholder="admin@college.edu"
            />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Create College'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Disable Confirm */}
      <ConfirmDialog
        open={confirmDisable.isOpen}
        title="Disable College"
        message="This college and all its users will lose access. This can be re-enabled later. Continue?"
        confirmLabel={disabling ? 'Disabling...' : 'Disable'}
        variant="danger"
        onConfirm={handleDisable}
        onClose={confirmDisable.close}
      />
    </div>
  )
}
