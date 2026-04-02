import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronRight, LayoutGrid } from 'lucide-react'
import { deptSectionService } from '@/app-modules/departments/api/deptAcademicsApi'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import type { DeptSection } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'

export default function DeptTTSectionsPage() {
  const { deptId, programType, program, semester, batch } = useParams<{
    deptId: string; programType: string; program: string; semester: string; batch: string
  }>()
  const sem       = Number(semester)
  const prog      = decodeURIComponent(program!)
  const batchName = decodeURIComponent(batch!)
  const navigate  = useNavigate()
  const toast     = useToast()
  const base      = `/departments/${deptId}/academics/timetable`
  const semBase   = `${base}/${programType}/${program}/${semester}`

  const { data: sections, reload } = useDepartmentSectionAsync(
    () => deptSectionService.getAll(deptId!, prog, sem, batchName)
  )

  const [modalOpen, setModalOpen]     = useState(false)
  const [sectionName, setSectionName] = useState('')
  const deleteDialog                  = useConfirmDialog()

  async function handleSave() {
    if (!sectionName.trim()) { toast.error('Section name is required'); return }
    if (sections.some(s => s.name === sectionName.trim())) {
      toast.error('Section already exists'); return
    }
    try {
      await deptSectionService.create({
        deptId:    deptId!,
        programId: prog,
        batchName,
        semester:  sem,
        name:      sectionName.trim(),
      })
      toast.success('Section added')
      reload(); setSectionName(''); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add section')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await deptSectionService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Section deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete section')
    }
  }

  const columns: Column<DeptSection>[] = [
    {
      key: 'name', header: 'Section',
      render: r => (
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
            {r.name}
          </span>
          <span className="font-semibold text-sm text-slate-800">Section {r.name}</span>
        </div>
      ),
    },
    {
      key: 'actions', header: '', className: 'w-20',
      render: r => (
        <div className="flex gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); deleteDialog.open(r.id) }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={14} />
          </button>
          <button onClick={() => navigate(`${semBase}/${encodeURIComponent(batchName)}/${r.name}`)}
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
        <button onClick={() => navigate(base)} className="text-slate-500 hover:text-brand-600">Timetable</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(`${base}/${programType}`)} className="text-slate-500 hover:text-brand-600">{programType}</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(`${base}/${programType}/${program}`)} className="text-slate-500 hover:text-brand-600">{prog}</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(semBase)} className="text-slate-500 hover:text-brand-600">Semester {semester}</button>
        <span className="text-slate-300">›</span>
        <span className="text-slate-700 font-medium">{batchName}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-800">
            Sections — {prog} · Sem {semester} · {batchName}
          </h3>
          <p className="text-sm text-slate-500">
            {sections.length} section{sections.length !== 1 ? 's' : ''} · Click a section to manage its timetable
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center">
          <LayoutGrid size={28} className="text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No sections yet</p>
          <p className="text-xs text-slate-400 mt-1">Add sections (A, B, C, D) using the button above.</p>
        </div>
      ) : (
        <div className="card">
          <DataTable columns={columns} data={sections} keyExtractor={r => r.id}
            total={sections.length}
            onRowClick={r => navigate(`${semBase}/${encodeURIComponent(batchName)}/${r.name}`)}
            emptyTitle="No sections yet" />
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Section">
        <div className="space-y-4">
          <FormField label="Section Name" required hint="e.g. A, B, C, D">
            <input className="input-field uppercase" value={sectionName}
              onChange={e => setSectionName(e.target.value.toUpperCase())} placeholder="A" maxLength={3} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Add Section</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Section"
        message="This section and all its timetable slots will be permanently deleted."
        confirmLabel="Delete" />
    </div>
  )
}
