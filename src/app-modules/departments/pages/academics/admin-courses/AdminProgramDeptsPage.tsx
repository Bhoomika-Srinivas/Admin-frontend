import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react'
import { adminProgramService, adminDeptService } from '@/app-modules/departments/api/adminCoursesApi'
import type { AdminProgramDept } from '@/shared/types/models'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import CatalogBreadcrumb from '@/app-modules/departments/components/CatalogBreadcrumb'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'

type Form = { name: string; shortName: string }
const blank = (): Form => ({ name: '', shortName: '' })

export default function AdminProgramDeptsPage() {
  const { programId }     = useParams<{ programId: string }>()
  const navigate          = useNavigate()
  const { user }          = useAuth()
  const toast             = useToast()
  const program           = adminProgramService.getById(programId!)
  const [depts, setDepts] = useState(() => adminDeptService.getByProgram(programId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<AdminProgramDept | null>(null)
  const [form, setForm]           = useState<Form>(blank)
  const deleteDialog              = useConfirmDialog()

  function reload() { setDepts(adminDeptService.getByProgram(programId!)) }
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.name.trim() || !form.shortName.trim()) { toast.error('Name and short name are required'); return }
    if (editItem) {
      adminDeptService.update(editItem.id, form, user)
      toast.success('Department updated')
    } else {
      adminDeptService.create({ programId: programId!, ...form }, user)
      toast.success('Department added')
    }
    reload(); setModalOpen(false)
  }

  function handleDelete() {
    if (!deleteDialog.targetId) return
    adminDeptService.delete(deleteDialog.targetId, user)
    reload(); deleteDialog.close(); toast.success('Deleted')
  }

  function openAdd() { setEditItem(null); setForm(blank()); setModalOpen(true) }
  function openEdit(d: AdminProgramDept) {
    setEditItem(d); setForm({ name: d.name, shortName: d.shortName }); setModalOpen(true)
  }

  const base = `/academics/catalog/${programId}`

  const columns: Column<AdminProgramDept>[] = [
    {
      key: 'name', header: 'Department Name',
      render: r => (
        <div>
          <p className="font-medium text-sm text-slate-800">{r.name}</p>
        </div>
      ),
    },
    {
      key: 'shortName', header: 'Short Name',
      render: r => (
        <span className="text-xs font-semibold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md">
          {r.shortName}
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
          <button onClick={() => navigate(`${base}/${r.id}`)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <ChevronRight size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <CatalogBreadcrumb items={[{ label: program?.name ?? programId! }]} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">
            {program?.name} — Departments
          </h2>
          <p className="text-sm text-slate-500">{program?.fullName} · {depts.length} departments</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Department
        </button>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={depts}
          keyExtractor={r => r.id}
          total={depts.length}
          onRowClick={r => navigate(`${base}/${r.id}`)}
          emptyTitle="No departments yet"
          emptyDescription="Add departments to this program using the button above."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <FormField label="Department Name" required>
            <input className="input-field" value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Computer Science & Engineering" />
          </FormField>
          <FormField label="Short Name" required>
            <input className="input-field font-semibold uppercase" value={form.shortName}
              onChange={e => set('shortName', e.target.value.toUpperCase())}
              placeholder="e.g. CSE" />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            {editItem ? 'Save Changes' : 'Add Department'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Department"
        message="This will remove the department and all its associated batches and courses."
        confirmLabel="Delete" />
    </div>
  )
}
