import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react'
import { useTimeline } from '../hooks/useAlumni'
import { alumniService } from '../api/alumniApi'
import type { TimelineEntry } from '@/shared/types/models'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'
import Badge from '@/shared/components/common/Badge'

const emptyForm: Omit<TimelineEntry, 'id'> = {
  year: '',
  title: '',
  description: '',
  order: 0,
  isActive: true,
}

// Verified default entries
const defaultEntries: Omit<TimelineEntry, 'id'>[] = [
  { year: '1994', title: 'Establishment', description: 'Founded by G.S. Shivanna and Sharanaprabhu', order: 1, isActive: true },
  { year: '2005', title: 'S.B. Patil Leadership', description: 'Leadership transition under S.B. Patil', order: 2, isActive: true },
  { year: '2009', title: 'Alumni Meet', description: 'First major alumni meet organized by B.T. Achyutha', order: 3, isActive: true },
  { year: '2010', title: 'Mega Alumni Meet', description: 'Grand alumni gathering led by M.C. Patel', order: 4, isActive: true },
  { year: '2012', title: 'Textile Alumni Meet', description: 'Global participation in Textile department alumni meet', order: 5, isActive: true },
]

export default function TimelineSection() {
  const toast = useToast()
  const { entries, loading, reload } = useTimeline()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<TimelineEntry | null>(null)
  const [form, setForm] = useState<Omit<TimelineEntry, 'id'>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const deleteDialog = useConfirmDialog()

  // Sort by order
  const sortedEntries = [...entries].sort((a, b) => a.order - b.order)

  const columns: Column<TimelineEntry>[] = [
    {
      key: 'order',
      header: '#',
      className: 'w-12',
      render: r => (
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-slate-300" />
          <span className="text-sm text-slate-500">{r.order}</span>
        </div>
      ),
    },
    { key: 'year', header: 'Year', className: 'w-24', render: r => <span className="font-semibold text-sm text-brand-700">{r.year}</span> },
    { key: 'title', header: 'Title', render: r => <span className="font-medium text-sm text-slate-800">{r.title}</span> },
    {
      key: 'description',
      header: 'Description',
      render: r => <span className="text-sm text-slate-600 line-clamp-1">{r.description}</span>,
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
    setForm({ ...emptyForm, order: entries.length + 1 })
    setModalOpen(true)
  }

  function openEdit(item: TimelineEntry) {
    setEditItem(item)
    setForm({
      year: item.year,
      title: item.title,
      description: item.description,
      order: item.order,
      isActive: item.isActive,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.year.trim() || !form.title.trim() || !form.description.trim()) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      if (editItem) {
        await alumniService.updateTimelineEntry(editItem.id, form)
        toast.success('Timeline entry updated')
      } else {
        await alumniService.createTimelineEntry(form)
        toast.success('Timeline entry added')
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
      await alumniService.deleteTimelineEntry(deleteDialog.targetId)
      deleteDialog.close()
      await reload()
      toast.success('Entry deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  async function seedDefaultData() {
    try {
      for (const entry of defaultEntries) {
        await alumniService.createTimelineEntry(entry)
      }
      await reload()
      toast.success('Default timeline entries added')
    } catch {
      toast.error('Failed to seed default data')
    }
  }

  if (loading) {
    return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Timeline / History</h3>
          <p className="text-xs text-slate-500 mt-0.5">{entries.length} entries • Key milestones in alumni association history</p>
        </div>
        <div className="flex gap-2">
          {entries.length === 0 && (
            <button onClick={seedDefaultData} className="btn-secondary flex items-center gap-1.5">
              Load Default Data
            </button>
          )}
          <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> Add Entry
          </button>
        </div>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={sortedEntries}
          keyExtractor={r => r.id}
          emptyTitle="No timeline entries yet"
          emptyDescription="Add key milestones in the history of the alumni association."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Entry' : 'Add Timeline Entry'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Year" required hint="e.g. 1994 or Jan 2012">
              <input
                className="input-field"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                placeholder="e.g. 1994"
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
          <FormField label="Title" required>
            <input
              className="input-field"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. First Alumni Meet"
            />
          </FormField>
          <FormField label="Description" required>
            <textarea
              className="input-field h-24 resize-none"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe this milestone…"
            />
          </FormField>
          <div className="flex items-center gap-2">
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
            <Save size={14} /> {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Entry'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete Timeline Entry"
        message="This entry will be permanently removed from the timeline."
        confirmLabel="Delete"
      />
    </div>
  )
}
