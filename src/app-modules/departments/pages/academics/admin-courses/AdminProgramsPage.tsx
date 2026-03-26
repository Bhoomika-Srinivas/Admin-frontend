import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react'
import { adminProgramService, adminDeptService, adminBatchService } from '@/app-modules/departments/api/adminCoursesApi'
import type { AdminProgram } from '@/shared/types/models'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'

type Form = Omit<AdminProgram, 'id'>

const blank = (): Form => ({ name: '', fullName: '', duration: '', maxSemesters: 8 })

export default function AdminProgramsPage() {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const toast         = useToast()
  const [programs, setPrograms] = useState(() => adminProgramService.getAll())
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<AdminProgram | null>(null)
  const [form, setForm]           = useState<Form>(blank)
  const deleteDialog              = useConfirmDialog()

  function reload() { setPrograms(adminProgramService.getAll()) }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.name.trim() || !form.fullName.trim()) { toast.error('Name and full name are required'); return }
    if (editItem) {
      adminProgramService.update(editItem.id, form, user)
      toast.success('Program updated')
    } else {
      adminProgramService.create(form, user)
      toast.success('Program added')
    }
    reload(); setModalOpen(false)
  }

  function handleDelete() {
    if (!deleteDialog.targetId) return
    adminProgramService.delete(deleteDialog.targetId, user)
    reload(); deleteDialog.close(); toast.success('Program deleted')
  }

  function openAdd() { setEditItem(null); setForm(blank()); setModalOpen(true) }
  function openEdit(p: AdminProgram) {
    setEditItem(p)
    setForm({ name: p.name, fullName: p.fullName, duration: p.duration, maxSemesters: p.maxSemesters })
    setModalOpen(true)
  }

  const columns: Column<AdminProgram>[] = [
    {
      key: 'name', header: 'Program',
      render: r => (
        <div>
          <p className="font-semibold text-sm text-slate-800">{r.name}</p>
          <p className="text-xs text-slate-400">{r.fullName}</p>
        </div>
      ),
    },
    { key: 'duration',     header: 'Duration',      render: r => <span className="text-sm">{r.duration}</span> },
    { key: 'maxSemesters', header: 'Max Semesters',  render: r => <span className="text-sm">{r.maxSemesters}</span> },
    {
      key: 'fullName', header: 'Departments',
      render: r => (
        <span className="text-sm font-medium text-slate-600">
          {adminDeptService.getByProgram(r.id).length}
        </span>
      ),
    },
    {
      key: 'id', header: 'Batches',
      render: r => (
        <span className="text-sm font-medium text-slate-600">
          {new Set(adminBatchService.getByDept(r.id, '').concat(
            adminDeptService.getByProgram(r.id).flatMap(d => adminBatchService.getByDept(r.id, d.id))
          ).map(b => b.batchYear)).size || '—'}
        </span>
      ),
    },
    {
      key: 'actions', header: '', className: 'w-24',
      render: r => (
        <div className="flex gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); openEdit(r) }}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <Edit2 size={14} />
          </button>
          <button onClick={e => { e.stopPropagation(); deleteDialog.open(r.id) }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={14} />
          </button>
          <button onClick={() => navigate(`/academics/catalog/${r.id}`)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <ChevronRight size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Course Catalog</h2>
          <p className="text-sm text-slate-500">{programs.length} programs</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Program
        </button>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={programs}
          keyExtractor={r => r.id}
          total={programs.length}
          onRowClick={r => navigate(`/academics/catalog/${r.id}`)}
          emptyTitle="No programs yet"
          emptyDescription="Add your first academic program using the button above."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Program' : 'Add Program'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Short Name" required>
              <input className="input-field font-semibold" value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="e.g. BE, MCA" />
            </FormField>
            <FormField label="Duration">
              <input className="input-field" value={form.duration}
                onChange={e => set('duration', e.target.value)} placeholder="e.g. 4 Years" />
            </FormField>
          </div>
          <FormField label="Full Name" required>
            <input className="input-field" value={form.fullName}
              onChange={e => set('fullName', e.target.value)}
              placeholder="e.g. Bachelor of Engineering" />
          </FormField>
          <FormField label="Max Semesters">
            <input type="number" className="input-field" min={1} max={12}
              value={form.maxSemesters} onChange={e => set('maxSemesters', Number(e.target.value))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            {editItem ? 'Save Changes' : 'Add Program'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Program"
        message="This will delete the program. Associated departments and batches will also be removed."
        confirmLabel="Delete" />
    </div>
  )
}
