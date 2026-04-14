import { useState, useMemo } from 'react'
import { Plus, Pin, ChevronLeft, Building2, Calendar, AlertCircle, ChevronRight } from 'lucide-react'
import type { Event } from '@/shared/types/models'
import { EventSchema } from '@/app-modules/events/types'
import { eventService } from '@/app-modules/events/api/eventsApi'
import { useDepartments } from '@/app-modules/departments/hooks/useDepartments'
import { useEvents } from '@/app-modules/events/hooks/useEvents'
import { StatusBadge, ApprovalBadge, DeptBadge } from '@/app-modules/events/components/EventBadges'
import EventImageGrid from '@/app-modules/events/components/EventImageGrid'
import EventSlideOver from '@/app-modules/events/components/EventSlideOver'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
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

type View           = 'home' | 'institutional' | 'department'
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

// ── Add Institutional Event Modal ─────────────────────────────────────────────

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

function AddInstitutionalModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth()
  const toast = useToast()
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
    await eventService.create({ ...form, level: 'institutional', department: '', createdBy: user.id })
    toast.success('Event created')
    setForm(blankAddForm())
    onCreated(); onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Institutional Event" size="lg">
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
        <EventImageGrid images={form.images} onChange={imgs => setForm(f => ({ ...f, images: imgs }))} deptId="institutional" />
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={form.pinned}
            onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300 accent-brand-600" />
          <span className="text-sm font-medium text-slate-700">Pin this event to the top</span>
        </label>
      </div>
      <ModalFooter>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn-primary">Create Event</button>
      </ModalFooter>
    </Modal>
  )
}

// ── Add Department Event Modal (with dept picker) ─────────────────────────────

type DeptAddForm = AddForm & { department: string }

function AddDeptEventModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth()
  const toast = useToast()
  const { errors, setErrors, clearErrors } = useFormErrors(EventSchema)
  const { departments: allDepts } = useDepartments()

  const blank = (): DeptAddForm => ({ ...blankAddForm(), department: '' })
  const [form, setForm] = useState<DeptAddForm>(blank)

  if (!open) return null

  async function handleSave() {
    const parsed = EventSchema.safeParse(form)
    if (!parsed.success) { setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>); return }
    if (!form.department) { setErrors({ ...errors, department: ['Please select a department'] }); return }
    if (!form.isMultiDay && !form.date) { setErrors({ ...errors, date: ['Date is required'] }); return }
    if (!form.isMultiDay && !form.time) { setErrors({ ...errors, time: ['Time is required'] }); return }
    if (form.isMultiDay && !form.startDate) { setErrors({ ...errors, startDate: ['Start date is required'] }); return }
    if (form.isMultiDay && !form.endDate) { setErrors({ ...errors, endDate: ['End date is required'] }); return }
    clearErrors()
    await eventService.create({ ...form, level: 'department', createdBy: user.id })
    toast.success('Department event created')
    setForm(blank()); onCreated(); onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Department Event" size="lg">
      <div className="space-y-4">
        <FormField label="Department" required error={(errors as Record<string, string[]>).department?.[0]}>
          <select className="input-field" value={form.department}
            onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
            <option value="">Select department…</option>
            {allDepts.map(d => (
              <option key={d.id} value={d.shortName}>{d.name} ({d.shortName})</option>
            ))}
          </select>
        </FormField>
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
        <EventImageGrid images={form.images} onChange={imgs => setForm(f => ({ ...f, images: imgs }))} deptId={form.department || 'events'} />
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={form.pinned}
            onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300 accent-brand-600" />
          <span className="text-sm font-medium text-slate-700">Pin this event to the top</span>
        </label>
      </div>
      <ModalFooter>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn-primary">Create Event</button>
      </ModalFooter>
    </Modal>
  )
}

// ── Home View ─────────────────────────────────────────────────────────────────

