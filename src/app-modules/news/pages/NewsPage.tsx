import { useState, useMemo, useRef } from 'react'
import { Plus, Edit2, Trash2, Pin, Upload, X } from 'lucide-react'
import type { News } from '@/shared/types/models'
import { NewsSchema } from '@/app-modules/news/types'
import { newsService } from '@/app-modules/news/api/newsApi'
import { useNews } from '@/app-modules/news/hooks/useNews'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useFormErrors } from '@/shared/hooks/useFormErrors'
import clsx from 'clsx'

// ── Single image upload ───────────────────────────────────────────────────────

function ImageUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div>
      <label className="label mb-1.5 block">Image</label>
      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-24 h-20 rounded-lg border-2 border-dashed flex items-center justify-center shrink-0 overflow-hidden bg-slate-50',
          value ? 'border-slate-200' : 'border-slate-300',
        )}>
          {value
            ? <img src={value} alt="" className="w-full h-full object-cover" />
            : <Upload size={18} className="text-slate-300" />
          }
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={() => ref.current?.click()} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            <Upload size={12} /> {value ? 'Replace' : 'Upload'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
              <X size={12} /> Remove
            </button>
          )}
        </div>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

const emptyForm: Omit<News, 'id' | 'createdAt'> = {
  title: '', date: '', description: '', image: '', pinned: false,
}

export default function NewsPage() {
  const { user } = useAuth()
  const toast = useToast()

  const { news, loading, error, reload } = useNews()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<News | null>(null)
  const [form, setForm] = useState<Omit<News, 'id' | 'createdAt'>>(emptyForm)
  const { errors, setErrors, clearErrors } = useFormErrors(NewsSchema)
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const deleteDialog = useConfirmDialog()

  const filtered = useMemo(() => news.filter(n => {
    const q = debouncedSearch.toLowerCase()
    return !q || n.title.toLowerCase().includes(q)
  }), [news, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  function openAdd() {
    setEditItem(null); setForm(emptyForm); clearErrors(); setModalOpen(true)
  }

  function openEdit(item: News) {
    setEditItem(item)
    setForm({ title: item.title, date: item.date, description: item.description, image: item.image, pinned: item.pinned })
    clearErrors()
    setModalOpen(true)
  }

  function handleSave() {
    const parsed = NewsSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearErrors()
    if (editItem) {
      newsService.update(editItem.id, form, user)
      toast.success('News updated')
    } else {
      newsService.create(form, user)
      toast.success('News created')
    }
    reload(); setModalOpen(false)
  }

  function handleDelete() {
    if (!deleteDialog.targetId) return
    newsService.delete(deleteDialog.targetId, user)
    reload(); deleteDialog.close(); toast.success('News deleted')
  }

  function handleTogglePin(item: News) {
    newsService.togglePin(item.id, user)
    reload()
    toast.success(item.pinned ? 'News unpinned' : 'News pinned')
  }

  const columns: Column<News>[] = [
    {
      key: 'pinned', header: '', className: 'w-10',
      render: row => (
        <button
          onClick={() => handleTogglePin(row)}
          title={row.pinned ? 'Unpin' : 'Pin to top'}
          className={clsx(
            'p-1.5 rounded-lg transition-colors',
            row.pinned
              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
              : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50',
          )}
        >
          <Pin size={13} className={row.pinned ? 'fill-amber-400' : ''} />
        </button>
      ),
    },
    {
      key: 'image', header: '', className: 'w-12',
      render: row => row.image
        ? <img src={row.image} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-100" />
        : <div className="w-9 h-9 rounded-lg bg-slate-100" />,
    },
    {
      key: 'title', header: 'Title',
      render: row => <p className="font-medium text-slate-800 line-clamp-1">{row.title}</p>,
    },
    { key: 'date', header: 'Date', render: row => <span className="text-sm">{row.date}</span> },
    {
      key: 'actions', header: '', className: 'w-20',
      render: row => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Edit2 size={14} /></button>
          <button onClick={() => deleteDialog.open(row.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">News</h2>
          <p className="text-sm text-slate-500">{news.length} total · {news.filter(n => n.pinned).length} pinned</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Add News</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search news..." className="max-w-sm" />
        </div>
        {error && <p className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</p>}
        <DataTable
          columns={columns} data={paginated} loading={loading} keyExtractor={r => r.id}
          total={filtered.length} page={page} limit={limit} onPageChange={setPage}
          emptyTitle="No news yet"
        />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); clearErrors() }} title={editItem ? 'Edit News' : 'Add News'} size="lg">
        <div className="space-y-4">
          <FormField label="Title" required error={errors.title?.[0]}>
            <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="News headline" />
          </FormField>
          <FormField label="Date" required error={errors.date?.[0]}>
            <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </FormField>
          <FormField label="Description" required error={errors.description?.[0]}>
            <textarea className="input-field resize-none h-28" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="News content or summary..." />
          </FormField>
          <ImageUpload value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} />
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 accent-brand-600"
            />
            <span className="text-sm font-medium text-slate-700">Pin this news to the top</span>
          </label>
        </div>
        <ModalFooter>
          <button onClick={() => { setModalOpen(false); clearErrors() }} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add News'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete News" message="This news post will be permanently deleted." confirmLabel="Delete"
      />
    </div>
  )
}
