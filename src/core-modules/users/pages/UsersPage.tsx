import { useState, useMemo, useEffect } from 'react'
import { Plus, Edit2, Shield, UserCheck, UserX } from 'lucide-react'
import { userService } from '@/core-modules/users/api/usersApi'
import type { User, UserStatus } from '@/shared/types/models'
import type { Role } from '@/core-modules/settings/types'
import { UserFormSchema, UserEditSchema } from '@/core-modules/users/types'
import { rolesService } from '@/core-modules/settings'
import { departmentService } from '@/app-modules/departments/api/departmentsApi'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
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

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  active:      'bg-green-100 text-green-700',
  deactivated: 'bg-red-100 text-red-700',
  suspended:   'bg-orange-100 text-orange-700',
  invited:     'bg-slate-100 text-slate-600',
  inactive:    'bg-slate-100 text-slate-500',
}

const STATUS_LABEL: Record<string, string> = {
  active:      'Active',
  deactivated: 'Deactivated',
  suspended:   'Suspended',
  invited:     'Invited',
  inactive:    'Inactive',
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-600',
    )}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

// ── Role badge ────────────────────────────────────────────────────────────────

const ROLE_STYLE: Record<string, string> = {
  super_admin:   'bg-purple-100 text-purple-700',
  college_admin: 'bg-blue-100 text-blue-700',
  dept_admin:    'bg-sky-100 text-sky-700',
  admin:         'bg-sky-100 text-sky-700',
  editor:        'bg-amber-100 text-amber-700',
  viewer:        'bg-slate-100 text-slate-600',
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
      ROLE_STYLE[role] ?? 'bg-slate-100 text-slate-600',
    )}>
      <Shield size={10} />
      {role.replace(/_/g, ' ')}
    </span>
  )
}

// ── Form state ────────────────────────────────────────────────────────────────

interface InviteForm {
  name:       string
  email:      string
  phone:      string
  password:   string
  role:       string
  department: string
}

interface EditForm {
  name:       string
  role:       string
  department: string
}

