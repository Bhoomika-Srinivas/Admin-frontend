import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { useCommittee } from '../hooks/useAlumni'
import { alumniService } from '../api/alumniApi'
import type { ExecutiveCommitteeMember, CommitteeRole } from '@/shared/types/models'
import { ALUMNI_DEPARTMENTS } from '@/shared/constants/departments'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'
import Badge from '@/shared/components/common/Badge'

const emptyForm: Omit<ExecutiveCommitteeMember, 'id'> = {
  name: '',
  roleType: 'MEMBER',
  designation: '',
  department: '',
  organization: '',
  order: 0,
}

const roleLabels: Record<CommitteeRole, string> = {
  PRESIDENT: 'President',
  SECRETARY: 'Secretary',
  TREASURER: 'Treasurer',
  MEMBER: 'Member',
}

const roleBadgeVariant: Record<CommitteeRole, 'yellow' | 'blue' | 'green' | 'gray'> = {
  PRESIDENT: 'yellow',
  SECRETARY: 'blue',
  TREASURER: 'green',
  MEMBER: 'gray',
}

export default function AlumniCommitteePage() {
  const toast = useToast()
  const { members, loading, reload } = useCommittee()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<ExecutiveCommitteeMember | null>(null)
  const [form, setForm] = useState<Omit<ExecutiveCommitteeMember, 'id'>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()

  const sortedMembers = [...members].sort((a, b) => a.order - b.order)

  const columns: Column<ExecutiveCommitteeMember>[] = [
    {
      key: 'order',
      header: '#',
      className: 'w-12',
      render: r => <span className="text-sm text-slate-500">{r.order}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: r => (
        <div className="flex items-center gap-3">
          {r.profileImage ? (
            <img src={r.profileImage} alt={r.name} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
              {r.name[0]}
            </div>
          )}
          <span className="font-medium text-sm text-slate-800">{r.name}</span>
        </div>
      ),
    },
    {
      key: 'roleType',
      header: 'Role',
      render: r => (
        <Badge variant={roleBadgeVariant[r.roleType]} className="text-xs font-semibold">
          {roleLabels[r.roleType]}
        </Badge>
      ),
    },
    { key: 'designation', header: 'Designation', render: r => <span className="text-sm text-slate-600">{r.designation}</span> },
    {
      key: 'department',
      header: 'Department',
      render: r => r.department ? <span className="text-sm text-slate-500">{r.department}</span> : <span className="text-sm text-slate-400 italic">—</span>,
    },
    {
      key: 'organization',
      header: 'Organization',
      render: r => r.organization ? <span className="text-sm text-slate-500">{r.organization}</span> : <span className="text-sm text-slate-400 italic">—</span>,
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
    setForm({ ...emptyForm, order: members.length + 1 })
    setModalOpen(true)
  }

  function openEdit(item: ExecutiveCommitteeMember) {
    setEditItem(item)
    setForm({
      name: item.name,
      roleType: item.roleType,
      designation: item.designation,
      department: item.department || '',
      organization: item.organization || '',
      order: item.order,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.designation.trim()) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      if (editItem) {
        await alumniService.updateCommitteeMember(editItem.id, form)
        toast.success('Member updated')
      } else {
        await alumniService.createCommitteeMember(form)
        toast.success('Member added')
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
      await alumniService.deleteCommitteeMember(deleteDialog.targetId)
      deleteDialog.close()
      await reload()
      toast.success('Member deleted')
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
          <h2 className="text-xl font-display font-bold text-slate-800">Executive Committee</h2>
          <p className="text-sm text-slate-500 mt-0.5">{members.length} members</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Member
        </button>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={sortedMembers}
          keyExtractor={r => r.id}
          emptyTitle="No committee members yet"
          emptyDescription="Add members to the Executive Committee (President, Secretary, Treasurer, Members)."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Member' : 'Add Committee Member'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Role" required>
              <select
                className="input-field"
                value={form.roleType}
                onChange={e => setForm(f => ({ ...f, roleType: e.target.value as CommitteeRole }))}
              >
                <option value="PRESIDENT">President</option>
                <option value="SECRETARY">Secretary</option>
                <option value="TREASURER">Treasurer</option>
                <option value="MEMBER">Member</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Designation" required>
              <input
                className="input-field"
                value={form.designation}
                onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                placeholder="e.g. Professor, Industry Expert"
              />
            </FormField>
            <FormField label="Display Order" required>
              <input
                className="input-field"
                type="number"
                value={form.order}
                onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department (optional)">
              <select
                className="input-field"
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              >
                <option value="">— None —</option>
                {ALUMNI_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="External Organization (optional)">
              <input
                className="input-field"
                value={form.organization}
                onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                placeholder="e.g. ABC Corp, Retd. Professor"
              />
            </FormField>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={saving}>
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            <Save size={14} /> {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Member'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Remove Committee Member"
        message="This member will be permanently removed from the committee."
        confirmLabel="Remove"
      />
    </div>
  )
}
