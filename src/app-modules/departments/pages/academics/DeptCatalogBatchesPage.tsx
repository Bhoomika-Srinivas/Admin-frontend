import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronRight } from 'lucide-react'
import { deptBatchService } from '@/app-modules/departments/api/deptAcademicsApi'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import type { DeptBatch } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'

function batchOptions(programType: string): string[] {
  const now      = new Date().getFullYear()
  const duration = programType.toUpperCase() === 'PG' ? 2 : 4
  return Array.from({ length: 10 }, (_, i) => {
    const start = now - i
    const end   = start + duration
    return `${start}-${String(end).slice(-2)}`
  })
}

export default function DeptCatalogBatchesPage() {
  const { deptId, programType, program, semester } = useParams<{
    deptId: string; programType: string; program: string; semester: string
  }>()
  const navigate = useNavigate()
  const toast    = useToast()
  const prog     = decodeURIComponent(program!)
  const base     = `/departments/${deptId}/academics/courses`

  const { data: batches, reload } = useDepartmentSectionAsync(
    () => deptBatchService.getAll(deptId!, programType, prog)
  )

  const options = batchOptions(programType!)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedName, setSelectedName] = useState(options[0] ?? '')
  const deleteDialog = useConfirmDialog()

  async function handleSave() {
    if (!selectedName) { toast.error('Select a batch'); return }
    if (batches.some(b => b.name === selectedName)) {
      toast.error('Batch already exists'); return
    }
    const [startStr] = selectedName.split('-')
    const startYear  = Number(startStr)
    const duration   = programType?.toUpperCase() === 'PG' ? 2 : 4
    try {
      await deptBatchService.create({
        deptId:      deptId!,
        programType: programType!,
        program:     prog,
        name:        selectedName,
        startYear,
        endYear: startYear + duration,
      })
      toast.success('Batch added')
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add batch')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await deptBatchService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const columns: Column<DeptBatch>[] = [
    {
      key: 'name', header: 'Batch',
      render: r => <span className="font-semibold text-sm text-slate-800">{r.name}</span>,
    },
    {
      key: 'startYear', header: 'Start',
      render: r => <span className="text-sm text-slate-500">{r.startYear ?? '—'}</span>,
    },
    {
      key: 'endYear', header: 'End',
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
          <button onClick={() => navigate(`${base}/${programType}/${program}/${semester}/${encodeURIComponent(r.name)}`)}
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
        <button onClick={() => navigate(base)} className="text-slate-500 hover:text-brand-600">Courses</button>
        <ChevronRight size={13} className="text-slate-300" />
        <button onClick={() => navigate(`${base}/${programType}`)} className="text-slate-500 hover:text-brand-600">{programType}</button>
        <ChevronRight size={13} className="text-slate-300" />
        <button onClick={() => navigate(`${base}/${programType}/${program}`)} className="text-slate-500 hover:text-brand-600">{prog}</button>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-slate-700 font-medium">Semester {semester}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">Semester {semester} — Batches</h3>
          <p className="text-sm text-slate-500">
            {programType} · {prog} · {batches.length} batch{batches.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <button onClick={() => { setSelectedName(options[0] ?? ''); setModalOpen(true) }}
          className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Batch
        </button>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={batches}
          keyExtractor={r => r.id}
          total={batches.length}
          onRowClick={r => navigate(`${base}/${programType}/${program}/${semester}/${encodeURIComponent(r.name)}`)}
          emptyTitle="No batches yet"
          emptyDescription="Add a batch using the button above."
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Batch">
        <div className="space-y-4">
          <FormField label="Batch" required hint={`${programType?.toUpperCase() === 'PG' ? '2-year' : '4-year'} batch`}>
            <select className="input-field" value={selectedName}
              onChange={e => setSelectedName(e.target.value)}>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </FormField>
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
