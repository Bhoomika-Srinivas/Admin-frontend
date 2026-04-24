import { useState } from 'react'
import { ShieldCheck, Edit2, Check } from 'lucide-react'
import { useRoles, useAllPermissions } from '../hooks/useRoles'
import { rolesService } from '../api/rolesApi'
import type { Role } from '../types'
import { useToast } from '@/shared/context/ToastContext'
import Modal, { ModalFooter } from '@/shared/components/common/Modal'
import clsx from 'clsx'

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

// Parse "module:action:scope" into parts
function parsePerm(perm: string): { module: string; action: string; scope: string } {
  const [module = '', action = '', scope = 'all'] = perm.split(':')
  return { module, action, scope }
}

function PermissionBadge({ perm }: { perm: string }) {
  const { module, action, scope } = parsePerm(perm)
  return (
    <span className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 font-medium">
      <span className={clsx('px-1 rounded', ACTION_VARIANTS[action] ?? 'bg-slate-200')}>{action}</span>
      <span className="text-slate-400">{module}</span>
      <span className={clsx('px-1 rounded', SCOPE_VARIANTS[scope] ?? 'bg-slate-100')}>{scope}</span>
    </span>
  )
}

export default function RolesPage() {
  const toast = useToast()
  const { roles, loading, error, reload } = useRoles()
  const { byModule, loading: permsLoading } = useAllPermissions()

  const [editRole, setEditRole] = useState<Role | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  function openEdit(role: Role) {
    setEditRole(role)
    setSelected(new Set(role.permissions))
  }

  function togglePermission(perm: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(perm) ? next.delete(perm) : next.add(perm)
      return next
    })
  }

  async function handleSave() {
    if (!editRole) return
    setSaving(true)
    try {
      await rolesService.setPermissions(editRole.id, Array.from(selected))
      toast.success(`Permissions updated for ${editRole.displayName}`)
      reload()
      setEditRole(null)
    } catch {
      toast.error('Failed to update permissions')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Roles & Permissions</h2>
          <p className="text-sm text-slate-500">Loading roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">Roles & Permissions</h2>
        <p className="text-sm text-slate-500">
          {roles.length} roles • Manage what each role can access across modules
        </p>
      </div>

      {error && (
        <p className="px-4 py-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</p>
      )}

      {/* Role cards */}
      <div className="grid gap-4">
        {roles.map(role => (
          <div key={role.id} className="card">
            <div className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{role.displayName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''} assigned
                  </p>
                </div>
              </div>
              <button
                onClick={() => openEdit(role)}
                className="btn-secondary text-xs"
              >
                <Edit2 size={13} />
                Manage Permissions
              </button>
            </div>

            {role.permissions.length > 0 && (
              <div className="px-5 pb-4 flex flex-wrap gap-1.5">
                {role.permissions.map(p => (
                  <PermissionBadge key={p} perm={p} />
                ))}
              </div>
            )}

            {role.permissions.length === 0 && (
              <div className="px-5 pb-4">
                <p className="text-xs text-slate-400 italic">No permissions assigned</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Assign Permissions Modal */}
      <Modal
        open={!!editRole}
        onClose={() => setEditRole(null)}
        title={`Manage Permissions — ${editRole?.displayName ?? ''}`}
        size="lg"
      >
        {permsLoading ? (
          <p className="text-sm text-slate-500 py-4">Loading permissions...</p>
        ) : (
          <div className="space-y-5 max-h-[60vh] overflow-y-auto">
            {Object.entries(byModule).map(([moduleName, perms]) => (
              <div key={moduleName}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {MODULE_LABELS[moduleName] ?? moduleName}
                </p>
                <div className="space-y-1">
                  {perms.map(perm => {
                    const { action, scope } = parsePerm(perm)
                    const isChecked = selected.has(perm)
                    return (
                      <button
                        key={perm}
                        type="button"
                        onClick={() => togglePermission(perm)}
                        className={clsx(
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                          isChecked
                            ? 'bg-brand-50 border border-brand-200'
                            : 'bg-slate-50 border border-transparent hover:bg-slate-100',
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', ACTION_VARIANTS[action] ?? 'bg-slate-100 text-slate-600')}>
                            {action}
                          </span>
                          <span className="text-slate-700">{MODULE_LABELS[moduleName] ?? moduleName}</span>
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', SCOPE_VARIANTS[scope] ?? 'bg-slate-100 text-slate-600')}>
                            {scope}
                          </span>
                        </span>
                        {isChecked && <Check size={14} className="text-brand-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <ModalFooter>
          <button onClick={() => setEditRole(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : `Save Permissions`}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
