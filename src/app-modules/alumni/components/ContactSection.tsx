import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { useAlumniContacts } from '../hooks/useAlumni'
import { alumniService } from '../api/alumniApi'
import type { AlumniContact, AlumniContactRole } from '@/shared/types/models'
import { ALUMNI_DEPARTMENTS } from '@/shared/constants/departments'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'
import Badge from '@/shared/components/common/Badge'

const emptyForm: Omit<AlumniContact, 'id'> = {
  name: '',
  roleType: 'DEAN_ALUMNI',
  department: '',
  designation: '',
  email: '',
}

const roleLabels: Record<AlumniContactRole, string> = {
  DEAN_ALUMNI: 'Dean - Alumni',
  DEAN_PR: 'Dean - PR',
}

const roleBadgeVariant: Record<AlumniContactRole, 'green' | 'blue' | 'yellow' | 'red'> = {
  DEAN_ALUMNI: 'green',
  DEAN_PR: 'yellow',
}

export default function ContactSection() {
  const toast = useToast()
  const { contacts, loading, reload } = useAlumniContacts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<AlumniContact | null>(null)
  const [form, setForm] = useState<Omit<AlumniContact, 'id'>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()

  const columns: Column<AlumniContact>[] = [
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
    { key: 'department', header: 'Department', render: r => <span className="text-sm text-slate-500">{r.department}</span> },
    { key: 'designation', header: 'Designation', render: r => <span className="text-sm text-slate-600">{r.designation}</span> },
    { key: 'email', header: 'Email', render: r => <span className="text-sm text-slate-600">{r.email}</span> },
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

  function openEdit(item: AlumniContact) {
    setEditItem(item)
    setForm({
      name: item.name,
      roleType: item.roleType,
      department: item.department,
      designation: item.designation,
      email: item.email,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.department || !form.email.trim()) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      if (editItem) {
        await alumniService.updateContact(editItem.id, form)
        toast.success('Contact updated')
      } else {
        await alumniService.createContact(form)
        toast.success('Contact added')
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
      await alumniService.deleteContact(deleteDialog.targetId)
      deleteDialog.close()
      await reload()
      toast.success('Contact deleted')
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
          <h3 className="text-base font-semibold text-slate-800">Contact Information</h3>
          <p className="text-xs text-slate-500 mt-0.5">{contacts.length} contacts</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Contact
        </button>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={contacts}
          keyExtractor={r => r.id}
          emptyTitle="No contacts yet"
          emptyDescription="Add contact information for Dean and other key personnel."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Contact' : 'Add Contact'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Role" required>
              <select
                className="input-field"
                value={form.roleType}
                onChange={e => setForm(f => ({ ...f, roleType: e.target.value as AlumniContactRole }))}
              >
                <option value="DEAN_ALUMNI">Dean - Alumni</option>
                <option value="DEAN_PR">Dean - PR</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <FormField label="Designation" required>
              <input
                className="input-field"
                value={form.designation}
                onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                placeholder="e.g. Professor"
              />
            </FormField>
          </div>
          <FormField label="Email" required>
            <input
              className="input-field"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="email@biet.edu"
            />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={saving}>
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            <Save size={14} /> {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Contact'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete Contact"
        message="This contact will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  )
}
