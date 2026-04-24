import { useState, useMemo, useRef } from 'react'
import { Plus, FileText, ExternalLink, Loader2, Calendar } from 'lucide-react'
import { academicCalendarService } from '../api/academicsApi'
import { useAcademicCalendar } from '../hooks/useAcademics'
import CalendarCard from '../components/CalendarCard'
import type { AcademicCalendar } from '../types'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { validateDocumentFile } from '@/shared/utils/validateFile'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'

type FormData = Omit<AcademicCalendar, 'calendarId' | 'createdAt' | 'updatedAt'>

const emptyForm: FormData = {
  title: '',
  description: '',
  type: 'CURRENT',
  authority: 'INSTITUTE',
  program: 'UG',
  semester: '',
  year: '',
  date: '',
  fileUrl: '',
}

const TYPE_OPTIONS = [
  { value: 'all',      label: 'All Types'  },
  { value: 'CURRENT',  label: 'Current'    },
  { value: 'HISTORIC', label: 'Historic'   },
]

const AUTHORITY_OPTIONS = [
  { value: 'all',       label: 'All Authorities' },
  { value: 'INSTITUTE', label: 'Institute'        },
  { value: 'VTU',       label: 'VTU'              },
]

const PROGRAM_OPTIONS = [
  { value: 'all', label: 'All Programs' },
  { value: 'UG',  label: 'UG'           },
  { value: 'PG',  label: 'PG'           },
]

function suggestTitle(form: FormData): string {
  if (!form.authority || !form.program || !form.semester || !form.year) return ''
  const auth = form.authority === 'INSTITUTE' ? 'Institute' : 'VTU'
  return `${auth} ${form.program} Academic Calendar ${form.semester} Sem ${form.year}`
}

