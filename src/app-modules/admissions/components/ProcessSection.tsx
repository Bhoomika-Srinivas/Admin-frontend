import { useState } from 'react'
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { admissionsService } from '../api/admissionsApi'
import { useAdmissionSteps } from '../hooks/useAdmissions'
import type { AdmissionStep } from '@/shared/types/models'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'

const emptyForm: Omit<AdmissionStep, 'id'> = { order: 1, title: '', description: '', iconName: '' }

export default function ProcessSection() {
  const toast = useToast()
  const { data: steps, loading, reload } = useAdmissionSteps()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<AdmissionStep | null>(null)
  const [form, setForm] = useState<Omit<AdmissionStep, 'id'>>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()

  function openAdd() {
    setEditItem(null)
    setForm({ order: steps.length + 1, title: '', description: '', iconName: '' })
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(s: AdmissionStep) {
    setEditItem(s)
    setForm({ order: s.order, title: s.title, description: s.description, iconName: s.iconName })
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
      if (editItem) await admissionsService.updateStep(editItem.id, form)
      else          await admissionsService.createStep(form)
      reload(); setModalOpen(false); toast.success(editItem ? 'Step updated' : 'Step added')
    } catch {
      toast.error(editItem ? 'Failed to update step' : 'Failed to add step')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await admissionsService.deleteStep(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Step deleted')
    } catch {
      toast.error('Failed to delete step')
    }
  }

  async function moveUp(idx: number) {
    if (idx === 0) return
    const ids = steps.map(s => s.id)
    ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
    try {
      await admissionsService.reorderSteps(ids)
      reload()
    } catch {
      toast.error('Failed to reorder')
    }
  }

  async function moveDown(idx: number) {
    if (idx === steps.length - 1) return
    const ids = steps.map(s => s.id)
    ;[ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
    try {
      await admissionsService.reorderSteps(ids)
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
          <h3 className="text-base font-semibold text-slate-800">Admission Process</h3>
          <p className="text-xs text-slate-500 mt-0.5">{steps.length} steps • Use arrows to reorder</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Step
        </button>
      </div>

      {steps.length === 0 && (
        <div className="card p-10 text-center text-slate-400 text-sm">No steps added yet.</div>
      )}

      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div key={step.id} className="card p-4 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              {step.order}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm">{step.title}</p>
              <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{step.description}</p>
              {step.iconName && (
                <p className="text-xs text-slate-400 mt-1">Icon: {step.iconName}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex flex-col">
                <button onClick={() => moveUp(idx)} disabled={idx === 0}
                  className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveDown(idx)} disabled={idx === steps.length - 1}
                  className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronDown size={14} />
                </button>
              </div>
              <button onClick={() => openEdit(step)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={13} /></button>
              <button onClick={() => deleteDialog.open(step.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Step' : 'Add Step'} size="md">
        <div className="space-y-4">
          <FormField label="Step Title" required error={errors.title}>
            <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Apply Online" />
          </FormField>
          <FormField label="Description" required error={errors.description}>
            <textarea className="input-field resize-none h-28" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe what the applicant needs to do in this step..." />
          </FormField>
          <FormField label="Icon Name" hint="Optional — Lucide icon name (e.g. ClipboardList)">
            <input className="input-field" value={form.iconName} onChange={e => setForm(f => ({ ...f, iconName: e.target.value }))} placeholder="e.g. ClipboardList" />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Step'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Step" message="This step will be permanently removed." confirmLabel="Delete" />
    </div>
  )
}
