import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronRight } from 'lucide-react'
import {
  adminProgramService, adminDeptService,
  adminBatchService, adminCourseService,
} from '@/app-modules/departments/api/adminCoursesApi'
import type { AdminBatch } from '@/shared/types/models'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import CatalogBreadcrumb from '@/app-modules/departments/components/CatalogBreadcrumb'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'

export default function AdminBatchesPage() {
  const { programId, deptId, semester } = useParams<{
    programId: string; deptId: string; semester: string
  }>()
  const sem      = Number(semester)
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast    = useToast()

  const program = adminProgramService.getById(programId!)
  const dept    = adminDeptService.getById(deptId!)

  const [batches, setBatches] = useState(() => adminBatchService.getByDept(programId!, deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [batchYear, setBatchYear] = useState('')
  const deleteDialog              = useConfirmDialog()

  function reload() { setBatches(adminBatchService.getByDept(programId!, deptId!)) }

  function handleSave() {
    if (!batchYear.trim()) { toast.error('Batch year is required'); return }
    if (adminBatchService.existsForDept(programId!, deptId!, batchYear.trim())) {
      toast.error('This batch already exists for this department'); return
    }
    adminBatchService.create({ programId: programId!, departmentId: deptId!, batchYear: batchYear.trim() }, user)
    toast.success('Batch added')
    reload(); setBatchYear(''); setModalOpen(false)
  }

  function handleDelete() {
    if (!deleteDialog.targetId) return
    adminBatchService.delete(deleteDialog.targetId, user)
    reload(); deleteDialog.close(); toast.success('Batch deleted')
  }

  const base = `/academics/catalog/${programId}/${deptId}/${semester}`

  const columns: Column<AdminBatch>[] = [
    {
      key: 'batchYear', header: 'Batch Year',
      render: r => (
        <span className="font-semibold text-sm text-slate-800">{r.batchYear}</span>
      ),
    },
    {
      key: 'id', header: 'Courses',
      render: r => {
        const count = adminCourseService.getByCourse(programId!, deptId!, sem, r.batchYear).length
        return <span className="text-sm text-slate-500">{count} course{count !== 1 ? 's' : ''}</span>
      },
    },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); deleteDialog.open(r.id) }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={14} />
          </button>
          <button onClick={() => navigate(`${base}/${encodeURIComponent(r.batchYear)}`)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <ChevronRight size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <CatalogBreadcrumb items={[
        { label: program?.name ?? programId!, to: `/academics/catalog/${programId}` },
        { label: dept?.shortName ?? deptId!, to: `/academics/catalog/${programId}/${deptId}` },
        { label: `Semester ${semester}` },
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">
            Semester {semester} — Batches
          </h2>
          <p className="text-sm text-slate-500">
            {program?.name} · {dept?.shortName} · {batches.length} batch{batches.length !== 1 ? 'es' : ''}
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
          onRowClick={r => navigate(`${base}/${encodeURIComponent(r.batchYear)}`)}
          emptyTitle="No batches yet"
          emptyDescription="Add a batch (e.g. 2022-26) using the button above."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Batch">
        <div className="space-y-4">
          <FormField label="Batch Year" required hint="e.g. 2022-26 or 2023">
            <input className="input-field" value={batchYear}
              onChange={e => setBatchYear(e.target.value)}
              placeholder="2022-26" />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Add Batch</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Batch"
        message="This will permanently delete this batch and all courses under it."
        confirmLabel="Delete" />
    </div>
  )
}
