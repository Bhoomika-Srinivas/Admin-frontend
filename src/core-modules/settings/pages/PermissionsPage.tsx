import clsx from 'clsx'
import { Lock } from 'lucide-react'
import { useAllPermissions } from '../hooks/useRoles'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'

const MODULE_LABELS: Record<string, string> = {
  admissions: 'Admissions',
  academics:  'Academics',
  faculty:    'Faculty',
  events:     'Events',
  alumni:     'Alumni',
  users:      'Users',
  settings:   'Settings',
  departments:'Departments',
}

const SCOPE_DESCRIPTION: Record<string, string> = {
  all:  'Applies to all records in the system',
  dept: 'Restricted to records in the user\'s department',
  own:  'Restricted to records created by the user',
}

const SCOPE_VARIANTS: Record<string, string> = {
  all:  'bg-purple-100 text-purple-700',
  dept: 'bg-blue-100 text-blue-700',
  own:  'bg-slate-100 text-slate-600',
}

const ACTION_VARIANTS: Record<string, string> = {
  create:  'bg-emerald-100 text-emerald-700',
  read:    'bg-sky-100 text-sky-700',
  update:  'bg-amber-100 text-amber-700',
  delete:  'bg-red-100 text-red-700',
  publish: 'bg-cyan-100 text-cyan-700',
}

// Parsed row for the table
interface PermRow {
  raw: string
  module: string
  action: string
  scope: string
}

function parseRows(permissions: string[]): PermRow[] {
  return permissions.map(p => {
    const [module = '', action = '', scope = 'all'] = p.split(':')
    return { raw: p, module, action, scope }
  })
}

export default function PermissionsPage() {
  const { permissions, loading, error } = useAllPermissions()

  const rows = parseRows(permissions)

  const columns: Column<PermRow>[] = [
    {
      key: 'module',
      header: 'Module',
      render: row => (
        <span className="text-sm font-medium text-slate-700">
          {MODULE_LABELS[row.module] ?? row.module}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: row => (
        <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', ACTION_VARIANTS[row.action] ?? 'bg-slate-100 text-slate-600')}>
          {row.action}
        </span>
      ),
    },
    {
      key: 'scope',
      header: 'Scope',
      render: row => (
        <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', SCOPE_VARIANTS[row.scope] ?? 'bg-slate-100 text-slate-600')}>
          {row.scope}
        </span>
      ),
    },
    {
      key: 'raw',
      header: 'Scope Description',
      render: row => (
        <span className="text-xs text-slate-500">{SCOPE_DESCRIPTION[row.scope] ?? '—'}</span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
          <Lock size={20} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Permission Reference</h2>
          <p className="text-sm text-slate-500">
            {permissions.length} permissions defined across all modules
          </p>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-3 border-b border-slate-100 bg-amber-50">
          <p className="text-xs text-amber-700">
            This is a read-only reference. Assign permissions to roles from the <strong>Roles</strong> page.
          </p>
        </div>
        {error && (
          <p className="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-200">{error}</p>
        )}
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          keyExtractor={r => r.raw}
          emptyTitle="No permissions found"
          emptyDescription="Permissions are seeded via database migrations"
        />
      </div>
    </div>
  )
}
