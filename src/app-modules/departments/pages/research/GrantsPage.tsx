import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, Landmark } from 'lucide-react'
import { researchGrantService } from '@/app-modules/departments/api/deptResearchApi'
import type { ResearchGrant } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'

export default function GrantsPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast      = useToast()

  const { data, reload } = useDepartmentSectionAsync(() => researchGrantService.getAll(deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<ResearchGrant | null>(null)
  const [text, setText]           = useState('')
  const deleteDialog              = useConfirmDialog()

  async function handleSave() {
    if (!text.trim()) { toast.error('Grant text is required'); return }
    try {
      if (editItem) {
        await researchGrantService.update(editItem.id, { text: text.trim() })
        toast.success('Grant updated')
      } else {
        await researchGrantService.create({ deptId: deptId!, text: text.trim() })
        toast.success('Grant added')
      }
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save grant')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await researchGrantService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete grant')
    }
  }

  function openAdd() { setEditItem(null); setText(''); setModalOpen(true) }
  function openEdit(item: ResearchGrant) { setEditItem(item); setText(item.text); setModalOpen(true) }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">Research Grants</h3>
          <p className="text-sm text-slate-500">{data.length} grant{data.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Grant
        </button>
      </div>

      {/* Card grid */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50/30">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
            <Landmark size={24} className="text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-600">No grants yet</p>
          <p className="text-xs text-slate-400 mt-1">Add research grants using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(item => (
            <div key={item.id}
              className="rounded-xl border border-emerald-200 bg-emerald-50 flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Top accent strip */}
              <div className="h-1.5 bg-emerald-500" />
              {/* Body */}
              <div className="flex-1 p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
              </div>
              {/* Footer */}
              <div className="flex items-center gap-1 px-3 py-2 border-t border-emerald-200">
                <button onClick={() => openEdit(item)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-white/70 transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => deleteDialog.open(item.id)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-white/70 transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Grant' : 'Add Research Grant'} size="lg">
        <div className="space-y-4">
          <FormField label="Grant" required>
            <textarea
              className="input-field resize-none"
              rows={6}
              placeholder="e.g. Dr. Priya Sharma received a research grant of ₹12.5 Lakhs from SERB-DST for the project 'Deep Learning-based Anomaly Detection in IoT Networks' (2023–2025)."
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Save</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Grant"
        message="This grant record will be permanently deleted."
        confirmLabel="Delete" />
    </div>
  )
}
