import { useParams, useNavigate } from 'react-router-dom'
import { FileText, ChevronRight } from 'lucide-react'
import { adminDeptService } from '@/app-modules/departments/api/adminCoursesApi'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import clsx from 'clsx'

const PROGRAM_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  be:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  mca:   { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200'  },
  mtech: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  bca:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
}
const DEFAULT_STYLE = { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }

export default function DeptLMProgramsPage() {
  const { deptId } = useParams<{ deptId: string }>()
  const navigate   = useNavigate()

  const dept          = useDeptContext()
  const deptShortName = dept.shortName
  const programs      = adminDeptService.getProgramsForShortName(deptShortName)
  const base          = `/departments/${deptId}/academics/materials`

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-display font-bold text-slate-800">Learning Materials</h3>
        <p className="text-sm text-slate-500">
          {programs.length} program{programs.length !== 1 ? 's' : ''} · {deptShortName}
        </p>
      </div>

      {programs.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center">
          <FileText size={28} className="text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No programs found</p>
          <p className="text-xs text-slate-400 mt-1">
            No catalog programs include a <strong>{deptShortName}</strong> department yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {programs.map(p => {
            const style = PROGRAM_STYLES[p.id] ?? DEFAULT_STYLE
            return (
              <button
                key={p.id}
                onClick={() => navigate(`${base}/${p.id}`)}
                className={clsx(
                  'card p-5 text-left hover:shadow-md transition-all group flex items-start gap-4',
                  `border ${style.border}`,
                )}
              >
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', style.bg)}>
                  <FileText size={18} className={style.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={clsx('font-bold text-base', style.text)}>{p.name}</p>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>
                  <p className="text-sm text-slate-500 truncate">{p.fullName}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-400">
                    <span>{p.duration}</span>
                    <span>·</span>
                    <span>{p.maxSemesters} Semesters</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
