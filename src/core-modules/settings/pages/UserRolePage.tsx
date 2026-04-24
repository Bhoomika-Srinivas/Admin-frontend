import { useState, useMemo } from 'react'
import { Plus, Edit2, UserX, KeyRound, Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
import clsx from 'clsx'
import { userService } from '@/core-modules/users/api/usersApi'
import type { User, UserRole } from '@/shared/types/models'
import { UserFormSchema, UserEditSchema } from '@/core-modules/users/types'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { useUsers } from '@/core-modules/users/hooks/useUsers'
import { useColleges } from '@/core-modules/settings/hooks/useColleges'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import Badge, { statusVariant } from '@/shared/components/common/Badge'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import FormField from '@/shared/components/forms/FormField'
import ConfirmDialog from '@/shared/components/common/ConfirmDialog'
import { useSearch } from '@/shared/hooks/useSearch'
import { usePagination } from '@/shared/hooks/usePagination'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { useFormErrors } from '@/shared/hooks/useFormErrors'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'super_admin',   label: 'Super Admin' },
  { value: 'college_admin', label: 'College Admin' },
  { value: 'dept_admin',    label: 'Dept Admin' },
]

const ROLE_BADGE: Record<string, string> = {
  super_admin:   'bg-purple-100 text-purple-700',
  college_admin: 'bg-blue-100 text-blue-700',
  dept_admin:    'bg-sky-100 text-sky-700',
}

