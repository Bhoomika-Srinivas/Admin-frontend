import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Shield } from 'lucide-react'
import { userService } from '@/core-modules/users/api/usersApi'
import type { User, UserRole } from '@/shared/types/models'
import { UserFormSchema, UserEditSchema } from '@/core-modules/users/types'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import Badge, { statusVariant } from '@/shared/components/common/Badge'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { format } from 'date-fns'
import { useUsers } from '@/core-modules/users/hooks/useUsers'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useFormErrors } from '@/shared/hooks/useFormErrors'
import clsx from 'clsx'

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'dept_admin',  label: 'Dept Admin' },
  { value: 'admin',       label: 'Admin' },
  { value: 'editor',      label: 'Editor' },
  { value: 'viewer',      label: 'Viewer' },
]

const statusOptions = [
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const roleVariant: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  dept_admin:  'bg-blue-100 text-blue-700',
  admin:       'bg-sky-100 text-sky-700',
  editor:      'bg-amber-100 text-amber-700',
  viewer:      'bg-slate-100 text-slate-600',
}

type UserForm = Partial<User> & { password?: string }

const emptyForm: UserForm = {
  name: '', email: '', role: 'dept_admin', department: '', status: 'active', password: ''
}

export default function UsersPage() {
  const { user } = useAuth()
  const toast = useToast()

  const { users, loading, error, reload } = useUsers()
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<User | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const { errors, setErrors, validateField, clearErrors } = useFormErrors(UserFormSchema)

  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()
  const deleteDialog = useConfirmDialog()

  const filtered = useMemo(() => users.filter(u => {
    const q = debouncedSearch.toLowerCase()
    return (
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!roleFilter || u.role === roleFilter) &&
      (!statusFilter || u.status === statusFilter)
    )
  }), [users, debouncedSearch, roleFilter, statusFilter])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  function handleSave() {
    const schema = editItem ? UserEditSchema : UserFormSchema
    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearErrors()
    if (editItem) {
      userService.update(editItem.id, form, user)
      toast.success('User updated')
    } else {
      userService.create(form as Omit<User, 'id' | 'createdAt'>, user)
      toast.success('User created')
    }
    reload()
    setModalOpen(false)
  }

  function handleDelete() {
    if (!deleteDialog.targetId) return
    userService.delete(deleteDialog.targetId, user)
    reload()
    deleteDialog.close()
    toast.success('User deleted')
  }

  const openAdd = () => { setEditItem(null); setForm(emptyForm); clearErrors(); setModalOpen(true) }
  const openEdit = (item: User) => { setEditItem(item); setForm(item); clearErrors(); setModalOpen(true) }

  const columns: Column<User>[] = [
    {
      key: 'name', header: 'User',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-slate-800 text-sm">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role', header: 'Role',
      render: row => (
        <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', roleVariant[row.role])}>
          <Shield size={10} />
          {row.role.replace('_', ' ')}
        </span>
      )
    },
    { key: 'department', header: 'Department', render: row => <span className="text-sm">{row.department || '—'}</span> },
    {
      key: 'lastLogin', header: 'Last Login',
      render: row => row.lastLogin
        ? <span className="text-xs text-slate-500">{format(new Date(row.lastLogin), 'MMM d, yyyy HH:mm')}</span>
        : <span className="text-slate-400 text-xs">Never</span>
    },
    { key: 'status', header: 'Status', render: row => <Badge variant={statusVariant(row.status)}>{row.status}</Badge> },
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
          <h2 className="text-xl font-display font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500">{filtered.length} users registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add User</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {roleOptions.map(r => {
          const count = users.filter(u => u.role === r.value).length
          return (
            <div key={r.value} className="card p-4">
              <p className="text-xs text-slate-500 mb-1">{r.label}</p>
              <p className="text-2xl font-display font-bold text-slate-800">{count}</p>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <SearchBar value={searchTerm} onChange={v => { setSearchTerm(v); resetPage() }} placeholder="Search users..." className="flex-1" />
          <SelectFilter value={roleFilter} onChange={v => { setRoleFilter(v); resetPage() }} options={roleOptions} placeholder="All Roles" className="sm:w-36" />
          <SelectFilter value={statusFilter} onChange={v => { setStatusFilter(v); resetPage() }} options={statusOptions} placeholder="All Status" className="sm:w-36" />
        </div>
        {error && <p className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</p>}
        <DataTable
          columns={columns} data={paginated} loading={loading} keyExtractor={r => r.id}
          total={filtered.length} page={page} limit={limit} onPageChange={setPage}
          emptyTitle="No users found"
        />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); clearErrors() }} title={editItem ? 'Edit User' : 'Add User'} size="md">
        <div className="space-y-4">
          <FormField label="Full Name" required error={errors.name?.[0]}>
            <input className="input-field" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onBlur={e => validateField('name', e.target.value)} />
          </FormField>
          <FormField label="Email Address" required error={errors.email?.[0]}>
            <input type="email" className="input-field" value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onBlur={e => validateField('email', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role" required error={errors.role?.[0]}>
              <select className="input-field" value={form.role ?? ''} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
                {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <FormField label="Status" error={errors.status?.[0]}>
              <select className="input-field" value={form.status ?? ''} onChange={e => setForm(f => ({ ...f, status: e.target.value as User['status'] }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>
          <FormField label="Department">
            <input className="input-field" value={form.department ?? ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
          </FormField>
          {!editItem && (
            <FormField label="Password" required hint="Minimum 8 characters" error={errors.password?.[0]}>
              <input type="password" className="input-field" value={form.password ?? ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onBlur={e => validateField('password', e.target.value)} />
            </FormField>
          )}
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editItem ? 'Save Changes' : 'Create User'}</button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.isOpen} onClose={deleteDialog.close} onConfirm={handleDelete}
        title="Delete User" message="This will permanently delete the user account and revoke all access."
        confirmLabel="Delete"
      />
    </div>
  )
}