export default function AcademicCalendarPage() {
  const toast = useToast()
  const { entries, loading, reload } = useAcademicCalendar()
  const [search, setSearch]                   = useState('')
  const [filterType, setFilterType]           = useState('all')
  const [filterAuthority, setFilterAuthority] = useState('all')
  const [filterProgram, setFilterProgram]     = useState('all')
  const [filterYear, setFilterYear]           = useState('all')
  const [modalOpen, setModalOpen]             = useState(false)
  const [editItem, setEditItem]               = useState<AcademicCalendar | null>(null)
  const [form, setForm]                       = useState<FormData>(emptyForm)
  const [titleManual, setTitleManual]         = useState(false)
  const [saving, setSaving]                   = useState(false)
  const [uploading, setUploading]             = useState(false)
  const fileRef                               = useRef<HTMLInputElement>(null)
  const deleteDialog                          = useConfirmDialog()


  const years = useMemo(
    () => Array.from(new Set(entries.map(e => e.year))).sort((a, b) => b.localeCompare(a)),
    [entries]
  )

  const yearFilterOptions = useMemo(
    () => [{ value: 'all', label: 'All Years' }, ...years.map(y => ({ value: y, label: y }))],
    [years]
  )

  const filtered = useMemo(() => {
    let r = entries
    if (filterType      !== 'all') r = r.filter(e => e.type      === filterType)
    if (filterAuthority !== 'all') r = r.filter(e => e.authority === filterAuthority)
    if (filterProgram   !== 'all') r = r.filter(e => e.program   === filterProgram)
    if (filterYear      !== 'all') r = r.filter(e => e.year      === filterYear)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.semester.toLowerCase().includes(q)
      )
    }
    return r
  }, [entries, filterType, filterAuthority, filterProgram, filterYear, search])

  const groupedByYear = useMemo(() => {
    const orderedYears = filterYear !== 'all' ? [filterYear] : years
    const map = new Map<string, AcademicCalendar[]>()
    for (const y of orderedYears) {
      const items = filtered
        .filter(e => e.year === y)
        .sort((a, b) => a.date.localeCompare(b.date))
      if (items.length) map.set(y, items)
    }
    return map
  }, [filtered, years, filterYear])

  function openAdd() {
    setEditItem(null)
    setForm({ ...emptyForm, year: filterYear !== 'all' ? filterYear : '' })
    setTitleManual(false)
    setModalOpen(true)
  }

  function openEdit(item: AcademicCalendar) {
    setEditItem(item)
    setForm({
      title:       item.title,
      description: item.description ?? '',
      type:        item.type,
      authority:   item.authority,
      program:     item.program,
      semester:    item.semester,
      year:        item.year,
      date:        item.date,
      fileUrl:     item.fileUrl,
    })
    setTitleManual(true)
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditItem(null) }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key !== 'title' && !titleManual) {
        const suggested = suggestTitle(next)
        if (suggested) next.title = suggested
      }
      return next
    })
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateDocumentFile(file)
    if (err) { toast.error(err); return }
    setUploading(true)
    try {
      const url = await uploadToS3(file, 'academic-calendar', 'general')
      setForm(prev => ({ ...prev, fileUrl: url }))
      toast.success('File uploaded')
    } catch {
      toast.error('File upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.year.trim() || !/^\d{4}-\d{2}$/.test(form.year)) {
      toast.error('Year must be in format 2025-26'); return
    }
    if (!form.semester.trim()) { toast.error('Semester is required'); return }
    if (!form.date) { toast.error('Date is required'); return }
    if (!form.fileUrl) { toast.error('Please upload a PDF file'); return }

    setSaving(true)
    try {
      if (editItem) {
        await academicCalendarService.update(editItem.calendarId, form)
        toast.success('Calendar updated')
      } else {
        await academicCalendarService.create(form)
        toast.success('Calendar added')
      }
      await reload()
      closeModal()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await academicCalendarService.delete(deleteDialog.targetId)
      toast.success('Deleted')
      deleteDialog.close()
      await reload()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const deletingItem = entries.find(e => e.calendarId === deleteDialog.targetId)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Academic Calendar</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {entries.length} document{entries.length !== 1 ? 's' : ''} •{' '}
            {entries.filter(e => e.type === 'CURRENT').length} current •{' '}
            {entries.filter(e => e.type === 'HISTORIC').length} historic
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus size={16} /> Add Calendar
        </button>
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search calendars…" className="max-w-xs" />
        <div className="flex items-center gap-3 shrink-0">
          <SelectFilter value={filterYear}      onChange={setFilterYear}      options={yearFilterOptions}  />
          <SelectFilter value={filterAuthority} onChange={setFilterAuthority} options={AUTHORITY_OPTIONS}  />
          <SelectFilter value={filterProgram}   onChange={setFilterProgram}   options={PROGRAM_OPTIONS}    />
          <SelectFilter value={filterType}      onChange={setFilterType}      options={TYPE_OPTIONS}       />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      ) : groupedByYear.size === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No calendars found</p>
          <button onClick={openAdd} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={15} /> Add Calendar
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(groupedByYear.entries()).map(([year, items]) => (
            <section key={year}>
              <h2 className="text-base font-semibold text-slate-700 mb-3">{year}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(item => (
                  <CalendarCard
                    key={item.calendarId}
                    item={item}
                    onEdit={() => openEdit(item)}
                    onDelete={() => deleteDialog.open(item.calendarId)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editItem ? 'Edit Calendar Entry' : 'Add Calendar Entry'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Authority" required>
              <select className="input-field" value={form.authority} onChange={e => setField('authority', e.target.value as FormData['authority'])}>
                <option value="INSTITUTE">Institute</option>
                <option value="VTU">VTU</option>
              </select>
            </FormField>
            <FormField label="Program" required>
              <select className="input-field" value={form.program} onChange={e => setField('program', e.target.value as FormData['program'])}>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
              </select>
            </FormField>
            <FormField label="Type" required>
              <select className="input-field" value={form.type} onChange={e => setField('type', e.target.value as FormData['type'])}>
                <option value="CURRENT">Current</option>
                <option value="HISTORIC">Historic</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Semester" required hint='e.g. "I", "I-II", "III-IV"'>
              <input className="input-field" value={form.semester} onChange={e => setField('semester', e.target.value)} placeholder="I-II" />
            </FormField>
            <FormField label="Year" required hint='e.g. "2025-26"'>
              <input className="input-field" value={form.year} onChange={e => setField('year', e.target.value)} placeholder="2025-26" />
            </FormField>
            <FormField label="Date" required>
              <input type="date" className="input-field" value={form.date} onChange={e => setField('date', e.target.value)} />
            </FormField>
          </div>

          <FormField label="Title" required hint="Auto-suggested from other fields — edit freely">
            <input
              className="input-field"
              value={form.title}
              onChange={e => { setTitleManual(true); setField('title', e.target.value) }}
              placeholder="Calendar title"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              className="input-field resize-none"
              rows={2}
              value={form.description ?? ''}
              onChange={e => setField('description', e.target.value)}
              placeholder="Optional description"
            />
          </FormField>

          <FormField label="PDF File" required>
            <div className="space-y-2">
              {form.fileUrl && (
                <div className="flex items-center gap-2 text-sm bg-slate-50 rounded-lg px-3 py-2">
                  <FileText size={14} className="text-brand-500 shrink-0" />
                  <span className="truncate text-xs text-slate-600">{form.fileUrl.split('/').pop()}</span>
                  <a href={form.fileUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-brand-600 shrink-0">
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                {uploading ? 'Uploading…' : form.fileUrl ? 'Replace PDF' : 'Upload PDF'}
              </button>
            </div>
          </FormField>
        </div>
        <ModalFooter>
          <button className="btn-secondary" onClick={closeModal}>Cancel</button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : editItem ? 'Update' : 'Add'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Delete Calendar"
        message={`Delete "${deletingItem?.title}"? This cannot be undone.`}
      />
    </div>
  )
}
