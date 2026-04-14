import { useState } from 'react'
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { admissionsService } from '../api/admissionsApi'
import { useEligibilityEntries } from '../hooks/useAdmissions'
import type { EligibilityEntry } from '@/shared/types/models'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'

const emptyForm: Omit<EligibilityEntry, 'id'> = { title: '', description: '', order: 1 }

export default function EligibilitySection() {
  const toast = useToast()
  const { data: entries, loading, reload } = useEligibilityEntries()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<EligibilityEntry | null>(null)
  const [form, setForm] = useState<Omit<EligibilityEntry, 'id'>>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()

  function openAdd() {
    setEditItem(null)
    setForm({ title: '', description: '', order: entries.length + 1 })
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(e: EligibilityEntry) {
    setEditItem(e)
    setForm({ title: e.title, description: e.description, order: e.order })
    setErrors({})
    setModalOpen(true)
  }

  async function handleSave() {
    const e: Record<string, string> = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (editItem) await admissionsService.updateEligibilityEntry(editItem.id, form)
      else          await admissionsService.createEligibilityEntry(form)
      reload(); setModalOpen(false); toast.success(editItem ? 'Entry updated' : 'Entry added')
    } catch {
      toast.error(editItem ? 'Failed to update entry' : 'Failed to add entry')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await admissionsService.deleteEligibilityEntry(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Entry deleted')
    } catch {
      toast.error('Failed to delete entry')
    }
  }

  async function moveUp(idx: number) {
    if (idx === 0) return
    const a = entries[idx - 1], b = entries[idx]
    try {
      await Promise.all([
        admissionsService.updateEligibilityEntry(a.id, { order: b.order }),
        admissionsService.updateEligibilityEntry(b.id, { order: a.order }),
      ])
      reload()
    } catch {
      toast.error('Failed to reorder')
    }
  }

  async function moveDown(idx: number) {
    if (idx === entries.length - 1) return
    const a = entries[idx], b = entries[idx + 1]
    try {
      await Promise.all([
        admissionsService.updateEligibilityEntry(a.id, { order: b.order }),
        admissionsService.updateEligibilityEntry(b.id, { order: a.order }),
      ])
      reload()
    } catch {
      toast.error('Failed to reorder')
    }
  }

  if (loading) return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Eligibility Criteria</h3>
          <p className="text-xs text-slate-500 mt-0.5">{entries.length} blocks • Each renders as an info card on the website</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Block
        </button>
      </div>

      {entries.length === 0 && (
        <div className="card p-10 text-center text-slate-400 text-sm">No eligibility blocks added yet.</div>
      )}

      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div key={entry.id} className="card p-4 flex items-start gap-4">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              {entry.order}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm">{entry.title}</p>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{entry.description}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex flex-col">
                <button onClick={() => moveUp(idx)} disabled={idx === 0}
                  className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveDown(idx)} disabled={idx === entries.length - 1}
                  className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronDown size={14} />
                </button>
              </div>
              <button onClick={() => openEdit(entry)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={13} /></button>
              <button onClick={() => deleteDialog.open(entry.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Eligibility Block' : 'Add Eligibility Block'} size="md">
        <div className="space-y-4">
          <FormField label="Title" required error={errors.title}>
            <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Academic Minimum, Degree Requirements" />
          </FormField>
          <FormField label="Description" required error={errors.description}>
            <textarea className="input-field resize-none h-32" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the eligibility requirement in detail..." />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Block'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Block" message="This eligibility block will be permanently removed." confirmLabel="Delete" />
    </div>
  )
}