function HomeView({
  institutionalEvents, departmentEvents, onNavigate, onAddInstitutional,
}: {
  institutionalEvents: Event[]
  departmentEvents: Event[]
  onNavigate: (v: View) => void
  onAddInstitutional: () => void
}) {
  const { user } = useAuth()
  const pendingDept           = departmentEvents.filter(e => e.approvalStatus === 'pending').length
  const upcomingInstitutional = institutionalEvents.filter(e => e.status === 'upcoming').length
  const upcomingDept          = departmentEvents.filter(e => e.status === 'upcoming').length

  return (
    <div className="space-y-6">
      {/* Page header — title + primary action */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Events Management</h2>
          <p className="text-sm text-slate-500">
            {institutionalEvents.length + departmentEvents.length} events •{' '}
            {upcomingInstitutional + upcomingDept} upcoming
          </p>
        </div>
        {can(user, 'content:create') && (
          <button onClick={onAddInstitutional} className="btn-primary flex items-center gap-1.5">
            <Plus size={15} /> Add Institutional Event
          </button>
        )}
      </div>

      {/* Cards — stats + navigation only, no action buttons inside */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Institutional Events */}
        <div
          onClick={() => onNavigate('institutional')}
          className="card p-6 cursor-pointer hover:shadow-md transition-all group hover:border-purple-200 border border-transparent"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 size={20} />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-1">Institutional Events</h3>
          <p className="text-sm text-slate-500 mb-4">Manage events for the entire institution</p>
          <div className="flex gap-5 mb-5">
            <div>
              <p className="text-2xl font-bold text-slate-900">{institutionalEvents.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{upcomingInstitutional}</p>
              <p className="text-xs text-slate-400 mt-0.5">Upcoming</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium text-slate-400 group-hover:text-purple-600 transition-colors flex items-center gap-0.5 ml-auto">
              View All <ChevronRight size={12} />
            </span>
          </div>
        </div>

        {/* Department Events */}
        <div
          onClick={() => onNavigate('department')}
          className="card p-6 cursor-pointer hover:shadow-md transition-all group hover:border-blue-200 border border-transparent"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            {pendingDept > 0 && (
              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-2 py-1 rounded-lg">
                <AlertCircle size={11} />
                {pendingDept} pending
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-1">Department Events</h3>
          <p className="text-sm text-slate-500 mb-4">Manage events submitted by departments</p>
          <div className="flex gap-5 mb-5">
            <div>
              <p className="text-2xl font-bold text-slate-900">{departmentEvents.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{upcomingDept}</p>
              <p className="text-xs text-slate-400 mt-0.5">Upcoming</p>
            </div>
            {pendingDept > 0 && (
              <div>
                <p className="text-2xl font-bold text-amber-600">{pendingDept}</p>
                <p className="text-xs text-slate-400 mt-0.5">Pending</p>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium text-slate-400 group-hover:text-blue-600 transition-colors flex items-center gap-0.5 ml-auto">
              View Department Events <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Institutional List View ───────────────────────────────────────────────────

function InstitutionalView({
  events, reload, onBack, onOpenAdd,
}: {
  events: Event[]
  reload: () => void
  onBack: () => void
  onOpenAdd: () => void
}) {
  const { user } = useAuth()
  const [statusTab, setStatusTab] = useState<StatusTab>('all')
  const [sortKey, setSortKey]     = useState<SortKey>('pinned')
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const institutionalEvents = useMemo(() => events.filter(e => e.level === 'institutional'), [events])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    const list = institutionalEvents.filter(e => {
      const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
      return matchesSearch && (statusTab === 'all' || e.status === statusTab)
    })
    return applySort(list, sortKey)
  }, [institutionalEvents, debouncedSearch, statusTab, sortKey])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  const tabCounts: Record<StatusTab, number> = {
    all:       institutionalEvents.length,
    upcoming:  institutionalEvents.filter(e => e.status === 'upcoming').length,
    completed: institutionalEvents.filter(e => e.status === 'completed').length,
    cancelled: institutionalEvents.filter(e => e.status === 'cancelled').length,
  }

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
    { key: 'time', header: 'Time', render: row => <span className="text-sm">{row.isMultiDay ? `${row.startTime} – ${row.endTime}` : row.time}</span> },
    { key: 'venue', header: 'Venue', render: row => <span className="text-sm text-slate-600 line-clamp-1">{row.venue}</span> },
    { key: 'status', header: 'Status', render: row => <StatusBadge status={row.status} /> },
  ]

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div>
              <h2 className="text-xl font-display font-bold text-slate-800">Institutional Events</h2>
              <p className="text-sm text-slate-500">
                {institutionalEvents.length} events • {tabCounts.upcoming} upcoming
              </p>
            </div>
          </div>
          {can(user, 'content:create') && (
            <button onClick={onOpenAdd} className="btn-primary flex items-center gap-1.5">
              <Plus size={15} /> Add Event
            </button>
          )}
        </div>

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

        {/* Table — search left, sort right */}
        <div className="card">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }}
              placeholder="Search by title or venue..." className="max-w-xs" />
            <div className="flex items-center gap-3 shrink-0">
              <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
                className="input-field w-40 text-sm">
                {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <DataTable columns={columns} data={paginated} keyExtractor={r => r.id}
            total={filtered.length} page={page} limit={limit} onPageChange={setPage}
            onRowClick={setSelectedEvent} emptyTitle="No events found"
            emptyDescription="Add an institutional event using the button above." />
        </div>
      </div>

      {selectedEvent && (
        <EventSlideOver event={selectedEvent} onClose={() => setSelectedEvent(null)}
          onSaved={reload} onDeleted={() => { setSelectedEvent(null); reload() }} />
      )}
    </>
  )
}

// ── Department Moderation View ────────────────────────────────────────────────

function DeptModerationView({
  events, reload, onBack,
}: {
  events: Event[]
  reload: () => void
  onBack: () => void
}) {
  const { user } = useAuth()
  const isSuper = isSuperAdmin(user)

  const [statusTab, setStatusTab]           = useState<StatusTab>('all')
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>('all')
  const [sortKey, setSortKey]               = useState<SortKey>('pinned')
  const [deptFilter, setDeptFilter]         = useState<string>('')
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const [selectedEvent, setSelectedEvent]   = useState<Event | null>(null)
  const [addOpen, setAddOpen]               = useState(false)

  const deptEvents = useMemo(() => {
    const all = events.filter(e => e.level === 'department')
    if (isSuper) return all
    return all.filter(e => e.department === user.department)
  }, [events, isSuper, user.department])

  const deptOptions = useMemo(() => {
    const names = [...new Set(deptEvents.map(e => e.department).filter(Boolean))].sort()
    return names.map(d => ({ value: d, label: d }))
  }, [deptEvents])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    const list = deptEvents.filter(e => {
      const matchesSearch   = !q || e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
      const matchesStatus   = statusTab === 'all' || e.status === statusTab
      const matchesApproval = approvalFilter === 'all' || e.approvalStatus === approvalFilter
      const matchesDept     = !deptFilter || e.department === deptFilter
      return matchesSearch && matchesStatus && matchesApproval && matchesDept
    })
    return applySort(list, sortKey)
  }, [deptEvents, debouncedSearch, statusTab, approvalFilter, deptFilter, sortKey])

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
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {row.pinned && <span className="text-xs text-amber-600 font-medium">Pinned</span>}
            <DeptBadge name={row.department} />
          </div>
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
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div>
              <h2 className="text-xl font-display font-bold text-slate-800">Department Events</h2>
              <p className="text-sm text-slate-500">
                {deptEvents.length} events • {tabCounts.upcoming} upcoming
                {isSuper && ` • ${deptFilter || 'All departments'}`}
              </p>
            </div>
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
              <strong>{pendingCount}</strong> department event{pendingCount > 1 ? 's' : ''} awaiting your approval.
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

        {/* Table — search left, filters right (Dept | Sort | Approval) */}
        <div className="card">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }}
              placeholder="Search events..." className="max-w-xs" />
            <div className="flex items-center gap-3 shrink-0">
              {isSuper && (
                <SelectFilter value={deptFilter} onChange={v => { setDeptFilter(v); resetPage() }}
                  options={deptOptions} placeholder="All Departments" className="w-40 text-sm" />
              )}
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
            emptyDescription="Department events will appear here once submitted." />
        </div>
      </div>

      {selectedEvent && (
        <EventSlideOver event={selectedEvent} onClose={() => setSelectedEvent(null)}
          onSaved={reload} onDeleted={() => { setSelectedEvent(null); reload() }} />
      )}

      <AddDeptEventModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={reload} />
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const { events, reload } = useEvents()
  const [view, setView]       = useState<View>('home')
  const [addInstOpen, setAddInstOpen] = useState(false)

  const institutionalEvents = useMemo(() => events.filter(e => e.level === 'institutional'), [events])
  const departmentEvents    = useMemo(() => events.filter(e => e.level === 'department'),    [events])

  return (
    <>
      {view === 'home' && (
        <HomeView
          institutionalEvents={institutionalEvents}
          departmentEvents={departmentEvents}
          onNavigate={setView}
          onAddInstitutional={() => setAddInstOpen(true)}
        />
      )}
      {view === 'institutional' && (
        <InstitutionalView
          events={events}
          reload={reload}
          onBack={() => setView('home')}
          onOpenAdd={() => setAddInstOpen(true)}
        />
      )}
      {view === 'department' && (
        <DeptModerationView
          events={events}
          reload={reload}
          onBack={() => setView('home')}
        />
      )}

      <AddInstitutionalModal open={addInstOpen} onClose={() => setAddInstOpen(false)} onCreated={reload} />
    </>
  )
}
