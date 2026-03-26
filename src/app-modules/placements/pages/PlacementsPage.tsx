import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react'
import { placementService } from '@/app-modules/placements/api/placementsApi'
import type { Placement } from '@/shared/types/models'
import { PlacementSchema } from '@/app-modules/placements/types'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { usePlacements } from '@/app-modules/placements/hooks/usePlacements'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useFormErrors } from '@/shared/hooks/useFormErrors'

const yearOptions = ['2023-24', '2022-23', '2021-22', '2020-21'].map(y => ({ value: y, label: y }))

const emptyForm: Partial<Placement> = {
  company: '', year: '2023-24', package: '', studentsPlaced: 0, department: '', roles: []
}

export default function PlacementsPage() {
  const { user } = useAuth()
  const toast = useToast()

  const { placements, loading, error, reload } = usePlacements()
  const [yearFilter, setYearFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Placement | null>(null)
  const [form, setForm] = useState<Partial<Placement>>(emptyForm)
  const { errors, setErrors, validateField, clearErrors } = useFormErrors(PlacementSchema)

  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const deleteDialog = useConfirmDialog()

  const filtered = useMemo(() => placements.filter(p => {
    const q = debouncedSearch.toLowerCase()
    return (
      (!q || p.company.toLowerCase().includes(q) || p.department.toLowerCase().includes(q)) &&
      (!yearFilter || p.year === yearFilter)
    )
  }), [placements, debouncedSearch, yearFilter])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)
  const totalPlaced = filtered.reduce((s, p) => s + p.studentsPlaced, 0)

  function handleSave() {
    const parsed = PlacementSchema.safeParse({
      ...form,
      studentsPlaced: form.studentsPlaced ?? 0,
      roles: form.roles ?? [],
    })
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearErrors()
    if (editItem) {
      placementService.update(editItem.id, form, user)
      toast.success('Placement updated')
    } else {
      placementService.create(form as Omit<Placement, 'id' | 'createdAt'>, user)
      toast.success('Placement created')
    }
    reload()
    setModalOpen(false)
  }

  function handleDelete() {
    if (!deleteDialog.targetId) return
    placementService.delete(deleteDialog.targetId, user)
    reload()
    deleteDialog.close()
    toast.success('Record deleted')
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); clearErrors(); setModalOpen(true) }
  const openEdit = (item: Placement) => { setEditItem(item); setForm(item); clearErrors(); setModalOpen(true) }

  const columns: Column<Placement>[] = [
    {
      key: 'company', header: 'Company',
      render: row => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
            {row.company.slice(0, 2).toUpperCase()}
          </div>
          <p className="font-medium text-slate-800">{row.company}</p>
        </div>
      )
    },
    { key: 'year',    header: 'Year',    render: row => <span className="text-sm font-medium">{row.year}</span> },
    { key: 'package', header: 'Package', render: row => <span className="text-sm font-semibold text-emerald-700">{row.package}</span> },
    {
      key: 'studentsPlaced', header: 'Students Placed',
      render: row => (
        <div className="flex items-center gap-1.5">
          <TrendingUp size={13} className="text-emerald-500" />
          <span className="font-semibold text-slate-800">{row.studentsPlaced}</span>
        </div>
      )
    },
    { key: 'department', header: 'Department', render: row => <span className="text-xs text-slate-500">{row.department}</span> },
    {
      key: 'roles', header: 'Roles',
      render: row => (
        <div className="flex flex-wrap gap-1">
          {row.roles.slice(0, 2).map(r => <span key={r} className="badge badge-blue text-xs">{r}</span>)}
          {row.roles.length > 2 && <span className="badge badge-gray text-xs">+{row.roles.length - 2}</span>}
        </div>
      )
    },
    {
      key: 'actions', header: '', className: 'w-20',
      render: row => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
            <Edit2 size={14} />
          </button>
          <button onClick={() => deleteDialog.open(row.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={14} />
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Placements</h2>
          <p className="text-sm text-slate-500">{filtered.length} companies · {totalPlaced} students placed</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Placement</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search companies..." className="flex-1" />
          <SelectFilter value={yearFilter} onChange={v => { setYearFilter(v); resetPage() }} options={yearOptions} placeholder="All Years" className="sm:w-36" />
        </div>
        {error && <p className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</p>}
        <DataTable
          columns={columns} data={paginated} loading={loading} keyExtractor={r => r.id}
          total={filtered.length} page={page} limit={limit} onPageChange={setPage}
          emptyTitle="No placement records found"
        />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); clearErrors() }} title={editItem ? 'Edit Placement' : 'Add Placement'} size="md">
        <div className="space-y-4">
          <FormField label="Company Name" required error={errors.company?.[0]}>
            <input className="input-field" value={form.company ?? ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} onBlur={e => validateField('company', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Academic Year" error={errors.year?.[0]}>
              <select className="input-field" value={form.year ?? ''} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                {yearOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Package (LPA)" error={errors.package?.[0]}>
              <input className="input-field" value={form.package ?? ''} onChange={e => setForm(f => ({ ...f, package: e.target.value }))} placeholder="e.g. 4.5 LPA" onBlur={e => validateField('package', e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Students Placed" error={errors.studentsPlaced?.[0]}>
              <input type="number" className="input-field" value={form.studentsPlaced ?? ''} onChange={e => setForm(f => ({ ...f, studentsPlaced: Number(e.target.value) }))} onBlur={e => validateField('studentsPlaced', Number(e.target.value))} />
            </FormField>
            <FormField label="Department" error={errors.department?.[0]}>
              <input className="input-field" value={form.department ?? ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="CSE, ECE, ALL" onBlur={e => validateField('department', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Job Roles" hint="Comma separated" error={errors.roles?.[0]}>
            <input className="input-field" value={Array.isArray(form.roles) ? form.roles.join(', ') : ''} onChange={e => setForm(f => ({ ...f, roles: e.target.value.split(',').map(r => r.trim()) }))} onBlur={e => validateField('roles', e.target.value.split(',').map(r => r.trim()))} />
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add Record'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Record" message="Are you sure you want to delete this placement record?"
        confirmLabel="Delete"
      />
    </div>
  )
}
