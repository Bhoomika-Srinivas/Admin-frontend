import { useState } from 'react'
import {
  X, Pin, Edit2, Trash2, Ban, CheckCircle, XCircle, AlertCircle,
  Calendar, Clock, MapPin,
} from 'lucide-react'
import type { Event } from '@/shared/types/models'
import { EventSchema } from '@/app-modules/events/types'
import { eventService } from '@/app-modules/events/api/eventsApi'
import { StatusBadge, ApprovalBadge, LevelTag } from './EventBadges'
import EventImageGrid from './EventImageGrid'
import EventImageLightbox from './EventImageLightbox'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useFormErrors } from '@/shared/hooks/useFormErrors'
import { isSuperAdmin } from '@/shared/utils/permissions'
import clsx from 'clsx'

interface Props {
  event: Event
  onClose: () => void
  onSaved: () => void
  onDeleted: () => void
}

export default function EventSlideOver({ event: initialEvent, onClose, onSaved, onDeleted }: Props) {
  const { user } = useAuth()
  const toast = useToast()
  const isSuper = isSuperAdmin(user)
  const deleteDialog = useConfirmDialog()
  const rejectDialog = useConfirmDialog()
  const { errors, setErrors, clearErrors } = useFormErrors(EventSchema)

  const [event, setEvent] = useState<Event>(initialEvent)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [form, setForm] = useState<Partial<Event>>(initialEvent)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  async function refresh() {
    const updated = await eventService.getById(event.id)
    if (updated) setEvent(updated)
  }

  function startEdit() { setForm(event); clearErrors(); setMode('edit') }
  function cancelEdit() { setForm(event); clearErrors(); setMode('view') }

  async function handleSave() {
    const parsed = EventSchema.safeParse(form)
    if (!parsed.success) { setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>); return }
    clearErrors()
    await eventService.update(event.id, form)
    toast.success('Event updated')
    await refresh(); onSaved(); setMode('view')
  }

  async function handleDelete() {
    await eventService.delete(event.id)
    toast.success('Event deleted')
    onDeleted()
  }

  async function handleCancel() {
    await eventService.cancel(event.id)
    toast.success('Event cancelled')
    await refresh(); onSaved()
  }

  async function handleApprove() {
    await eventService.approve(event.id)
    toast.success('Event approved')
    await refresh(); onSaved()
  }

  async function handleReject() {
    await eventService.reject(event.id)
    toast.success('Event rejected')
    await refresh(); onSaved()
  }

  async function handleTogglePin() {
    await eventService.togglePin(event.id)
    await refresh(); onSaved()
  }

  const canApprove = isSuper && event.level === 'department' && event.approvalStatus === 'pending'

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-40 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 shrink-0">
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 shrink-0">
            <X size={18} />
          </button>
          <h3 className="font-semibold text-slate-800 text-sm flex-1 truncate">
            {mode === 'edit' ? 'Edit Event' : event.title}
          </h3>
          {mode === 'view' && (
            <button
              onClick={handleTogglePin}
              title={event.pinned ? 'Unpin' : 'Pin to top'}
              className={clsx('p-1.5 rounded-lg transition-colors shrink-0',
                event.pinned ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50',
              )}
            >
              <Pin size={15} className={event.pinned ? 'fill-amber-400' : ''} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {mode === 'view' ? (
            <>
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={event.status} />
                <LevelTag level={event.level} department={event.department} />
                {event.level === 'department' && <ApprovalBadge status={event.approvalStatus} />}
                {event.pinned && (
                  <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-amber-50 text-amber-700 border-amber-200">
                    Pinned
                  </span>
                )}
              </div>

              {/* Approval banner */}
              {canApprove && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-500" />
                  This event is awaiting your approval.
                </div>
              )}

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span>{event.date}</span>
                  <Clock size={14} className="text-slate-400 shrink-0 ml-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span>{event.venue}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>
              </div>

              {/* Image gallery with lightbox */}
              {event.images.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                    Images ({event.images.length})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {event.images.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxIdx(i)}
                        className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-brand-400 transition-all"
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Click an image to view full size</p>
                </div>
              )}
            </>
          ) : (
            /* Edit form */
            <div className="space-y-4">
              <FormField label="Title" required error={errors.title?.[0]}>
                <input className="input-field" value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Date" required error={errors.date?.[0]}>
                  <input type="date" className="input-field" value={form.date ?? ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </FormField>
                <FormField label="Time" required error={errors.time?.[0]}>
                  <input type="time" className="input-field" value={form.time ?? ''} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                </FormField>
              </div>
              <FormField label="Venue" required error={errors.venue?.[0]}>
                <input className="input-field" value={form.venue ?? ''} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
              </FormField>
              <FormField label="Description" required error={errors.description?.[0]}>
                <textarea className="input-field resize-none h-28" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </FormField>
              <EventImageGrid images={form.images ?? []} onChange={imgs => setForm(f => ({ ...f, images: imgs }))} deptId={event.id} />
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={form.pinned ?? false} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 accent-brand-600" />
                <span className="text-sm font-medium text-slate-700">Pin this event to the top</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
          {mode === 'edit' ? (
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary text-sm">Save Changes</button>
              <button onClick={cancelEdit} className="btn-secondary text-sm">Cancel</button>
            </div>
          ) : event.approvalStatus === 'pending' && canApprove ? (
            <div className="flex gap-2">
              <button onClick={handleApprove}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors">
                <CheckCircle size={13} /> Approve
              </button>
              <button onClick={() => rejectDialog.open(event.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">
                <XCircle size={13} /> Reject
              </button>
              <button onClick={startEdit} className="btn-secondary flex items-center gap-1.5 text-sm">
                <Edit2 size={13} /> Edit
              </button>
            </div>
          ) : event.approvalStatus === 'pending' ? (
            <div className="flex gap-2">
              <button onClick={startEdit} className="btn-secondary flex items-center gap-1.5 text-sm">
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => deleteDialog.open(event.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors ml-auto">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          ) : event.approvalStatus === 'approved' ? (
            <div className="flex gap-2">
              <button onClick={startEdit} className="btn-secondary flex items-center gap-1.5 text-sm">
                <Edit2 size={13} /> Edit
              </button>
              {event.status === 'upcoming' && (
                <button onClick={handleCancel}
                  className="btn-secondary flex items-center gap-1.5 text-sm text-amber-700 border-amber-200 hover:bg-amber-50">
                  <Ban size={13} /> Cancel Event
                </button>
              )}
              <button onClick={() => deleteDialog.open(event.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors ml-auto">
                <Trash2 size={13} /> Delete Event
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={startEdit} className="btn-secondary flex items-center gap-1.5 text-sm">
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => deleteDialog.open(event.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors ml-auto">
                <Trash2 size={13} /> Delete Event
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Event" message="This event will be permanently deleted." confirmLabel="Delete"
      />
      <ConfirmDialog
        open={rejectDialog.isOpen} onClose={rejectDialog.close} onConfirm={handleReject}
        title="Reject Event" message="This event will be marked as rejected and the organiser will be notified." confirmLabel="Reject"
      />

      {lightboxIdx !== null && (
        <EventImageLightbox
          images={event.images}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  )
}
