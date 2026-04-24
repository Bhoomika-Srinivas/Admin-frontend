import { useState, useEffect, useMemo, useRef } from 'react'
import { Plus, Edit2, Trash2, FileText, Download, Upload, Loader2, ExternalLink } from 'lucide-react'
import { schemeSyllabusService } from '../api/academicsApi'
import type { SchemeSyllabusEntry } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { uploadToS3 } from '@/shared/utils/s3Upload'
import { validateDocumentFile } from '@/shared/utils/validateFile'

type FormData = Omit<SchemeSyllabusEntry, 'syllabusId' | 'createdAt'>

const emptyForm: FormData = { year: '', category: '', title: '', subtitle: '', fileUrl: '', order: 0 }

export default function SchemeSyllabusPage() {
  const toast = useToast()
  const [entries, setEntries] = useState<SchemeSyllabusEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<SchemeSyllabusEntry | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const deleteDialog = useConfirmDialog()

  async function load() {
    setLoading(true)
    try {
      const data = await schemeSyllabusService.getAll()
      setEntries(data)
    } catch {
      toast.error('Failed to load scheme & syllabus data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const years = useMemo(
    () => Array.from(new Set(entries.map(e => e.year))).sort((a, b) => Number(b) - Number(a)),
    [entries]
  )

  const existingCategories = useMemo(
    () => Array.from(new Set(entries.map(e => e.category).filter(Boolean))),
    [entries]
  )

  const visibleEntries = useMemo(
    () => selectedYear === 'all' ? entries : entries.filter(e => e.year === selectedYear),
    [entries, selectedYear]
  )

  // year → category → entries (category '' = standalone)
  const grouped = useMemo(() => {
    const yearMap = new Map<string, Map<string, SchemeSyllabusEntry[]>>()
    const orderedYears = selectedYear === 'all' ? years : [selectedYear]
    for (const y of orderedYears) {
      const catMap = new Map<string, SchemeSyllabusEntry[]>()
      const forYear = visibleEntries.filter(e => e.year === y).sort((a, b) => a.order - b.order)
      for (const e of forYear) {
        const cat = e.category ?? ''
        if (!catMap.has(cat)) catMap.set(cat, [])
        catMap.get(cat)!.push(e)
      }
      if (catMap.size > 0) yearMap.set(y, catMap)
    }
    return yearMap
  }, [visibleEntries, years, selectedYear])

  function openAdd() {
    setEditItem(null)
    setForm({ ...emptyForm, year: selectedYear !== 'all' ? selectedYear : '' })
    setModalOpen(true)
  }

  function openEdit(item: SchemeSyllabusEntry) {
    setEditItem(item)
    setForm({
      year:     item.year,
      category: item.category ?? '',
      title:    item.title,
      subtitle: item.subtitle ?? '',
      fileUrl:  item.fileUrl,
      order:    item.order,
    })
    setModalOpen(true)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateDocumentFile(file)
    if (err) { toast.error(err); e.target.value = ''; return }
    setUploading(true)
    try {
      const id = editItem?.syllabusId ?? `tmp-${Date.now()}`
      const url = await uploadToS3(file, 'scheme-syllabus', id)
      setForm(f => ({ ...f, fileUrl: url }))
      toast.success('File uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSave() {
    if (!form.year.trim()) { toast.error('Year is required'); return }
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.fileUrl) { toast.error('Please upload a file'); return }
    setSaving(true)
    try {
      if (editItem) {
        await schemeSyllabusService.update(editItem.syllabusId, form)
        toast.success('Entry updated')
      } else {
        await schemeSyllabusService.create(form)
        toast.success('Entry added')
      }
      await load()
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
      await schemeSyllabusService.delete(deleteDialog.targetId)
      await load()
      toast.success('Entry removed')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const fileName = (url: string) => {
    try { return decodeURIComponent(url.split('/').pop() ?? url) } catch { return url }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Scheme &amp; Syllabus</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Loading…' : `${entries.length} document${entries.length !== 1 ? 's' : ''} • ${years.length} year${years.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> Add Entry
        </button>
      </div>

      {/* Year Tabs */}
      {years.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedYear === 'all'
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Years
          </button>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedYear === y
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : entries.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">No entries yet</p>
          <p className="text-xs text-slate-400 mt-1">Add scheme and syllabus documents for students to download.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([year, catMap]) => (
            <div key={year}>
              {selectedYear === 'all' && (
                <h3 className="text-base font-display font-bold text-slate-700 mb-3">
                  Scheme and Syllabus — {year}
                </h3>
              )}
              <div className="space-y-4">
                {/* Standalone entries (no category) first */}
                {catMap.has('') && (
                  <div className="card divide-y divide-slate-100">
                    {catMap.get('')!.map(entry => (
                      <EntryRow
                        key={entry.syllabusId}
                        entry={entry}
                        onEdit={openEdit}
                        onDelete={id => deleteDialog.open(id)}
                        fileName={fileName}
                      />
                    ))}
                  </div>
                )}
                {/* Categorised entries */}
                {Array.from(catMap.entries())
                  .filter(([cat]) => cat !== '')
                  .map(([cat, items]) => (
                    <div key={cat} className="card">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-1 h-5 rounded-full bg-brand-500 shrink-0" />
                        <h4 className="text-sm font-semibold text-slate-700">{cat}</h4>
                        <span className="ml-auto text-xs text-slate-400">
                          {items.length} file{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {items.map(entry => (
                          <EntryRow
                            key={entry.syllabusId}
                            entry={entry}
                            onEdit={openEdit}
                            onDelete={id => deleteDialog.open(id)}
                            fileName={fileName}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Entry' : 'Add Scheme & Syllabus Entry'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Year" required hint="e.g. 2025">
              <input
                className="input-field"
                list="years-list"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                placeholder="e.g. 2025"
              />
              <datalist id="years-list">
                {years.map(y => <option key={y} value={y} />)}
              </datalist>
            </FormField>
            <FormField label="Order" hint="Within category">
              <input
                type="number"
                className="input-field"
                value={form.order}
                onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                min={0}
              />
            </FormField>
          </div>
          <FormField label="Category" hint="Leave blank for standalone entries">
            <input
              className="input-field"
              list="categories-list"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="e.g. UG Scheme and Syllabus 2nd-Year - 2024"
            />
            <datalist id="categories-list">
              {existingCategories.map(c => <option key={c} value={c} />)}
            </datalist>
          </FormField>
          <FormField label="Title" required>
            <input
              className="input-field"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Computer Science &amp; Engineering Stream"
            />
          </FormField>
          <FormField label="Subtitle" hint="Optional — e.g. (CSE, ISE, AIML)">
            <input
              className="input-field"
              value={form.subtitle ?? ''}
              onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
              placeholder="e.g. (CSE, ISE, AIML, CSDS, CS&D, CSBS, BT)"
            />
          </FormField>
          <FormField label="Document File" required>
            <div className="space-y-2">
              {form.fileUrl && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText size={14} className="text-brand-600 shrink-0" />
                  <span className="text-xs text-slate-600 truncate flex-1">{fileName(form.fileUrl)}</span>
                  <a
                    href={form.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-brand-600"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  {uploading ? 'Uploading…' : form.fileUrl ? 'Replace File' : 'Upload File'}
                </button>
                <span className="text-xs text-slate-400">PDF, DOC, DOCX</span>
              </div>
            </div>
          </FormField>
        </div>
        <ModalFooter>
          <button
            onClick={() => setModalOpen(false)}
            className="btn-secondary"
            disabled={saving || uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={saving || uploading}
          >
            {saving ? 'Saving…' : editItem ? 'Save Changes' : 'Add Entry'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title="Remove Entry"
        message="This scheme & syllabus entry will be permanently removed."
        confirmLabel="Remove"
      />
    </div>
  )
}

// ─── Entry Row ────────────────────────────────────────────────────────────────

function EntryRow({
  entry,
  onEdit,
  onDelete,
  fileName,
}: {
  entry: SchemeSyllabusEntry
  onEdit: (item: SchemeSyllabusEntry) => void
  onDelete: (id: string) => void
  fileName: (url: string) => string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 group">
      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
        <FileText size={15} className="text-brand-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{entry.title}</p>
        {entry.subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{entry.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {entry.fileUrl && (
          <a
            href={entry.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
            title={`Download: ${fileName(entry.fileUrl)}`}
          >
            <Download size={14} />
          </a>
        )}
        <button
          onClick={() => onEdit(entry)}
          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onDelete(entry.syllabusId)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
