import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Pin, AlertCircle } from 'lucide-react'
import type { Event } from '@/shared/types/models'
import { EventSchema } from '@/app-modules/events/types'
import { eventService } from '@/app-modules/events/api/eventsApi'
import { useEvents } from '@/app-modules/events/hooks/useEvents'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import { StatusBadge, ApprovalBadge } from '@/app-modules/events/components/EventBadges'
import EventImageGrid from '@/app-modules/events/components/EventImageGrid'
import EventSlideOver from '@/app-modules/events/components/EventSlideOver'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { useFormErrors } from '@/shared/hooks/useFormErrors'
import { can, isSuperAdmin } from '@/shared/utils/permissions'
import clsx from 'clsx'

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusTab      = 'all' | 'upcoming' | 'completed' | 'cancelled'
type ApprovalFilter = 'all' | 'pending' | 'approved' | 'rejected'
type SortKey        = 'pinned' | 'date_asc' | 'date_desc' | 'latest'

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'upcoming',  label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'pinned',    label: 'Pinned First' },
  { key: 'date_asc',  label: 'Date ↑ (Oldest)' },
  { key: 'date_desc', label: 'Date ↓ (Newest)' },
  { key: 'latest',    label: 'Latest Added' },
]

function eventSortDate(e: Event) { return e.isMultiDay ? (e.startDate || '') : e.date }

function applySort(list: Event[], key: SortKey): Event[] {
  const copy = [...list]
  switch (key) {
    case 'pinned':
      return copy.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return eventSortDate(a).localeCompare(eventSortDate(b))
      })
    case 'date_asc':  return copy.sort((a, b) => eventSortDate(a).localeCompare(eventSortDate(b)))
    case 'date_desc': return copy.sort((a, b) => eventSortDate(b).localeCompare(eventSortDate(a)))
    case 'latest':    return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

// ── Add Event Modal — no dept picker, dept auto-assigned from context ──────────

type AddForm = {
  title: string; isMultiDay: boolean
  date: string; time: string
  startDate: string; startTime: string; endDate: string; endTime: string
  venue: string; description: string; images: string[]; pinned: boolean
}
const blankAddForm = (): AddForm => ({
  title: '', isMultiDay: false, date: '', time: '',
  startDate: '', startTime: '', endDate: '', endTime: '',
  venue: '', description: '', images: [], pinned: false,
})

