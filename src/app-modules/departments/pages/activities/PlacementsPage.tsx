import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { placementOverviewService } from '@/app-modules/departments/api/deptActivitiesApi'
import type { PlacementOverview } from '@/shared/types/models'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { usePagination } from '@/shared/hooks/usePagination'

const DEFAULT_TITLE = 'Students Placed in Various IT Companies'

const emptyForm: Omit<PlacementOverview, 'id' | 'deptId'> = {
  title:            DEFAULT_TITLE,
  academicYear:     '',
  companiesVisited: 0,
  studentsInCampus: 0,
  studentsOffCampus: 0,
  highestPackage:   '',
}

export default function DeptPlacementsPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const toast      = useToast()

  const { data, reload } = useDepartmentSectionAsync(() => placementOverviewService.getAll(deptId!))
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState<PlacementOverview | null>(null)
  const [form, setForm]           = useState<Omit<PlacementOverview, 'id' | 'deptId'>>(emptyForm)
  const deleteDialog              = useConfirmDialog()
  const { page, setPage, limit, data: paginated } = usePagination(data)

  const set = <K extends keyof typeof emptyForm>(k: K, v: typeof emptyForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.academicYear.trim()) { toast.error('Academic year is required'); return }
    if (!form.highestPackage.trim()) { toast.error('Highest package is required'); return }
    try {
      if (editItem) {
        await placementOverviewService.update(editItem.id, form)
        toast.success('Record updated')
      } else {
        await placementOverviewService.create({ ...form, deptId: deptId! })
        toast.success('Record added')
      }
      reload(); setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await placementOverviewService.delete(deleteDialog.targetId)
      reload(); deleteDialog.close(); toast.success('Deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  function openAdd() {
    setEditItem(null); setForm(emptyForm); setModalOpen(true)
  }
  function openEdit(item: PlacementOverview) {
    setEditItem(item)
    setForm({
      title:             item.title,
      academicYear:      item.academicYear,
      companiesVisited:  item.companiesVisited,
      studentsInCampus:  item.studentsInCampus,
      studentsOffCampus: item.studentsOffCampus,
      highestPackage:    item.highestPackage,
    })
    setModalOpen(true)
  }

  const columns: Column<PlacementOverview>[] = [
    {
      key: 'academicYear', header: 'Academic Year',
      render: r => <span className="font-semibold text-sm text-slate-800">{r.academicYear}</span>,
    },
    {
      key: 'companiesVisited', header: 'Companies Visited',
      render: r => <span className="text-sm font-medium text-slate-700">{r.companiesVisited}</span>,
    },
    {
      key: 'studentsInCampus', header: 'In-Campus',
      render: r => (
        <span className="text-sm font-semibold text-emerald-600">{r.studentsInCampus}</span>
      ),
    },
    {
      key: 'studentsOffCampus', header: 'Off-Campus',
      render: r => (
        <span className="text-sm font-medium text-slate-700">{r.studentsOffCampus}</span>
      ),
    },
    {
      key: 'highestPackage', header: 'Highest Package',
      render: r => (
        <span className="text-sm font-bold text-brand-700">{r.highestPackage}</span>
      ),
    },
    {
      key: 'actions', header: '', className: 'w-16',
      render: r => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <Edit2 size={14} />
          </button>
          <button onClick={() => deleteDialog.open(r.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
          <h3 className="text-base font-display font-bold text-slate-800">Placements</h3>
          <p className="text-sm text-slate-500">{data.length} record{data.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add Placement Record
        </button>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={r => r.id}
          total={data.length}
          page={page}
          limit={limit}
          onPageChange={setPage}
          emptyTitle="No placement records yet"
          emptyDescription="Add a record using the button above."
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Placement Record' : 'Add Placement Record'} size="lg">
        <div className="space-y-4">
          <FormField label="Title">
            <input className="input-field" value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Students Placed in Various IT Companies" />
          </FormField>

          <FormField label="Academic Year" required>
            <input className="input-field" value={form.academicYear}
              onChange={e => set('academicYear', e.target.value)}
              placeholder="e.g. 2025-26" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Number of Companies Visited" required>
              <input type="number" className="input-field" min={0} value={form.companiesVisited}
                onChange={e => set('companiesVisited', Number(e.target.value))} />
            </FormField>

            <FormField label="Highest Package Offered" required>
              <input className="input-field" value={form.highestPackage}
                onChange={e => set('highestPackage', e.target.value)}
                placeholder="e.g. 9 LPA" />
            </FormField>

            <FormField label="Students Placed (In-campus)" required>
              <input type="number" className="input-field" min={0} value={form.studentsInCampus}
                onChange={e => set('studentsInCampus', Number(e.target.value))} />
            </FormField>

            <FormField label="Students Placed (Off-campus)" required>
              <input type="number" className="input-field" min={0} value={form.studentsOffCampus}
                onChange={e => set('studentsOffCampus', Number(e.target.value))} />
            </FormField>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            {editItem ? 'Save Changes' : 'Save'}
          </button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog open={deleteDialog.isOpen} onClose={deleteDialog.close}
        onConfirm={handleDelete} title="Delete Record"
        message="This placement record will be permanently deleted."
        confirmLabel="Delete" />
    </div>
  )
}
