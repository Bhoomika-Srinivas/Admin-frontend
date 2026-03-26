import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { adminProgramService, adminDeptService, adminCourseService } from '@/app-modules/departments/api/adminCoursesApi'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

export default function DeptCatalogSemestersPage() {
  const { deptId, programId } = useParams<{ deptId: string; programId: string }>()
  const navigate              = useNavigate()

  const dept          = useDeptContext()
  const deptShortName = dept.shortName
  const program       = adminProgramService.getById(programId!)
  const catalogDept   = adminDeptService.findByShortName(programId!, deptShortName)

  const semesters = Array.from({ length: program?.maxSemesters ?? 8 }, (_, i) => i + 1)
  const base      = `/departments/${deptId}/academics/courses/${programId}`

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm">
        <button onClick={() => navigate(`/departments/${deptId}/academics/courses`)}
          className="text-slate-500 hover:text-brand-600 transition-colors">
          Courses
        </button>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-slate-700 font-medium">{program?.name ?? programId}</span>
      </nav>

      <div>
        <h3 className="text-base font-display font-bold text-slate-800">
          {program?.name} — Semesters
        </h3>
        <p className="text-sm text-slate-500">
          {program?.fullName} · {deptShortName} · {program?.maxSemesters} semesters
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {semesters.map(sem => {
          const count = catalogDept
            ? adminCourseService.countForSemester(programId!, catalogDept.id, sem)
            : 0
          return (
            <button key={sem} onClick={() => navigate(`${base}/${sem}`)}
              className="card p-5 text-left hover:shadow-md hover:border-brand-200 transition-all group flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
                  {sem}
                </span>
                <span className="text-xs text-slate-400 group-hover:text-brand-500 transition-colors">View →</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-700">{ordinal(sem)} Semester</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {count > 0 ? `${count} course${count !== 1 ? 's' : ''}` : 'No courses yet'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
