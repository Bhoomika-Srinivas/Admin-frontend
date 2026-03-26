import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, Image } from 'lucide-react'
import { deptGalleryService } from '@/app-modules/departments/api/deptActivitiesApi'
import type { DeptGalleryPhoto } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import SearchBar from '@/shared/components/filters/SearchBar'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useSearch } from '@/shared/hooks/useSearch'

const emptyForm: Omit<DeptGalleryPhoto, 'id' | 'deptId' | 'uploadedAt'> = {
  title: '', category: '', imageUrl: '', capturedAt: '',
}

export default function PhotoGalleryPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast = useToast()
  const { data, reload } = useDepartmentSectionAsync<DeptGalleryPhoto>(() => deptGalleryService.getAll(deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<DeptGalleryPhoto | null>(null)
  const [form, setForm] = useState<Omit<DeptGalleryPhoto, 'id' | 'deptId' | 'uploadedAt'>>(emptyForm)
  const deleteDialog = useConfirmDialog()
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  const filtered = useMemo(() => data.filter(p => {
    const q = debouncedSearch.toLowerCase()
    return !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  }), [data, debouncedSearch])

  async function handleSave() {
    if (!form.title || !form.imageUrl) { toast.error('Title and image URL are required'); return }
    const entry = { ...form, uploadedAt: new Date().toISOString() }
    try {
      if (editItem) {
        await deptGalleryService.update(editItem.id, entry); toast.success('Updated')
      } else {
        await deptGalleryService.create({ ...entry, deptId: deptId! }); toast.success('Added')
      }
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await deptGalleryService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (item: DeptGalleryPhoto) => {
    setEditItem(item)
    setForm({ title: item.title, category: item.category, imageUrl: item.imageUrl, capturedAt: item.capturedAt })
    setModalOpen(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">Photo Gallery</h3>
          <p className="text-sm text-slate-500">{data.length} photos</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Photo
        </button>
      </div>

      <div className="card p-4">
        <SearchBar value={searchTerm} onChange={setSearchTerm}
          placeholder="Search by title or category..." className="max-w-sm mb-4" />
        {filtered.length === 0
          ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <Image size={40} className="opacity-30" />
              <p className="text-sm">No photos yet. Add some to get started.</p>
            </div>
          )
          : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(photo => (
                <div key={photo.id} className="group relative rounded-xl overflow-hidden aspect-square bg-slate-100">
                  <img src={photo.imageUrl} alt={photo.title}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = '' }} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100">
                    <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                    {photo.category && <p className="text-white/70 text-xs truncate">{photo.category}</p>}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(photo)}
                      className="p-1.5 bg-white/90 text-slate-700 hover:text-brand-600 rounded-lg shadow">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => deleteDialog.open(photo.id)}
                      className="p-1.5 bg-white/90 text-slate-700 hover:text-red-600 rounded-lg shadow">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Photo' : 'Add Photo'}>
        <div className="space-y-4">
          <FormField label="Title" required>
            <input className="input-field" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </FormField>
          <FormField label="Category">
            <input className="input-field" placeholder="e.g. Events, Labs, Graduation"
              value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </FormField>
          <FormField label="Image URL" required>
            <input className="input-field" placeholder="https://..."
              value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
          </FormField>
          {form.imageUrl && (
            <img src={form.imageUrl} alt="preview" className="w-full h-40 object-cover rounded-xl" />
          )}
          <FormField label="Captured On">
            <input type="date" className="input-field"
              value={form.capturedAt} onChange={e => setForm(f => ({ ...f, capturedAt: e.target.value }))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add Photo'}</button>
        </ModalFooter>
      </Modal>
      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Photo"
        message="This photo will be permanently deleted." confirmLabel="Delete" />
    </div>
  )
}
