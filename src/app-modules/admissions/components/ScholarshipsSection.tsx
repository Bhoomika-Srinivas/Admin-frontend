import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { admissionsService } from '../api/admissionsApi'
import { useScholarships } from '../hooks/useAdmissions'
import type { Scholarship } from '@/shared/types/models'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'

const CATEGORIES: Scholarship['category'][] = ['State', 'Government of India', 'Institutional', 'Others']

const categoryColors: Record<Scholarship['category'], string> = {
  'State':               'bg-blue-50 text-blue-700',
  'Government of India': 'bg-green-50 text-green-700',
  'Institutional':       'bg-purple-50 text-purple-700',
  'Others':              'bg-amber-50 text-amber-700',
}

const emptyForm: Omit<Scholarship, 'id'> = {
  category: 'State', name: '', description: '', amount: '', eligibility: '', order: 0,
}

export default function ScholarshipsSection() {
  const toast = useToast()
  const { data: scholarships, loading, reload } = useScholarships()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Scholarship | null>(null)
  const [form, setForm] = useState<Omit<Scholarship, 'id'>>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()

  function openAdd() { setEditItem(null); setForm(emptyForm); setErrors({}); setModalOpen(true) }
  function openEdit(s: Scholarship) {
    setEditItem(s)
    setForm({
      category:    s.category,
      name:        s.name,
      description: s.description,
      amount:      s.amount,
      eligibility: s.eligibility,
      order:       s.order,
    })
    setErrors({})
    setModalOpen(true)
  }

  async function handleSave() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (editItem) await admissionsService.updateScholarship(editItem.id, form)
      else          await admissionsService.createScholarship(form)
      reload(); setModalOpen(false); toast.success(editItem ? 'Scholarship updated' : 'Scholarship added')
    } catch {
      toast.error(editItem ? 'Failed to update scholarship' : 'Failed to add scholarship')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await admissionsService.deleteScholarship(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Scholarship deleted')
    } catch {
      toast.error('Failed to delete scholarship')
    }
  }

  if (loading) return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Scholarships</h3>
          <p className="text-xs text-slate-500 mt-0.5">{scholarships.length} scholarships across {CATEGORIES.length} sections</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Scholarship
        </button>
      </div>

      <div className="space-y-4">
        {CATEGORIES.map(cat => {
          const items = scholarships.filter(s => s.category === cat)
          return (
            <div key={cat} className="card">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${categoryColors[cat]}`}>{cat}</span>
                <span className="text-xs text-slate-400">{items.length} {items.length === 1 ? 'entry' : 'entries'}</span>
              </div>
              {items.length === 0 ? (
                <p className="px-4 py-4 text-xs text-slate-400">No scholarships in this section.</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {items.map(s => (
                    <div key={s.id} className="px-4 py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                        )}
                        {s.amount && (
                          <p className="text-xs text-slate-400 mt-0.5">Amount: {s.amount}</p>
                        )}
                        {s.eligibility && (
                          <p className="text-xs text-slate-400 mt-0.5">Eligibility: {s.eligibility}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={13} /></button>
                        <button onClick={() => deleteDialog.open(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Scholarship' : 'Add Scholarship'} size="md">
        <div className="space-y-4">
          <FormField label="Section" required>
            <select className="input-field" value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as Scholarship['category'] }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Scholarship Name" required error={errors.name}>
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Post-Matric Scholarship" />
          </FormField>
          <FormField label="Amount" hint="Optional">
            <input className="input-field" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="e.g. ₹15,000/year" />
          </FormField>
          <FormField label="Eligibility" hint="Optional">
            <input className="input-field" value={form.eligibility} onChange={e => setForm(f => ({ ...f, eligibility: e.target.value }))}
              placeholder="e.g. SC/ST students with >60% marks" />
          </FormField>
          <FormField label="Description" hint="Optional">
            <textarea className="input-field resize-none h-20" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the scholarship..." />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Scholarship'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Scholarship" message="This scholarship entry will be permanently removed." confirmLabel="Delete" />
    </div>
  )
}
