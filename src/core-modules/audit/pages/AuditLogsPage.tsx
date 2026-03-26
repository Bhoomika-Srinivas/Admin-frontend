import { useState, useMemo } from 'react'
import { ShieldCheck } from 'lucide-react'
import { auditService, type AuditLog } from '@/core-modules/audit/api/auditApi'
import SearchBar from '@/shared/components/filters/SearchBar'
import SelectFilter from '@/shared/components/filters/SelectFilter'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import { format } from 'date-fns'

const moduleOptions = [
  { value: 'Events',      label: 'Events' },
  { value: 'Users',       label: 'Users' },
  { value: 'Departments', label: 'Departments' },
  { value: 'News',        label: 'News' },
  { value: 'Faculty',     label: 'Faculty' },
  { value: 'Alumni',      label: 'Alumni' },
  { value: 'Committees',  label: 'Committees' },
  { value: 'Placements',  label: 'Placements' },
]

const actionColorMap: Record<string, string> = {
  Created:  'bg-emerald-100 text-emerald-700',
  Added:    'bg-emerald-100 text-emerald-700',
  Updated:  'bg-blue-100 text-blue-700',
  Deleted:  'bg-red-100 text-red-700',
  Removed:  'bg-red-100 text-red-700',
  Approved: 'bg-purple-100 text-purple-700',
  Rejected: 'bg-orange-100 text-orange-700',
  Published:'bg-cyan-100 text-cyan-700',
}

function actionBadgeClass(action: string) {
  const word = Object.keys(actionColorMap).find(k => action.includes(k))
  return word ? actionColorMap[word] : 'bg-slate-100 text-slate-600'
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [page, setPage] = useState(1)
  const limit = 15

  // Load fresh on each render — service is in-memory
  const allLogs = auditService.getLogs()

  const filtered = useMemo(() => allLogs.filter(log => {
    const q = search.toLowerCase()
    return (
      (!q || log.action.toLowerCase().includes(q) || log.userName.toLowerCase().includes(q) || (log.details ?? '').toLowerCase().includes(q)) &&
      (!moduleFilter || log.module === moduleFilter)
    )
  }), [search, moduleFilter, allLogs.length])

  const paginated = filtered.slice((page - 1) * limit, page * limit)

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp', header: 'Time',
      render: row => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {format(new Date(row.timestamp), 'MMM d, HH:mm:ss')}
        </span>
      )
    },
    {
      key: 'userName', header: 'User',
      render: row => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
            {row.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{row.userName}</span>
        </div>
      )
    },
    {
      key: 'action', header: 'Action',
      render: row => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionBadgeClass(row.action)}`}>
          {row.action}
        </span>
      )
    },
    {
      key: 'module', header: 'Module',
      render: row => <span className="badge badge-gray">{row.module}</span>
    },
    {
      key: 'details', header: 'Details',
      render: row => <span className="text-xs text-slate-500">{row.details ?? '—'}</span>
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
          <ShieldCheck size={20} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">Audit Logs</h2>
          <p className="text-sm text-slate-500">{filtered.length} log entries</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1) }}
            placeholder="Search by action, user or details..."
            className="flex-1"
          />
          <SelectFilter
            value={moduleFilter}
            onChange={v => { setModuleFilter(v); setPage(1) }}
            options={moduleOptions}
            placeholder="All Modules"
            className="sm:w-40"
          />
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          keyExtractor={r => r.id}
          total={filtered.length}
          page={page}
          limit={limit}
          onPageChange={setPage}
          emptyTitle="No audit logs found"
          emptyDescription="Actions performed in the system will appear here"
        />
      </div>
    </div>
  )
}
