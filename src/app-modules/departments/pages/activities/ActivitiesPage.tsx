import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, Pencil, Calendar, Activity, Info } from 'lucide-react'
import {
  forumSectionService, forumEventService, departmentActivityService,
} from '@/app-modules/departments/api/deptActivitiesApi'
import type { ForumSection, ForumEvent, DepartmentActivity } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import clsx from 'clsx'

// ── Shared colour palette (same as Achievements) ──────────────────────────────

const CARD_COLORS = [
  { bg: 'bg-blue-50',    border: 'border-blue-200',    accent: 'bg-blue-500',    dot: 'bg-blue-400'    },
  { bg: 'bg-purple-50',  border: 'border-purple-200',  accent: 'bg-purple-500',  dot: 'bg-purple-400'  },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-500', dot: 'bg-emerald-400' },
  { bg: 'bg-amber-50',   border: 'border-amber-200',   accent: 'bg-amber-500',   dot: 'bg-amber-400'   },
  { bg: 'bg-rose-50',    border: 'border-rose-200',    accent: 'bg-rose-500',    dot: 'bg-rose-400'    },
  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  accent: 'bg-indigo-500',  dot: 'bg-indigo-400'  },
  { bg: 'bg-teal-50',    border: 'border-teal-200',    accent: 'bg-teal-500',    dot: 'bg-teal-400'    },
  { bg: 'bg-orange-50',  border: 'border-orange-200',  accent: 'bg-orange-500',  dot: 'bg-orange-400'  },
]

const TABS = ['Forum Activities', 'Department Activities'] as const
type Tab = typeof TABS[number]

// ── Forum Info Card ────────────────────────────────────────────────────────────

function ForumInfoCard({
  section, onEdit,
}: {
  section: ForumSection | null
  onEdit: () => void
}) {
  if (!section) {
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800">Forum not configured</p>
          <p className="text-xs text-amber-700 mt-0.5">Set the forum title and description to get started.</p>
        </div>
        <button onClick={onEdit}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-medium transition-colors shrink-0">
          <Pencil size={12} /> Configure
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
        <Calendar size={18} className="text-brand-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-brand-800 text-base leading-tight">{section.title}</p>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{section.description}</p>
      </div>
      <button onClick={onEdit}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 border border-slate-200 rounded-lg transition-colors shrink-0">
        <Pencil size={12} /> Edit
      </button>
    </div>
  )
}

// ── Forum Event Card ───────────────────────────────────────────────────────────

