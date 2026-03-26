import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2, Award, GraduationCap, Users } from 'lucide-react'
import { achievementService } from '@/app-modules/departments/api/deptActivitiesApi'
import type { Achievement } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import clsx from 'clsx'

const TABS = ['Student', 'Staff'] as const
type Tab = typeof TABS[number]

// Rotating card colour palette
const CARD_COLORS = [
  { bg: 'bg-blue-50',    border: 'border-blue-200',   accent: 'bg-blue-500',    dot: 'bg-blue-400'    },
  { bg: 'bg-purple-50',  border: 'border-purple-200', accent: 'bg-purple-500',  dot: 'bg-purple-400'  },
  { bg: 'bg-emerald-50', border: 'border-emerald-200',accent: 'bg-emerald-500', dot: 'bg-emerald-400' },
  { bg: 'bg-amber-50',   border: 'border-amber-200',  accent: 'bg-amber-500',   dot: 'bg-amber-400'   },
  { bg: 'bg-rose-50',    border: 'border-rose-200',   accent: 'bg-rose-500',    dot: 'bg-rose-400'    },
  { bg: 'bg-indigo-50',  border: 'border-indigo-200', accent: 'bg-indigo-500',  dot: 'bg-indigo-400'  },
  { bg: 'bg-teal-50',    border: 'border-teal-200',   accent: 'bg-teal-500',    dot: 'bg-teal-400'    },
  { bg: 'bg-orange-50',  border: 'border-orange-200', accent: 'bg-orange-500',  dot: 'bg-orange-400'  },
]

function AchievementCard({
  item, index, onEdit, onDelete,
}: {
  item: Achievement
  index: number
  onEdit: (item: Achievement) => void
  onDelete: (id: string) => void
}) {
  const color = CARD_COLORS[index % CARD_COLORS.length]

  return (
    <div className={clsx(
      'rounded-xl border p-0 flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow',
      color.bg, color.border,
    )}>
      {/* Coloured top strip */}
      <div className={clsx('h-1.5 w-full', color.accent)} />

      {/* Body */}
      <div className="flex-1 p-4">
        <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
      </div>

      {/* Footer actions */}
      <div className={clsx('flex items-center gap-1 px-3 py-2 border-t', color.border)}>
        <button
          onClick={() => onEdit(item)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-white/70 transition-colors"
        >
          <Edit2 size={12} /> Edit
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-white/70 transition-colors"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  )
}

function AchievementList({ deptId, type }: { deptId: string; type: 'student' | 'staff' }) {
  const toast = useToast()

  const { data: all, reload } = useDepartmentSectionAsync(() => achievementService.getAll(deptId, type))

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<Achievement | null>(null)
  const [text, setText]           = useState('')
  const deleteDialog              = useConfirmDialog()

  async function handleSave() {
    if (!text.trim()) { toast.error('Achievement text is required'); return }
    try {
      if (editItem) {
        await achievementService.update(editItem.id, { text: text.trim() })
        toast.success('Achievement updated')
      } else {
        await achievementService.create({ deptId, type, text: text.trim() })
        toast.success('Achievement added')
      }
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  function handleDelete(id: string) {
    deleteDialog.open(id)
  }

  async function confirmDelete() {
    if (!deleteDialog.targetId) return
    try {
      await achievementService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  function openAdd() { setEditItem(null); setText(''); setModalOpen(true) }
  function openEdit(item: Achievement) { setEditItem(item); setText(item.text); setModalOpen(true) }

  const label = type === 'student' ? 'Student' : 'Staff'
  const Icon  = type === 'student' ? GraduationCap : Users

  return (
    <div className="space-y-5">
      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <Icon size={16} />
          <span className="text-sm font-medium">
            {all.length} {label} achievement{all.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Achievement
        </button>
      </div>

      {/* Grid */}
      {all.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Award size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">No {label.toLowerCase()} achievements yet</p>
          <p className="text-xs text-slate-400 mt-1">Add one using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {all.map((item, idx) => (
            <AchievementCard
              key={item.id}
              item={item}
              index={idx}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Achievement' : 'Add Achievement'} size="lg">
        <div className="space-y-4">
          <FormField label="Achievement" required>
            <textarea
              className="input-field resize-none"
              rows={6}
              placeholder={`e.g. Dr. Usha G. R. was awarded a Certificate of Appreciation for her outstanding contribution as Session Chair at the 5th International Conference on Intelligent Technologies (CONIT 2025)...`}
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
        onConfirm={confirmDelete} title="Delete Achievement"
        message="This achievement will be permanently deleted."
        confirmLabel="Delete" />
    </div>
  )
}

export default function AchievementsPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const [tab, setTab] = useState<Tab>('Student')
  if (!deptId) return null

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h3 className="text-base font-display font-bold text-slate-800">Achievements</h3>
        <p className="text-sm text-slate-500">Student and staff achievements</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {t === 'Student' ? <GraduationCap size={14} /> : <Users size={14} />}
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'Student' && <AchievementList deptId={deptId} type="student" />}
      {tab === 'Staff'   && <AchievementList deptId={deptId} type="staff"   />}
    </div>
  )
}
