import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { deptPeopleService } from '@/app-modules/departments/api/deptPeopleApi'
import type { CommitteeMember } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'

const COMMITTEES = ['DAB', 'PAC'] as const
type Committee = typeof COMMITTEES[number]

const COMMITTEE_LABELS: Record<Committee, string> = {
  DAB: 'Department Advisory Board',
  PAC: 'Program Assessment Committee',
}

const emptyForm = { name: '', designation: '' }

function CommitteeTab({ committee }: { committee: Committee }) {
  const { deptId } = useParams<{ deptId: string }>()
  const { success, error } = useToast()

  const { data, reload } = useDepartmentSectionAsync<CommitteeMember>(
    () => deptPeopleService.getCommitteeMembers(deptId!, committee)
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<CommitteeMember | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()

  function openAdd() { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(item: CommitteeMember) {
    setEditItem(item)
    setForm({ name: item.name, designation: item.designation })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { error('Member name is required'); return }
    setSaving(true)
    try {
      if (editItem) {
        await deptPeopleService.updateCommitteeMember(editItem.id, form)
        success('Member updated')
      } else {
        await deptPeopleService.createCommitteeMember({
          deptId: deptId!, committee, name: form.name, designation: form.designation, order: data.length + 1,
        })
        success('Member added')
      }
      reload()
      setModalOpen(false)
    } catch {
      error('Failed to save member')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await deptPeopleService.deleteCommitteeMember(deleteDialog.targetId)
      reload()
      deleteDialog.close()
      success('Member removed')
    } catch {
      error('Failed to remove member')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{data.length} member{data.length !== 1 ? 's' : ''}</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={14} /> Add Member
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="table-th w-16 text-center">S.No</th>
              <th className="table-th">Member Name</th>
              <th className="table-th">Designation</th>
              <th className="table-th w-20" />
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="table-td text-center text-slate-400 py-10">
                  No members added yet. Click &ldquo;Add Member&rdquo; to get started.
                </td>
              </tr>
            ) : (
              data.map((member, idx) => (
                <tr key={member.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="table-td text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="table-td font-medium text-slate-800">{member.name}</td>
                  <td className="table-td text-slate-600">{member.designation || <span className="text-slate-300">—</span>}</td>
                  <td className="table-td">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(member)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={13} /></button>
                      <button onClick={() => deleteDialog.open(member.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Member' : `Add Member — ${COMMITTEE_LABELS[committee]}`}>
        <div className="space-y-4">
          <FormField label="Member Name" required>
            <input className="input-field" placeholder="e.g. Dr. Ramesh Kumar" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="Designation">
            <input className="input-field" placeholder="e.g. Professor, Industry Expert" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={saving}>Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Member'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete} title="Remove Member" message="This member will be permanently removed from the committee." confirmLabel="Remove" />
    </>
  )
}

export default function AccreditationsPage() {
  const [activeTab, setActiveTab] = useState<Committee>('DAB')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-display">Accreditations</h1>
        <p className="text-sm text-slate-500 mt-1">Manage committee members for DAB and PAC.</p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {COMMITTEES.map(c => (
          <button key={c} onClick={() => setActiveTab(c)}
            className={clsx('px-5 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeTab === c ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {c}
            <span className="ml-1.5 hidden sm:inline text-xs font-normal opacity-70">— {COMMITTEE_LABELS[c]}</span>
          </button>
        ))}
      </div>

      <CommitteeTab key={activeTab} committee={activeTab} />
    </div>
  )
}