const ROLE_CARDS = [
  {
    role:        'super_admin' as const,
    label:       'Super Admin',
    badge:       'bg-purple-100 text-purple-700',
    iconBg:      'bg-purple-50',
    iconColor:   'text-purple-600',
    Icon:        ShieldCheck,
    description: 'Full system access across all colleges',
    capabilities: [
      'Manage all users and colleges',
      'Access all settings and audit logs',
      'Override any content or approval',
      'Manage feature flags and platform settings',
    ],
  },
  {
    role:        'college_admin' as const,
    label:       'College Admin',
    badge:       'bg-blue-100 text-blue-700',
    iconBg:      'bg-blue-50',
    iconColor:   'text-blue-600',
    Icon:        Shield,
    description: 'Manages a single college tenant',
    capabilities: [
      'Manage users within their college',
      'Approve events and content',
      'View reports and audit logs',
      'Manage college-level settings',
    ],
  },
  {
    role:        'dept_admin' as const,
    label:       'Dept Admin',
    badge:       'bg-sky-100 text-sky-700',
    iconBg:      'bg-sky-50',
    iconColor:   'text-sky-600',
    Icon:        ShieldAlert,
    description: 'Scoped to their assigned department',
    capabilities: [
      'Create and edit department content',
      'Manage department events',
      'Cannot manage users or settings',
      'View own department analytics',
    ],
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'users' | 'roles'
type UserForm = Partial<User> & { password?: string }

const emptyForm: UserForm = {
  name: '', email: '', role: 'dept_admin', tenantId: '', department: '', status: 'active', password: '',
}

// ─── Page (Tab Container) ─────────────────────────────────────────────────────

export default function UserRolePage() {
  const [tab, setTab] = useState<Tab>('users')

  return (
    <div className="space-y-5">
      <div className="flex gap-1 border-b border-slate-200">
        {(['users', 'roles'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {t === 'users' ? 'Users' : 'Roles'}
          </button>
        ))}
      </div>

      {tab === 'users' ? <UsersTab /> : <RolesTab />}
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  useAuth()
  const toast = useToast()
  const { users, loading, error, reload } = useUsers()
  const { colleges } = useColleges()

  const [roleFilter, setRoleFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen]       = useState(false)
  const [editItem, setEditItem]         = useState<User | null>(null)
  const [form, setForm]                 = useState<UserForm>(emptyForm)
  const [resettingId, setResettingId]   = useState<string | null>(null)

  const { errors, setErrors, validateField, clearErrors } = useFormErrors(UserFormSchema)
  const { searchTerm, setSearchTerm, debouncedSearch }   = useSearch()
  const disableDialog                                     = useConfirmDialog()

  const collegeMap = useMemo(
    () => Object.fromEntries(colleges.map(c => [c.id, c.name])),
    [colleges],
  )

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    return users.filter(u =>
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!roleFilter   || u.role   === roleFilter) &&
      (!statusFilter || u.status === statusFilter),
    )
  }, [users, debouncedSearch, roleFilter, statusFilter])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  const stats = useMemo(() => ({
    total:         users.length,
    super_admin:   users.filter(u => u.role === 'super_admin').length,
    college_admin: users.filter(u => u.role === 'college_admin').length,
    dept_admin:    users.filter(u => u.role === 'dept_admin').length,
  }), [users])

  async function handleSave() {
    const schema = editItem ? UserEditSchema : UserFormSchema
    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearErrors()
    try {
      if (editItem) {
        await userService.update(editItem.id, form)
        toast.success('User updated successfully')
      } else {
        await userService.create(form as Omit<User, 'id' | 'createdAt'>)
        toast.success('User invited successfully')
      }
      await reload()
      setModalOpen(false)
    } catch {
      toast.error('Operation failed. Please try again.')
    }
  }

  async function handleDisable() {
    if (!disableDialog.targetId) return
    try {
      await userService.delete(disableDialog.targetId)
      await reload()
      disableDialog.close()
      toast.success('User disabled')
    } catch {
      toast.error('Failed to disable user.')
      disableDialog.close()
    }
  }

  async function handleResetPassword(userId: string, email: string) {
    setResettingId(userId)
    try {
      await userService.resetPassword(userId)
      toast.success(`Password reset email sent to ${email}`)
    } catch {
      toast.error('Failed to send password reset email.')
    } finally {
      setResettingId(null)
    }
  }

  const openAdd  = () => { setEditItem(null); setForm(emptyForm); clearErrors(); setModalOpen(true) }
  const openEdit = (item: User) => { setEditItem(item); setForm({ ...item, password: '' }); clearErrors(); setModalOpen(true) }

  const showCollege    = form.role === 'college_admin' || form.role === 'dept_admin'
  const showDepartment = form.role === 'dept_admin'

  const columns: Column<User>[] = [
    {
      key: 'name', header: 'Name',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-800 text-sm">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', header: 'Role',
      render: row => (
        <span className={clsx(
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
          ROLE_BADGE[row.role] ?? 'bg-slate-100 text-slate-600',
        )}>
          <Shield size={10} />
          {ROLES.find(r => r.value === row.role)?.label ?? row.role.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'tenantId', header: 'College',
      render: row => (
        <span className="text-sm text-slate-600">
          {row.tenantId ? (collegeMap[row.tenantId] ?? row.tenantId) : '—'}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: row => <Badge variant={statusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      key: 'actions', header: '', className: 'w-28',
      render: row => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            title="Edit user"
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => disableDialog.open(row.id)}
            title="Disable user"
            disabled={row.status === 'inactive'}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <UserX size={14} />
          </button>
          <button
            onClick={() => handleResetPassword(row.id, row.email)}
            title="Reset password"
            disabled={resettingId === row.id}
            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <KeyRound size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500">{filtered.length} users • Manage access across roles</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users',    count: stats.total },
          { label: 'Super Admins',   count: stats.super_admin },
          { label: 'College Admins', count: stats.college_admin },
          { label: 'Dept Admins',    count: stats.dept_admin },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-2xl font-display font-bold text-slate-800">{s.count}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <SearchBar
            value={searchTerm}
            onChange={v => { setSearchTerm(v); resetPage() }}
            placeholder="Search users..."
            className="max-w-xs"
          />
          <div className="flex items-center gap-3 shrink-0">
            <SelectFilter
              value={roleFilter}
              onChange={v => { setRoleFilter(v); resetPage() }}
              options={ROLES}
              placeholder="All Roles"
              className="w-36"
            />
            <SelectFilter
              value={statusFilter}
              onChange={v => { setStatusFilter(v); resetPage() }}
              options={[
                { value: 'active',   label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              placeholder="All Status"
              className="w-36"
            />
          </div>
        </div>

        {error && (
          <p className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">{error}</p>
        )}

        <DataTable
          columns={columns}
          data={paginated}
          loading={loading}
          keyExtractor={r => r.id}
          total={filtered.length}
          page={page}
          limit={limit}
          onPageChange={setPage}
          emptyTitle="No users found"
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); clearErrors() }}
        title={editItem ? 'Edit User' : 'Add User'}
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Full Name" required error={errors.name?.[0]}>
            <input
              className="input-field"
              value={form.name ?? ''}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onBlur={e => validateField('name', e.target.value)}
            />
          </FormField>

          <FormField label="Email Address" required error={errors.email?.[0]}>
            <input
              type="email"
              className={clsx('input-field', editItem && 'opacity-60 cursor-not-allowed')}
              value={form.email ?? ''}
              disabled={!!editItem}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              onBlur={e => !editItem && validateField('email', e.target.value)}
            />
          </FormField>

          <div className={clsx('grid gap-4', editItem ? 'grid-cols-2' : 'grid-cols-1')}>
            <FormField label="Role" required error={errors.role?.[0]}>
              <select
                className="input-field"
                value={form.role ?? ''}
                onChange={e => setForm(f => ({
                  ...f,
                  role: e.target.value as UserRole,
                  tenantId: '',
                  department: '',
                }))}
              >
                {ROLES.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>

            {editItem && (
              <FormField label="Status" error={errors.status?.[0]}>
                <select
                  className="input-field"
                  value={form.status ?? ''}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as User['status'] }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FormField>
            )}
          </div>

          {showCollege && (
            <FormField label="College">
              <select
                className="input-field"
                value={form.tenantId ?? ''}
                onChange={e => setForm(f => ({ ...f, tenantId: e.target.value }))}
              >
                <option value="">Select college...</option>
                {colleges.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
          )}

          {showDepartment && (
            <FormField label="Department">
              <input
                className="input-field"
                placeholder="e.g. CSE, ECE"
                value={form.department ?? ''}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              />
            </FormField>
          )}

          {!editItem && (
            <FormField label="Password" required hint="Minimum 8 characters" error={errors.password?.[0]}>
              <input
                type="password"
                className="input-field"
                value={form.password ?? ''}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onBlur={e => validateField('password', e.target.value)}
              />
            </FormField>
          )}
        </div>

        <ModalFooter>
          <button onClick={() => { setModalOpen(false); clearErrors() }} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            {editItem ? 'Save Changes' : 'Create User'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Disable Confirmation */}
      <ConfirmDialog
        open={disableDialog.isOpen}
        onClose={disableDialog.close}
        onConfirm={handleDisable}
        title="Disable User"
        message="This will prevent the user from logging in. You can re-enable them later by editing their status."
        confirmLabel="Disable"
      />
    </div>
  )
}

// ─── Roles Tab ────────────────────────────────────────────────────────────────

function RolesTab() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">Roles</h2>
        <p className="text-sm text-slate-500">3 roles • Permissions are enforced at the backend</p>
      </div>

      <div className="grid gap-4">
        {ROLE_CARDS.map(({ role, label, badge, iconBg, iconColor, Icon, description, capabilities }) => (
          <div key={role} className="card">
            <div className="px-5 py-4 flex items-start gap-4">
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
                <Icon size={18} className={iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-800 text-sm">{label}</p>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', badge)}>
                    {role}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-3">{description}</p>
                <ul className="space-y-1.5">
                  {capabilities.map(cap => (
                    <li key={cap} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-800">
          <span className="font-medium">Note:</span>{' '}
          Role permissions are enforced at the backend level. Contact a developer to modify role capabilities.
        </p>
      </div>
    </div>
  )
}
