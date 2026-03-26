import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { deptBatchService } from '@/app-modules/departments/api/deptAcademicsApi'
import { adminProgramService } from '@/app-modules/departments/api/adminCoursesApi'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import DataTable, { type Column } from '@/shared/components/tables/DataTable'
import type { DeptBatch } from '@/shared/types/models'

export default function DeptLMBatchesPage() {
  const { deptId, programId, semester } = useParams<{
    deptId: string; programId: string; semester: string
  }>()
  const navigate = useNavigate()
  const dept     = useDeptContext()
  const program  = adminProgramService.getById(programId!)
  const base     = `/departments/${deptId}/academics/materials/${programId}/${semester}`

  const { data: batches } = useDepartmentSectionAsync(
    () => deptBatchService.getAll(deptId!, programId!)
  )

  const columns: Column<DeptBatch>[] = [
    {
      key: 'name', header: 'Batch',
      render: r => <span className="font-semibold text-sm text-slate-800">{r.name}</span>,
    },
    {
      key: 'startYear', header: 'Start Year',
      render: r => <span className="text-sm text-slate-500">{r.startYear ?? '—'}</span>,
    },
    {
      key: 'endYear', header: 'End Year',
      render: r => <span className="text-sm text-slate-500">{r.endYear ?? '—'}</span>,
    },
    {
      key: 'actions', header: '', className: 'w-12',
      render: r => (
        <button onClick={() => navigate(`${base}/${encodeURIComponent(r.name)}`)}
          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
          <ChevronRight size={14} />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm flex-wrap">
        <button onClick={() => navigate(`/departments/${deptId}/academics/materials`)}
          className="text-slate-500 hover:text-brand-600">Materials</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(`/departments/${deptId}/academics/materials/${programId}`)}
          className="text-slate-500 hover:text-brand-600">{program?.name}</button>
        <span className="text-slate-300">›</span>
        <span className="text-slate-700 font-medium">Semester {semester}</span>
      </nav>

      <div>
        <h3 className="text-base font-display font-bold text-slate-800">Semester {semester} — Batches</h3>
        <p className="text-sm text-slate-500">
          {program?.name} · {dept.shortName} · {batches.length} batch{batches.length !== 1 ? 'es' : ''}
        </p>
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={batches}
          keyExtractor={r => r.id}
          total={batches.length}
          onRowClick={r => navigate(`${base}/${encodeURIComponent(r.name)}`)}
          emptyTitle="No batches yet"
          emptyDescription="Add batches in the Courses section first." />
      </div>
    </div>
  )
}