function AddEventModal({
  open, onClose, onCreated, deptShortName, deptId,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
  deptShortName: string
  deptId: string
}) {
  const { user } = useAuth()
  const toast = useToast()
  const isSuper = isSuperAdmin(user)
  const { errors, setErrors, clearErrors } = useFormErrors(EventSchema)
  const [form, setForm] = useState<AddForm>(blankAddForm)

  if (!open) return null

  async function handleSave() {
    const parsed = EventSchema.safeParse(form)
    if (!parsed.success) { setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>); return }
    if (!form.isMultiDay && !form.date) { setErrors({ ...errors, date: ['Date is required'] }); return }
    if (!form.isMultiDay && !form.time) { setErrors({ ...errors, time: ['Time is required'] }); return }
    if (form.isMultiDay && !form.startDate) { setErrors({ ...errors, startDate: ['Start date is required'] }); return }
    if (form.isMultiDay && !form.endDate) { setErrors({ ...errors, endDate: ['End date is required'] }); return }
    clearErrors()
    await eventService.create({ ...form, level: 'department', department: deptShortName, createdBy: user.id })
    toast.success(isSuper ? 'Event created' : 'Event submitted for approval')
    setForm(blankAddForm()); onCreated(); onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Add Event — ${deptShortName}`} size="lg">
      <div className="space-y-4">
        <FormField label="Title" required error={errors.title?.[0]}>
          <input className="input-field" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title" />
        </FormField>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={form.isMultiDay}
            onChange={e => setForm(f => ({ ...f, isMultiDay: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300 accent-brand-600" />
          <span className="text-sm font-medium text-slate-700">Multi-day event</span>
        </label>
        {!form.isMultiDay ? (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" required error={(errors as Record<string, string[]>).date?.[0]}>
              <input type="date" className="input-field" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </FormField>
            <FormField label="Time" required error={(errors as Record<string, string[]>).time?.[0]}>
              <input type="time" className="input-field" value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </FormField>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required error={(errors as Record<string, string[]>).startDate?.[0]}>
              <input type="date" className="input-field" value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </FormField>
            <FormField label="Start Time">
              <input type="time" className="input-field" value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </FormField>
            <FormField label="End Date" required error={(errors as Record<string, string[]>).endDate?.[0]}>
              <input type="date" className="input-field" value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </FormField>
            <FormField label="End Time">
              <input type="time" className="input-field" value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </FormField>
          </div>
        )}
        <FormField label="Venue" required error={errors.venue?.[0]}>
          <input className="input-field" value={form.venue}
            onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="Location or hall name" />
        </FormField>
        <FormField label="Description" required error={errors.description?.[0]}>
          <textarea className="input-field resize-none h-24" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Event details..." />
        </FormField>
        <EventImageGrid images={form.images} onChange={imgs => setForm(f => ({ ...f, images: imgs }))} deptId={deptId} />
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={form.pinned}
            onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300 accent-brand-600" />
          <span className="text-sm font-medium text-slate-700">Pin this event to the top</span>
        </label>
        {!isSuper && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            This event will be submitted for Super Admin approval before going live.
          </p>
        )}
      </div>
      <ModalFooter>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn-primary">
          {isSuper ? 'Create Event' : 'Submit for Approval'}
        </button>
      </ModalFooter>
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DeptEventsPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const { user } = useAuth()
  const { events, reload } = useEvents()
  const isSuper = isSuperAdmin(user)

  const dept = useDeptContext()
  const deptShortName = dept.shortName

  const [statusTab, setStatusTab]           = useState<StatusTab>('all')
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>('all')
  const [sortKey, setSortKey]               = useState<SortKey>('pinned')
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const [selectedEvent, setSelectedEvent]   = useState<Event | null>(null)
  const [addOpen, setAddOpen]               = useState(false)

  // Always scoped to current department — no cross-dept filtering in the workspace
  const deptEvents = useMemo(
    () => events.filter(e => e.level === 'department' && e.department === deptShortName),
    [events, deptShortName],
  )

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    const list = deptEvents.filter(e => {
      const matchesSearch   = !q || e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
      const matchesStatus   = statusTab === 'all' || e.status === statusTab
      const matchesApproval = approvalFilter === 'all' || e.approvalStatus === approvalFilter
      return matchesSearch && matchesStatus && matchesApproval
    })
    return applySort(list, sortKey)
  }, [deptEvents, debouncedSearch, statusTab, approvalFilter, sortKey])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  const pendingCount = deptEvents.filter(e => e.approvalStatus === 'pending').length

  const tabCounts: Record<StatusTab, number> = {
    all:       deptEvents.length,
    upcoming:  deptEvents.filter(e => e.status === 'upcoming').length,
    completed: deptEvents.filter(e => e.status === 'completed').length,
    cancelled: deptEvents.filter(e => e.status === 'cancelled').length,
  }

  function viewPending() { setApprovalFilter('pending'); resetPage() }

  const columns: Column<Event>[] = [
    {
      key: 'pinned', header: '', className: 'w-10',
      render: row => (
        <button onClick={async e => { e.stopPropagation(); await eventService.togglePin(row.id); reload() }}
          title={row.pinned ? 'Unpin' : 'Pin to top'}
          className={clsx('p-1.5 rounded-lg transition-colors',
            row.pinned ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50',
          )}>
          <Pin size={13} className={row.pinned ? 'fill-amber-400' : ''} />
        </button>
      ),
    },
    {
      key: 'title', header: 'Event',
      render: row => (
        <div>
          <p className="font-medium text-slate-800 line-clamp-1">{row.title}</p>
          {row.pinned && <span className="text-xs text-amber-600 font-medium">Pinned</span>}
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: row => <span className="text-sm">{row.isMultiDay ? `${row.startDate} → ${row.endDate}` : row.date}</span> },
    { key: 'venue', header: 'Venue', render: row => <span className="text-sm text-slate-600 line-clamp-1">{row.venue}</span> },
    { key: 'status',         header: 'Status',   render: row => <StatusBadge status={row.status} /> },
    { key: 'approvalStatus', header: 'Approval', render: row => <ApprovalBadge status={row.approvalStatus} /> },
  ]

  return (
    <>
      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-800">{deptShortName} Events</h2>
            <p className="text-sm text-slate-500">
              {deptEvents.length} events
              {tabCounts.upcoming > 0 && ` • ${tabCounts.upcoming} upcoming`}
              {` • ${deptShortName}`}
            </p>
          </div>
          {can(user, 'content:create') && (
            <button onClick={() => setAddOpen(true)} className="btn-primary flex items-center gap-1.5">
              <Plus size={15} /> Add Event
            </button>
          )}
        </div>

        {/* Pending approval banner — clickable */}
        {isSuper && pendingCount > 0 && (
          <div onClick={viewPending}
            className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 cursor-pointer hover:bg-amber-100 transition-colors">
            <AlertCircle size={16} className="shrink-0 text-amber-500" />
            <span>
              <strong>{pendingCount}</strong> event{pendingCount > 1 ? 's' : ''} awaiting your approval.
            </span>
            <button onClick={e => { e.stopPropagation(); viewPending() }}
              className="ml-auto text-xs font-semibold text-amber-700 underline hover:text-amber-900 shrink-0">
              View Pending
            </button>
          </div>
        )}

        {/* Status tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {STATUS_TABS.map(t => (
            <button key={t.key} onClick={() => { setStatusTab(t.key); resetPage() }}
              className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                statusTab === t.key ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )}>
              {t.label}
              <span className={clsx('text-xs px-1.5 py-0.5 rounded-full',
                statusTab === t.key ? 'bg-brand-50 text-brand-600' : 'bg-slate-200 text-slate-500',
              )}>
                {tabCounts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Table — search left, filters right (Sort | Approval) */}
        <div className="card">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }}
              placeholder="Search by title or venue..." className="max-w-xs" />
            <div className="flex items-center gap-3 shrink-0">
              <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
                className="input-field w-40 text-sm">
                {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              <select value={approvalFilter}
                onChange={e => { setApprovalFilter(e.target.value as ApprovalFilter); resetPage() }}
                className="input-field w-36 text-sm">
                <option value="all">All Approval</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <DataTable columns={columns} data={paginated} keyExtractor={r => r.id}
            total={filtered.length} page={page} limit={limit} onPageChange={setPage}
            onRowClick={setSelectedEvent} emptyTitle="No events found"
            emptyDescription="Add a department event using the button above." />
        </div>
      </div>

      {selectedEvent && (
        <EventSlideOver event={selectedEvent} onClose={() => setSelectedEvent(null)}
          onSaved={reload} onDeleted={() => { setSelectedEvent(null); reload() }} />
      )}

      <AddEventModal open={addOpen} onClose={() => setAddOpen(false)}
        onCreated={reload} deptShortName={deptShortName} deptId={deptId!} />
    </>
  )
}
