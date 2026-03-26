import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, FileDown } from 'lucide-react'
import { newsletterService } from '@/app-modules/departments/api/deptActivitiesApi'
import type { DeptNewsletter } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import SearchBar from '@/shared/components/filters/SearchBar'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'
import { useSearch } from '@/shared/hooks/useSearch'

const emptyForm: Omit<DeptNewsletter, 'id' | 'deptId'> = { title: '', volume: '', issue: '', publishedDate: '', fileUrl: '' }

export default function NewsletterPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast = useToast()
  const { data, reload } = useDepartmentSectionAsync<DeptNewsletter>(() => newsletterService.getAll(deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<DeptNewsletter | null>(null)
  const [form, setForm] = useState<Omit<DeptNewsletter, 'id' | 'deptId'>>(emptyForm)
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => data.filter(n => {
    const q = debouncedSearch.toLowerCase()
    return !q || n.title.toLowerCase().includes(q) || n.volume.toLowerCase().includes(q)
  }), [data, debouncedSearch])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleSave() {
    if (!form.title || !form.fileUrl) { toast.error('Title and file URL are required'); return }
    try {
      if (editItem) {
        await newsletterService.update(editItem.id, form); toast.success('Updated')
      } else {
        await newsletterService.create({ ...form, deptId: deptId! }); toast.success('Published')
      }
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await newsletterService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (item: DeptNewsletter) => {
    setEditItem(item)
    setForm({ title: item.title, volume: item.volume, issue: item.issue, publishedDate: item.publishedDate, fileUrl: item.fileUrl })
    setModalOpen(true)
  }

  const columns: Column<DeptNewsletter>[] = [
    {
      key: 'title', header: 'Newsletter',
      render: r => (
        <div>
          <p className="font-medium text-sm">{r.title}</p>
          <p className="text-xs text-slate-400">Vol {r.volume} · Issue {r.issue}</p>
        </div>
      ),
    },
    { key: 'publishedDate', header: 'Published', render: r => <span className="text-sm">{r.publishedDate}</span> },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1">
          {r.fileUrl && (
            <a href={r.fileUrl} target="_blank" rel="noreferrer"
              className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg">
              <FileDown size={14} />
            </a>
          )}
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">Newsletter</h3>
          <p className="text-sm text-slate-500">{data.length} issues</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Publish Issue
        </button>
      </div>
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }}
            placeholder="Search newsletters..." className="max-w-sm" />
        </div>
        <DataTable columns={columns} data={paginated} keyExtractor={r => r.id}
          total={filtered.length} page={page} limit={limit} onPageChange={setPage}
          emptyTitle="No newsletters yet" />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Newsletter' : 'Publish Newsletter Issue'} size="lg">
        <div className="space-y-4">
          <FormField label="Title" required>
            <input className="input-field" placeholder="e.g. TechVision — Issue 1"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Volume">
              <input className="input-field" placeholder="e.g. 5"
                value={form.volume} onChange={e => setForm(f => ({ ...f, volume: e.target.value }))} />
            </FormField>
            <FormField label="Issue">
              <input className="input-field" placeholder="e.g. 2"
                value={form.issue} onChange={e => setForm(f => ({ ...f, issue: e.target.value }))} />
            </FormField>
            <FormField label="Published Date">
              <input type="date" className="input-field"
                value={form.publishedDate} onChange={e => setForm(f => ({ ...f, publishedDate: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="File URL (PDF)" required>
            <input className="input-field" placeholder="https://..."
              value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Publish'}</button>
        </ModalFooter>
      </Modal>
      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Newsletter"
        message="This newsletter issue will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}