const EMPTY_INVITE: InviteForm = { name: '', email: '', phone: '', password: '', role: '', department: '' }
const EMPTY_EDIT: EditForm     = { name: '', role: '', department: '' }

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { user } = useAuth()
  const toast    = useToast()

  const { users, loading, error, reload } = useUsers()

  // Dynamic dropdowns
  const [roles,       setRoles]       = useState<Role[]>([])
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    rolesService.getAll().then(setRoles).catch(() => {})
    if (user?.tenantId) {
      departmentService.getAll(user.tenantId)
        .then(depts => setDepartments(depts.map(d => ({ value: d.shortName, label: d.name }))))
        .catch(() => {})
    }
  }, [user?.tenantId])

  // Filters
  const [roleFilter,   setRoleFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { searchTerm, setSearchTerm, debouncedSearch } = useSearch()

  // Modals
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editItem,   setEditItem]   = useState<User | null>(null)
  const [editOpen,   setEditOpen]   = useState(false)
  const toggleDialog = useConfirmDialog<{ id: string; currentStatus: UserStatus }>()

  // Forms
  const [inviteForm, setInviteForm] = useState<InviteForm>(EMPTY_INVITE)
  const [editForm,   setEditForm]   = useState<EditForm>(EMPTY_EDIT)
  const { errors: inviteErrors, setErrors: setInviteErrors, clearErrors: clearInviteErrors } = useFormErrors(UserFormSchema)
  const { errors: editErrors,   setErrors: setEditErrors,   clearErrors: clearEditErrors }   = useFormErrors(UserEditSchema)

  const [saving,    setSaving]    = useState(false)
  const [toggling,  setToggling]  = useState(false)

  // Filtered + paginated
  const statusOptions = [
    { value: 'active',      label: 'Active' },
    { value: 'invited',     label: 'Invited' },
    { value: 'deactivated', label: 'Deactivated' },
    { value: 'suspended',   label: 'Suspended' },
  ]

  const roleFilterOptions = roles.map(r => ({ value: r.name, label: r.displayName }))

  const filtered = useMemo(() => users.filter(u => {
    const q = debouncedSearch.toLowerCase()
    return (
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!roleFilter   || u.role === roleFilter) &&
      (!statusFilter || u.status === statusFilter)
    )
  }), [users, debouncedSearch, roleFilter, statusFilter])

  const { page, setPage, limit, data: paginated, resetPage } = usePagination(filtered)

  // ── Invite ──────────────────────────────────────────────────────────────────

  function openInvite() {
    setInviteForm(EMPTY_INVITE)
    clearInviteErrors()
    setInviteOpen(true)
  }

  async function handleInvite() {
    const parsed = UserFormSchema.safeParse(inviteForm)
    if (!parsed.success) {
      setInviteErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearInviteErrors()
    setSaving(true)
    try {
      await userService.invite({
        name:       parsed.data.name,
        email:      parsed.data.email,
        phone:      parsed.data.phone || undefined,
        password:   parsed.data.password,
        role:       parsed.data.role,
        department: parsed.data.department || undefined,
      })
      toast.success('User invited successfully')
      setInviteOpen(false)
      reload()
    } catch {
      toast.error('Failed to invite user')
    } finally {
      setSaving(false)
    }
  }

  // ── Edit ────────────────────────────────────────────────────────────────────

  function openEdit(item: User) {
    setEditItem(item)
    setEditForm({ name: item.name, role: item.role, department: item.department ?? '' })
    clearEditErrors()
    setEditOpen(true)
  }

  async function handleEdit() {
    if (!editItem) return
    const parsed = UserEditSchema.safeParse(editForm)
    if (!parsed.success) {
      setEditErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>)
      return
    }
    clearEditErrors()
    setSaving(true)
    try {
      await userService.update(editItem.id, {
        name:       parsed.data.name,
        role:       parsed.data.role,
        department: parsed.data.department || undefined,
      })
      toast.success('User updated')
      setEditOpen(false)
      reload()
    } catch {
      toast.error('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle status ───────────────────────────────────────────────────────────

  async function handleToggleStatus() {
    if (!toggleDialog.targetId) return
    const { id, currentStatus } = toggleDialog.targetId
    const newStatus = currentStatus === 'active' ? 'deactivated' : 'active'
    setToggling(true)
    try {
      await userService.setStatus(id, newStatus)
      toast.success(newStatus === 'active' ? 'User activated' : 'User deactivated')
      toggleDialog.close()
      reload()
    } catch {
      toast.error('Failed to update user status')
    } finally {
      setToggling(false)
    }
  }

  const toggleTarget = toggleDialog.targetId
  const willActivate = toggleTarget?.currentStatus !== 'active'

  // ── Columns ─────────────────────────────────────────────────────────────────

  const columns: Column<User>[] = [
    {
      key: 'name', header: 'User',
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-800 text-sm">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
            {row.phone && <p className="text-xs text-slate-400">{row.phone}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'role', header: 'Role',
      render: row => <RoleBadge role={row.role} />,
    },
    {
      key: 'department', header: 'Department',
      render: row => <span className="text-sm text-slate-600">{row.department || '—'}</span>,
    },
    {
      key: 'createdAt', header: 'Created',
      render: row => row.createdAt
        ? <span className="text-xs text-slate-500">{format(new Date(row.createdAt), 'MMM d, yyyy')}</span>
        : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      key: 'status', header: 'Status',
      render: row => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions', header: '', className: 'w-24',
      render: row => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
            title="Edit user"
          >
            <Edit2 size={14} />
          </button>
          {row.status === 'active' ? (
            <button
              onClick={() => toggleDialog.open({ id: row.id, currentStatus: row.status })}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Deactivate user"
            >
              <UserX size={14} />
            </button>
          ) : row.status !== 'suspended' && (
            <button
              onClick={() => toggleDialog.open({ id: row.id, currentStatus: row.status })}
              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
              title="Activate user"
            >
              <UserCheck size={14} />
            </button>
          )}
        </div>
      ),
    },
  ]

  // ── Role counts for stat cards (from loaded users, grouped by role) ──────────

  const roleCounts = useMemo(() => {
    const map: Record<string, number> = {}
    users.forEach(u => { map[u.role] = (map[u.role] ?? 0) + 1 })
    return map
  }, [users])

  const displayRoles = roles.length > 0
    ? roles.map(r => ({ value: r.name, label: r.displayName }))
    : [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'dept_admin',  label: 'Dept Admin' },
        { value: 'editor',      label: 'Editor' },
        { value: 'viewer',      label: 'Viewer' },
      ]

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500">
            {users.length} user{users.length !== 1 ? 's' : ''} • {users.filter(u => u.status === 'active').length} active
          </p>
        </div>
        <button onClick={openInvite} className="btn-primary">
          <Plus size={16} />
          Invite User
        </button>
      </div>

      {/* Role stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {displayRoles.map(r => (
          <div key={r.value} className="card p-4">
            <p className="text-xs text-slate-500 mb-1">{r.label}</p>
            <p className="text-2xl font-display font-bold text-slate-800">{roleCounts[r.value] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="card">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={searchTerm}
            onChange={v => { setSearchTerm(v); resetPage() }}
            placeholder="Search users…"
            className="flex-1"
          />
          <SelectFilter
            value={roleFilter}
            onChange={v => { setRoleFilter(v); resetPage() }}
            options={roleFilterOptions}
            placeholder="All Roles"
            className="sm:w-40"
          />
          <SelectFilter
            value={statusFilter}
            onChange={v => { setStatusFilter(v); resetPage() }}
            options={statusOptions}
            placeholder="All Status"
            className="sm:w-36"
          />
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

      {/* Invite modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite User" size="md">
        <div className="space-y-4">
          <FormField label="Full Name" required error={inviteErrors.name?.[0]}>
            <input
              className="input-field"
              value={inviteForm.name}
              onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Jane Doe"
            />
          </FormField>
          <FormField label="Email Address" required error={inviteErrors.email?.[0]}>
            <input
              type="email"
              className="input-field"
              value={inviteForm.email}
              onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
              placeholder="jane@college.edu"
            />
          </FormField>
          <FormField label="Phone" error={inviteErrors.phone?.[0]}>
            <input
              type="tel"
              className="input-field"
              value={inviteForm.phone}
              onChange={e => setInviteForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
          </FormField>
          <FormField label="Password" required hint="Minimum 8 characters" error={inviteErrors.password?.[0]}>
            <input
              type="password"
              className="input-field"
              value={inviteForm.password}
              onChange={e => setInviteForm(f => ({ ...f, password: e.target.value }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role" required error={inviteErrors.role?.[0]}>
              <select
                className="input-field"
                value={inviteForm.role}
                onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
              >
                <option value="">Select role…</option>
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.displayName}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Department" error={inviteErrors.department?.[0]}>
              <select
                className="input-field"
                value={inviteForm.department}
                onChange={e => setInviteForm(f => ({ ...f, department: e.target.value }))}
              >
                <option value="">None</option>
                {departments.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setInviteOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleInvite} disabled={saving} className="btn-primary">
            {saving ? 'Inviting…' : 'Send Invite'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit User" size="md">
        <div className="space-y-4">
          <FormField label="Full Name" required error={editErrors.name?.[0]}>
            <input
              className="input-field"
              value={editForm.name}
              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role" required error={editErrors.role?.[0]}>
              <select
                className="input-field"
                value={editForm.role}
                onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
              >
                <option value="">Select role…</option>
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.displayName}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Department" error={editErrors.department?.[0]}>
              <select
                className="input-field"
                value={editForm.department}
                onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
              >
                <option value="">None</option>
                {departments.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleEdit} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Toggle confirm */}
      <ConfirmDialog
        open={toggleDialog.isOpen}
        onClose={toggleDialog.close}
        onConfirm={handleToggleStatus}
        title={willActivate ? 'Activate User' : 'Deactivate User'}
        message={
          willActivate
            ? "This will restore the user's access to the platform."
            : "This will revoke the user's access. They can be reactivated later."
        }
        confirmLabel={toggling ? 'Updating…' : willActivate ? 'Activate' : 'Deactivate'}
        variant={willActivate ? undefined : 'danger'}
      />
    </div>
  )
}