function ForumEventCard({
  event, onEdit, onDelete,
}: {
  event: ForumEvent
  onEdit: (e: ForumEvent) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="card flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1 bg-brand-500" />
      <div className="flex-1 p-4 space-y-2">
        <p className="font-semibold text-sm text-slate-800 leading-tight">{event.title}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{event.description}</p>
      </div>
      <div className="flex items-center gap-1 px-3 py-2 border-t border-slate-100">
        <button onClick={() => onEdit(event)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors">
          <Edit2 size={12} /> Edit
        </button>
        <button onClick={() => onDelete(event.id)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  )
}

// ── Department Activity Card ───────────────────────────────────────────────────

function ActivityCard({
  item, index, onEdit, onDelete,
}: {
  item: DepartmentActivity
  index: number
  onEdit: (item: DepartmentActivity) => void
  onDelete: (id: string) => void
}) {
  const c = CARD_COLORS[index % CARD_COLORS.length]
  return (
    <div className={clsx('rounded-xl border flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow', c.bg, c.border)}>
      <div className={clsx('h-1.5', c.accent)} />
      <div className="flex-1 p-4">
        <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
      </div>
      <div className={clsx('flex items-center gap-1 px-3 py-2 border-t', c.border)}>
        <button onClick={() => onEdit(item)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-white/70 transition-colors">
          <Edit2 size={12} /> Edit
        </button>
        <button onClick={() => onDelete(item.id)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-white/70 transition-colors">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  )
}

// ── Forum Tab ─────────────────────────────────────────────────────────────────

function ForumTab({ deptId }: { deptId: string }) {
  const toast = useToast()

  const [section, setSection]       = useState<ForumSection | null>(null)
  const [events, setEvents]         = useState<ForumEvent[]>([])
  const [forumModal, setForumModal] = useState(false)
  const [forumForm, setForumForm]   = useState({ title: '', description: '' })

  const [eventModal, setEventModal] = useState(false)
  const [editEvent, setEditEvent]   = useState<ForumEvent | null>(null)
  const [eventForm, setEventForm]   = useState({ title: '', description: '' })
  const deleteDialog = useConfirmDialog()

  useEffect(() => {
    forumSectionService.getByDept(deptId)
      .then(s => setSection(s))
      .catch(() => setSection(null))
    forumEventService.getAll(deptId)
      .then(items => setEvents(items))
      .catch(() => setEvents([]))
  }, [deptId])

  async function reloadEvents() {
    try {
      const items = await forumEventService.getAll(deptId)
      setEvents(items)
    } catch {
      // keep existing
    }
  }

  function openForumEdit() {
    setForumForm({ title: section?.title ?? '', description: section?.description ?? '' })
    setForumModal(true)
  }

  async function saveForumSection() {
    if (!forumForm.title.trim()) { toast.error('Forum title is required'); return }
    try {
      const updated = await forumSectionService.upsert(deptId, {
        title: forumForm.title.trim(),
        description: forumForm.description.trim(),
      })
      setSection(updated)
      toast.success('Forum info saved')
      setForumModal(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  function openAddEvent() {
    setEditEvent(null); setEventForm({ title: '', description: '' }); setEventModal(true)
  }
  function openEditEvent(e: ForumEvent) {
    setEditEvent(e); setEventForm({ title: e.title, description: e.description }); setEventModal(true)
  }

  async function saveEvent() {
    if (!eventForm.title.trim()) { toast.error('Event name is required'); return }
    try {
      if (editEvent) {
        await forumEventService.update(editEvent.id, { title: eventForm.title.trim(), description: eventForm.description.trim() })
        toast.success('Event updated')
      } else {
        await forumEventService.create({ deptId, title: eventForm.title.trim(), description: eventForm.description.trim(), createdAt: new Date().toISOString() })
        toast.success('Event added')
      }
      await reloadEvents(); setEventModal(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  function handleDelete(id: string) { deleteDialog.open(id) }

  async function confirmDelete() {
    if (!deleteDialog.targetId) return
    try {
      await forumEventService.delete(deleteDialog.targetId)
      await reloadEvents(); deleteDialog.close(); toast.success('Event deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      {/* Forum info */}
      <ForumInfoCard section={section} onEdit={openForumEdit} />

      {/* Events section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Forum Events</h4>
            <p className="text-xs text-slate-400 mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openAddEvent} className="btn-primary flex items-center gap-1.5">
            <Plus size={15} /> Add Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <Calendar size={24} className="text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">No events yet</p>
            <p className="text-xs text-slate-400 mt-1">Add forum events using the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(e => (
              <ForumEventCard key={e.id} event={e} onEdit={openEditEvent} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Forum info modal */}
      <Modal open={forumModal} onClose={() => setForumModal(false)} title="Forum Details" size="lg">
        <div className="space-y-4">
          <FormField label="Forum Title" required>
            <input className="input-field" placeholder="e.g. COMPUTER SCIENCE FORUM (UniCS)"
              value={forumForm.title} onChange={e => setForumForm(f => ({ ...f, title: e.target.value }))} />
          </FormField>
          <FormField label="Forum Description">
            <textarea className="input-field resize-none" rows={4}
              placeholder="Describe the forum's purpose, activities, and goals..."
              value={forumForm.description} onChange={e => setForumForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setForumModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={saveForumSection} className="btn-primary">Save</button>
        </ModalFooter>
      </Modal>

      {/* Event modal */}
      <Modal open={eventModal} onClose={() => setEventModal(false)}
        title={editEvent ? 'Edit Event' : 'Add Event'} size="lg">
        <div className="space-y-4">
          <FormField label="Event Name" required>
            <input className="input-field" placeholder="e.g. Code Quest 2.0"
              value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} />
          </FormField>
          <FormField label="Event Description">
            <textarea className="input-field resize-none" rows={4}
              placeholder="e.g. Binary Blooms Coding Club conducted Code Quest 2.0, an inter-collegiate coding competition on 30th October 2025."
              value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setEventModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={saveEvent} className="btn-primary">Save</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={confirmDelete} title="Delete Event"
        message="This forum event will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}

// ── Department Activities Tab ─────────────────────────────────────────────────

function DepartmentTab({ deptId }: { deptId: string }) {
  const toast = useToast()

  const [activities, setActivities] = useState<DepartmentActivity[]>([])
  const [modalOpen, setModalOpen]   = useState(false)
  const [editItem, setEditItem]     = useState<DepartmentActivity | null>(null)
  const [text, setText]             = useState('')
  const deleteDialog = useConfirmDialog()

  useEffect(() => {
    departmentActivityService.getAll(deptId)
      .then(items => setActivities(items))
      .catch(() => setActivities([]))
  }, [deptId])

  async function reload() {
    try {
      const items = await departmentActivityService.getAll(deptId)
      setActivities(items)
    } catch {
      // keep existing
    }
  }

  async function handleSave() {
    if (!text.trim()) { toast.error('Activity text is required'); return }
    try {
      if (editItem) {
        await departmentActivityService.update(editItem.id, { text: text.trim() })
        toast.success('Activity updated')
      } else {
        await departmentActivityService.create({ deptId, text: text.trim(), createdAt: new Date().toISOString() })
        toast.success('Activity added')
      }
      await reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  function handleDelete(id: string) { deleteDialog.open(id) }

  async function confirmDelete() {
    if (!deleteDialog.targetId) return
    try {
      await departmentActivityService.delete(deleteDialog.targetId)
      await reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  function openAdd() { setEditItem(null); setText(''); setModalOpen(true) }
  function openEdit(item: DepartmentActivity) { setEditItem(item); setText(item.text); setModalOpen(true) }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <Activity size={16} />
          <span className="text-sm font-medium">
            {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Activity
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <Activity size={24} className="text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">No activities yet</p>
          <p className="text-xs text-slate-400 mt-1">Add department activities using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((item, idx) => (
            <ActivityCard key={item.id} item={item} index={idx} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Activity' : 'Add Activity'} size="lg">
        <div className="space-y-4">
          <FormField label="Activity" required>
            <textarea className="input-field resize-none" rows={6}
              placeholder='e.g. The Department of CSE organized a two-days workshop on "Hybrid Application Development using Flutter and Dart" for 5th semester students on 13th and 14th November 2025.'
              value={text} onChange={e => setText(e.target.value)} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Save</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={confirmDelete} title="Delete Activity"
        message="This activity will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ActivitiesPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const [tab, setTab] = useState<Tab>('Forum Activities')
  if (!deptId) return null

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-display font-bold text-slate-800">Activities</h3>
        <p className="text-sm text-slate-500">Forum activities and department events</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}>
            {t === 'Forum Activities' ? <Calendar size={14} /> : <Activity size={14} />}
            {t}
          </button>
        ))}
      </div>

      {tab === 'Forum Activities'      && <ForumTab deptId={deptId} />}
      {tab === 'Department Activities' && <DepartmentTab deptId={deptId} />}
    </div>
  )
}
