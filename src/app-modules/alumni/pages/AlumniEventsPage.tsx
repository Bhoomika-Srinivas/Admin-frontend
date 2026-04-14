import { useState, useMemo, useRef } from 'react'
import { Plus, Edit2, Trash2, Save, X, Upload, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { useAlumniEvents } from '../hooks/useAlumni'
import { alumniService } from '../api/alumniApi'
import type { AlumniEvent } from '@/shared/types/models'
import { ALUMNI_DEPARTMENTS, DEPARTMENT_FILTER_OPTIONS } from '@/shared/constants/departments'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useToast } from '@/shared/context/ToastContext'
import Badge from '@/shared/components/common/Badge'
import SearchBar from '@/shared/components/filters/SearchBar'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { validateImageFile } from '@/shared/utils/validateFile'

const emptyForm: Omit<AlumniEvent, 'id' | 'createdAt'> = {
  title: '',
  date: '',
  time: '',
  department: '',
  location: '',
  description: '',
  image: '',
  status: 'draft',
}

const statusBadgeVariant = {
  published: 'green' as const,
  draft: 'gray' as const,
}

export default function AlumniEventsPage() {
  const toast = useToast()
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { events, loading, reload } = useAlumniEvents({
    department: departmentFilter || undefined,
    status: statusFilter || undefined,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<AlumniEvent | null>(null)
  const [form, setForm] = useState<Omit<AlumniEvent, 'id' | 'createdAt'>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => {
    if (!debouncedSearch) return events
    const q = debouncedSearch.toLowerCase()
    return events.filter(
      e =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    )
  }, [events, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  const columns: Column<AlumniEvent>[] = [
    {
      key: 'title',
      header: 'Event',
      render: r => (
        <div className="flex items-center gap-3">
          {r.image ? (
            <img src={r.image} alt={r.title} className="w-12 h-12 rounded-lg object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <span className="text-lg">🎓</span>
            </div>
          )}
          <div>
            <span className="font-medium text-sm text-slate-800 block">{r.title}</span>
            <span className="text-xs text-slate-500">{r.department}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'dateTime',
      header: 'Date & Time',
      render: r => (
        <div className="text-sm text-slate-600">
          <div>{r.date}</div>
          <div className="text-slate-400">{r.time}</div>
        </div>
      ),
    },
    { key: 'location', header: 'Location', render: r => <span className="text-sm text-slate-600">{r.location}</span> },
    {
      key: 'status',
      header: 'Status',
      className: 'w-24',
      render: r => (
        <Badge variant={statusBadgeVariant[r.status]} className="text-xs">
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
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
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(item: AlumniEvent) {
    setEditItem(item)
    setForm({
      title: item.title,
      date: item.date,
      time: item.time,
      department: item.department,
      location: item.location,
      description: item.description || '',
      image: item.image || '',
      status: item.status,
    })
    setModalOpen(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateImageFile(file)
    if (error) {
      toast.error(error)
      e.target.value = ''
      return
    }

    const localUrl = URL.createObjectURL(file)
    setForm(f => ({ ...f, image: localUrl }))
    setUploadingImage(true)

    try {
      const eventId = editItem?.id || `tmp-${Date.now()}`
      const s3Url = await uploadToS3(file, 'alumni-events', eventId)
      setForm(f => ({ ...f, image: s3Url }))
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
      setForm(f => ({ ...f, image: '' }))
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.date || !form.time || !form.department || !form.location) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      if (editItem) {
        await alumniService.updateEvent(editItem.id, form)
        toast.success('Event updated')
      } else {
        await alumniService.createEvent(form)
        toast.success('Event added')
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
      await alumniService.deleteEvent(deleteDialog.targetId)
      deleteDialog.close()
      await reload()
      toast.success('Event deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) {
    return <div className="card p-8 text-center text-sm text-slate-400">Loading…</div>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Alumni Events</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length} events • {events.filter(e => e.status === 'published').length} published
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Event
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchBar
            value={searchTerm}
            onChange={v => {
              setSearchTerm(v)
              resetPage()
            }}
            placeholder="Search events…"
            className="max-w-sm"
          />
          <div className="flex items-center gap-3 shrink-0">
            <select
              className="input-field text-sm py-1.5"
              value={departmentFilter}
              onChange={e => {
                setDepartmentFilter(e.target.value)
                resetPage()
              }}
            >
              {DEPARTMENT_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              className="input-field text-sm py-1.5"
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value)
                resetPage()
              }}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={r => r.id}
          total={filtered.length}
          page={page}
          limit={limit}
          onPageChange={setPage}
          emptyTitle="No events yet"
          emptyDescription="Add alumni events for different departments."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Event' : 'Add Event'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Title" required>
              <input
                className="input-field"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Annual Alumni Meet 2024"
              />
            </FormField>
            <FormField label="Department" required>
              <select
                className="input-field"
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              >
                <option value="">Select Department</option>
                {ALUMNI_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" required>
              <input
                className="input-field"
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </FormField>
            <FormField label="Time" required>
              <input
                className="input-field"
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              />
            </FormField>
          </div>
          <FormField label="Location" required>
            <input
              className="input-field"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g. BIET Main Auditorium"
            />
          </FormField>
          <FormField label="Description">
            <textarea
              className="input-field h-24 resize-none"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Event details, agenda, etc."
            />
          </FormField>
          <FormField label="Event Image">
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  'w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center shrink-0 overflow-hidden bg-slate-50',
                  form.image ? 'border-slate-200' : 'border-slate-300'
                )}
              >
                {form.image ? (
                  <img src={form.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🎓</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingImage}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    {uploadingImage ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Upload size={12} />
                    )}
                    {uploadingImage ? 'Uploading…' : form.image ? 'Replace' : 'Upload'}
                  </button>
                  {form.image && !uploadingImage && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, image: '' }))}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X size={12} /> Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400">JPEG/PNG, max 2MB</p>
              </div>
            </div>
          </FormField>
          <FormField label="Status" required>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={form.status === 'draft'}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
                />
                <span className="text-sm text-slate-600">Draft</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={form.status === 'published'}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
                />
                <span className="text-sm text-slate-600">Published</span>
              </label>
            </div>
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={saving}>
            <X size={14} /> Cancel
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={saving || uploadingImage}>
            <Save size={14} /> {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Event'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete Event"
        message="This event will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  )
}
