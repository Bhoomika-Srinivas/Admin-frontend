import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Users, BookOpen } from 'lucide-react'
import { departmentService } from '@/app-modules/departments/api/departmentsApi'
import type { Department } from '@/shared/types/models'
import { DepartmentSchema } from '@/app-modules/departments/types'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { isSuperAdmin, canManageDepartment } from '@/shared/utils/permissions'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import Badge, { statusVariant } from '@/shared/components/common/Badge'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useDepartments } from '@/app-modules/departments/hooks/useDepartments'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useFormErrors } from '@/shared/hooks/useFormErrors'

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const PROGRAM_TYPE_OPTIONS = ['UG', 'PG', 'Research']

const emptyForm: Partial<Department> = {
  name: '', shortName: '', hod: '', established: new Date().getFullYear(),
  totalFaculty: 0, totalStudents: 0, status: 'active', description: '', programTypes: []
}

export default function DepartmentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const superAdmin = isSuperAdmin(user)

  const { departments: allDepartments, loading, error, reload } = useDepartments()
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Department | null>(null)
  const [form, setForm] = useState<Partial<Department>>(emptyForm)
  const { errors, setErrors, validateField, clearErrors } = useFormErrors(DepartmentSchema)

  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const deleteDialog = useConfirmDialog()

  const userDept = user.department?.toLowerCase()
  const sourceData = superAdmin
    ? allDepartments
    : allDepartments.filter(d =>
        d.shortName.toLowerCase() === userDept ||
        d.id.toLowerCase() === userDept
      )

  // dept_admin always goes straight to their workspace
  useEffect(() => {
    if (!superAdmin && !loading && sourceData.length === 1) {
      navigate(`/departments/${sourceData[0].id}`, { replace: true })
    }
  }, [superAdmin, loading, sourceData, navigate])

  const filtered = useMemo(() => sourceData.filter(d => {
    const q = debouncedSearch.toLowerCase()
    return (
      (!q || d.name.toLowerCase().includes(q) || d.shortName.toLowerCase().includes(q) || d.hod.toLowerCase().includes(q)) &&
      (!statusFilter || d.status === statusFilter)
    )
  }), [debouncedSearch, statusFilter, sourceData])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  async function handleSave() {
    const parsed = DepartmentSchema.safeParse({
      ...form,
      established:   form.established   ?? 0,
      totalFaculty:  form.totalFaculty  ?? 0,
      totalStudents: form.totalStudents ?? 0,
    })
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearErrors()
    try {
      if (editItem) {
        await departmentService.update(editItem.id, form)
        toast.success('Department updated')
      } else {
        await departmentService.create(form)
        toast.success('Department created')
      }
      reload()
      setModalOpen(false)
    } catch {
      toast.error('Failed to save department')
    }
  }

  async function handleDelete() {
    if (!deleteDialog.targetId) return
    try {
      await departmentService.delete(deleteDialog.targetId)
      reload()
      deleteDialog.close()
      toast.success('Department deleted')
    } catch {
      toast.error('Failed to delete department')
    }
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); clearErrors(); setModalOpen(true) }
  const openEdit = (item: Department) => { setEditItem(item); setForm(item); clearErrors(); setModalOpen(true) }

  const columns: Column<Department>[] = [
    {
      key: 'name', header: 'Department',
      render: row => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 text-brand-700 font-bold text-xs font-display">
            {row.shortName}
          </span>
          <div>
            <p className="font-medium text-slate-800 text-sm">{row.name}</p>
            <p className="text-xs text-slate-400">Est. {row.established}</p>
          </div>
        </div>
      )
    },
    { key: 'hod', header: 'Head of Dept', render: row => <span className="text-sm">{row.hod}</span> },
    {
      key: 'totalFaculty', header: 'Faculty',
      render: row => (
        <div className="flex items-center gap-1.5 text-sm">
          <BookOpen size={13} className="text-slate-400" />
          <span>{row.totalFaculty}</span>
        </div>
      )
    },
    {
      key: 'totalStudents', header: 'Students',
      render: row => (
        <div className="flex items-center gap-1.5 text-sm">
          <Users size={13} className="text-slate-400" />
          <span>{row.totalStudents}</span>
        </div>
      )
    },
    { key: 'status', header: 'Status', render: row => <Badge variant={statusVariant(row.status)}>{row.status}</Badge> },
    {
      key: 'actions', header: '', className: 'w-20',
      render: row => {
        const canEdit   = canManageDepartment(user, row.shortName)
        const canDelete = superAdmin
        return (
          <div className="flex items-center gap-1">
            {canEdit && (
              <button onClick={e => { e.stopPropagation(); openEdit(row) }} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
                <Edit2 size={14} />
              </button>
            )}
            {canDelete && (
              <button onClick={e => { e.stopPropagation(); deleteDialog.open(row.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )
      }
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Departments</h2>
          <p className="text-sm text-slate-500">
            {filtered.length} {superAdmin ? 'departments' : 'department'}
          </p>
        </div>
        {superAdmin && (
          <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Department</button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Departments', value: allDepartments.length,                                          color: 'bg-blue-50 text-blue-700' },
          { label: 'Active',            value: allDepartments.filter(d => d.status === 'active').length,       color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Total Faculty',     value: allDepartments.reduce((s, d) => s + d.totalFaculty, 0),         color: 'bg-purple-50 text-purple-700' },
          { label: 'Total Students',    value: allDepartments.reduce((s, d) => s + d.totalStudents, 0),        color: 'bg-amber-50 text-amber-700' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-75 mb-1">{s.label}</p>
            <p className="text-2xl font-display font-bold">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search departments..." className="flex-1" />
          <SelectFilter value={statusFilter} onChange={v => { setStatusFilter(v); resetPage() }} options={statusOptions} placeholder="All Status" className="sm:w-36" />
        </div>
        {error && <p className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</p>}
        <DataTable
          columns={columns} data={paginated} loading={loading} keyExtractor={r => r.id}
          total={filtered.length} page={page} limit={limit} onPageChange={setPage}
          onRowClick={row => navigate(`/departments/${row.id}`)}
          emptyTitle="No departments found"
        />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); clearErrors() }} title={editItem ? 'Edit Department' : 'Add Department'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department Name" required error={errors.name?.[0]}>
              <input className="input-field" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onBlur={e => validateField('name', e.target.value)} />
            </FormField>
            <FormField label="Short Name" required error={errors.shortName?.[0]}>
              <input className="input-field" value={form.shortName ?? ''} onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))} placeholder="e.g. CSE" onBlur={e => validateField('shortName', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Head of Department" required error={errors.hod?.[0]}>
            <input className="input-field" value={form.hod ?? ''} onChange={e => setForm(f => ({ ...f, hod: e.target.value }))} onBlur={e => validateField('hod', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Established" error={errors.established?.[0]}>
              <input type="number" className="input-field" value={form.established ?? ''} onChange={e => setForm(f => ({ ...f, established: Number(e.target.value) }))} onBlur={e => validateField('established', Number(e.target.value))} />
            </FormField>
            <FormField label="Total Faculty" error={errors.totalFaculty?.[0]}>
              <input type="number" className="input-field" value={form.totalFaculty ?? ''} onChange={e => setForm(f => ({ ...f, totalFaculty: Number(e.target.value) }))} onBlur={e => validateField('totalFaculty', Number(e.target.value))} />
            </FormField>
            <FormField label="Total Students" error={errors.totalStudents?.[0]}>
              <input type="number" className="input-field" value={form.totalStudents ?? ''} onChange={e => setForm(f => ({ ...f, totalStudents: Number(e.target.value) }))} onBlur={e => validateField('totalStudents', Number(e.target.value))} />
            </FormField>
          </div>
          <FormField label="Status" error={errors.status?.[0]}>
            <select className="input-field" value={form.status ?? ''} onChange={e => setForm(f => ({ ...f, status: e.target.value as Department['status'] }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
          <FormField label="Description" error={errors.description?.[0]}>
            <textarea className="input-field h-24 resize-none" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} onBlur={e => validateField('description', e.target.value)} />
          </FormField>
          <FormField label="Program Types">
            <div className="flex items-center gap-4">
              {PROGRAM_TYPE_OPTIONS.map(pt => (
                <label key={pt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={(form.programTypes ?? []).includes(pt)}
                    onChange={e => setForm(f => ({
                      ...f,
                      programTypes: e.target.checked
                        ? [...(f.programTypes ?? []), pt]
                        : (f.programTypes ?? []).filter(p => p !== pt),
                    }))}
                  />
                  <span className="text-sm text-slate-700">{pt}</span>
                </label>
              ))}
            </div>
          </FormField>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Add Department'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete Department" message="Deleting a department will also affect associated faculty and student records."
        confirmLabel="Delete"
      />
    </div>
  )
}
