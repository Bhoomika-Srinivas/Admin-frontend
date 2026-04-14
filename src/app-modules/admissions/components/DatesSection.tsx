import { useState } from 'react'
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react'
import { admissionsService } from '../api/admissionsApi'
import { useImportantDates } from '../hooks/useAdmissions'
import type { ImportantDate } from '@/shared/types/models'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'

const emptyForm: Omit<ImportantDate, 'id'> = { title: '', date: '', description: '', category: '' }

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DatesSection() {
  const toast = useToast()
  const { data: dates, loading, reload } = useImportantDates()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<ImportantDate | null>(null)
  const [form, setForm] = useState<Omit<ImportantDate, 'id'>>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()

  function openAdd() { setEditItem(null); setForm(emptyForm); setErrors({}); setModalOpen(true) }
  function openEdit(d: ImportantDate) {
    setEditItem(d)
    setForm({ title: d.title, date: d.date, description: d.description, category: d.category })
    setErrors({})
    setModalOpen(true)
  }

  async function handleSave() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.date)         e.date  = 'Date is required'
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (editItem) await admissionsService.updateDate(editItem.id, form)
      else          await admissionsService.createDate(form)
      reload(); setModalOpen(false); toast.success(editItem ? 'Date updated' : 'Date added')
    } catch {
      toast.error(editItem ? 'Failed to update date' : 'Failed to add date')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await admissionsService.deleteDate(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Date deleted')
    } catch {
      toast.error('Failed to delete date')
    }
  }

  const columns: Column<ImportantDate>[] = [
    {
      key: 'title', header: 'Event',
      render: r => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
            <Calendar size={13} className="text-brand-600" />
          </div>
          <div>
            <p className="font-medium text-slate-800">{r.title}</p>
            {r.category && <p className="text-xs text-slate-400 mt-0.5">{r.category}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'date', header: 'Date',
      render: r => <span className="text-sm font-medium text-slate-600">{formatDate(r.date)}</span>,
    },
    {
      key: 'description', header: 'Notes',
      render: r => <span className="text-xs text-slate-400">{r.description || '—'}</span>,
    },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={13} /></button>
          <button onClick={() => deleteDialog.open(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ]

  if (loading) return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Important Dates</h3>
          <p className="text-xs text-slate-500 mt-0.5">{dates.length} entries</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Date
        </button>
      </div>

      <div className="card">
        <DataTable
          columns={columns} data={dates} keyExtractor={r => r.id}
          emptyTitle="No important dates added"
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Date' : 'Add Important Date'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Event Title" required error={errors.title}>
              <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. KCET Exam, Application Opens" />
            </FormField>
            <FormField label="Date" required error={errors.date}>
              <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Category" hint="Optional — e.g. Entrance Exam, Application, Results">
            <input className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Entrance Exam" />
          </FormField>
          <FormField label="Notes" hint="Optional additional details">
            <textarea className="input-field resize-none h-20" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Any additional details about this date..." />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Date'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Date" message="This date entry will be removed." confirmLabel="Delete" />
    </div>
  )
}
