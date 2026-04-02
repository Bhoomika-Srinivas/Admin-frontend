import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

export default function DeptCatalogSemestersPage() {
  const { deptId, programType, program } = useParams<{
    deptId: string; programType: string; program: string
  }>()
  const navigate  = useNavigate()
  const prog      = decodeURIComponent(program!)
  const maxSem    = programType?.toUpperCase() === 'PG' ? 4 : 8
  const semesters = Array.from({ length: maxSem }, (_, i) => i + 1)
  const base      = `/departments/${deptId}/academics/courses`

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm flex-wrap">
        <button onClick={() => navigate(base)} className="text-slate-500 hover:text-brand-600">Courses</button>
        <ChevronRight size={13} className="text-slate-300" />
        <button onClick={() => navigate(`${base}/${programType}`)} className="text-slate-500 hover:text-brand-600">{programType}</button>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-slate-700 font-medium">{prog}</span>
      </nav>

      <div>
        <h3 className="text-base font-display font-bold text-slate-800">{prog} — Semesters</h3>
        <p className="text-sm text-slate-500">{programType} · {maxSem} semesters</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {semesters.map(sem => (
          <button
            key={sem}
            onClick={() => navigate(`${base}/${programType}/${program}/${sem}`)}
            className="card p-5 text-left hover:shadow-md hover:border-brand-200 transition-all group flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
                {sem}
              </span>
              <span className="text-xs text-slate-400 group-hover:text-brand-500 transition-colors">View →</span>
            </div>
            <p className="font-semibold text-sm text-slate-700">{ordinal(sem)} Semester</p>
          </button>
        ))}
      </div>
    </div>
  )
}
