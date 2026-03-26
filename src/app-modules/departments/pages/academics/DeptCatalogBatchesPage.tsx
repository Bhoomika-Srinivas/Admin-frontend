import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronRight } from 'lucide-react'
import { deptBatchService } from '@/app-modules/departments/api/deptAcademicsApi'
import { adminProgramService } from '@/app-modules/departments/api/adminCoursesApi'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import type { DeptBatch } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'

export default function DeptCatalogBatchesPage() {
  const { deptId, programId, semester } = useParams<{
    deptId: string; programId: string; semester: string
  }>()
  const navigate = useNavigate()
  const toast    = useToast()
  const dept     = useDeptContext()
  const program  = adminProgramService.getById(programId!)

  const { data: batches, reload } = useDepartmentSectionAsync(
    () => deptBatchService.getAll(deptId!, programId!)
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', startYear: '', endYear: '' })
  const deleteDialog = useConfirmDialog()

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Batch name is required'); return }
    if (batches.some(b => b.name === form.name.trim())) {
      toast.error('Batch already exists'); return
    }
    try {
      await deptBatchService.create({
        deptId: deptId!,
        programId: programId!,
        name: form.name.trim(),
        startYear: form.startYear ? Number(form.startYear) : undefined,
        endYear: form.endYear ? Number(form.endYear) : undefined,
      })
      toast.success('Batch added')
      reload(); setForm({ name: '', startYear: '', endYear: '' }); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add batch')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await deptBatchService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Batch deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete batch')
    }
  }

  const base = `/departments/${deptId}/academics/courses/${programId}/${semester}`

  const columns: Column<DeptBatch>[] = [
    {
      key: 'name', header: 'Batch',
      render: r => <span className="font-semibold text-sm text-slate-800">{r.name}</span>,
    },
    {
      key: 'startYear', header: 'Start Year',
      render: r => <span className="text-sm text-slate-500">{r.startYear ?? '—'}</span>,
    },
    {
      key: 'endYear', header: 'End Year',
      render: r => <span className="text-sm text-slate-500">{r.endYear ?? '—'}</span>,
    },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); deleteDialog.open(r.id) }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={14} />
          </button>
          <button onClick={() => navigate(`${base}/${encodeURIComponent(r.name)}`)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <ChevronRight size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm flex-wrap">
        <button onClick={() => navigate(`/departments/${deptId}/academics/courses`)}
          className="text-slate-500 hover:text-brand-600">Courses</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(`/departments/${deptId}/academics/courses/${programId}`)}
          className="text-slate-500 hover:text-brand-600">{program?.name}</button>
        <span className="text-slate-300">›</span>
        <span className="text-slate-700 font-medium">Semester {semester}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">
            Semester {semester} — Batches
          </h3>
          <p className="text-sm text-slate-500">
            {program?.name} · {dept.shortName} · {batches.length} batch{batches.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Batch
        </button>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={batches}
          keyExtractor={r => r.id}
          total={batches.length}
          onRowClick={r => navigate(`${base}/${encodeURIComponent(r.name)}`)}
          emptyTitle="No batches yet"
          emptyDescription="Add a batch (e.g. 2022-26) using the button above."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Batch">
        <div className="space-y-4">
          <FormField label="Batch Name" required hint='e.g. "2022-2026"'>
            <input className="input-field" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="2022-2026" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Year">
              <input type="number" className="input-field" value={form.startYear}
                onChange={e => setForm(f => ({ ...f, startYear: e.target.value }))} placeholder="2022" />
            </FormField>
            <FormField label="End Year">
              <input type="number" className="input-field" value={form.endYear}
                onChange={e => setForm(f => ({ ...f, endYear: e.target.value }))} placeholder="2026" />
            </FormField>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Add Batch</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Batch"
        message="This batch and all its courses will be permanently deleted."
        confirmLabel="Delete" />
    </div>
  )
}
