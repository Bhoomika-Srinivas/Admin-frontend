import { useParams, useNavigate } from 'react-router-dom'
import { adminProgramService, adminDeptService, adminCourseService } from '@/app-modules/departments/api/adminCoursesApi'
import CatalogBreadcrumb from '@/app-modules/departments/components/CatalogBreadcrumb'
import clsx from 'clsx'

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

export default function AdminSemestersPage() {
  const { programId, deptId } = useParams<{ programId: string; deptId: string }>()
  const navigate              = useNavigate()

  const program  = adminProgramService.getById(programId!)
  const dept     = adminDeptService.getById(deptId!)
  const semesters = Array.from({ length: program?.maxSemesters ?? 8 }, (_, i) => i + 1)

  const base = `/academics/catalog/${programId}/${deptId}`

  return (
    <div className="space-y-5">
      <CatalogBreadcrumb items={[
        { label: program?.name ?? programId!, to: `/academics/catalog/${programId}` },
        { label: dept?.shortName ?? deptId! },
      ]} />

      <div>
        <h2 className="text-xl font-display font-bold text-slate-800">
          {dept?.shortName} — Semesters
        </h2>
        <p className="text-sm text-slate-500">
          {program?.fullName} · {dept?.name} · {program?.maxSemesters} semesters
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {semesters.map(sem => {
          const courseCount = adminCourseService.countForSemester(programId!, deptId!, sem)
          return (
            <button
              key={sem}
              onClick={() => navigate(`${base}/${sem}`)}
              className={clsx(
                'card p-5 text-left hover:shadow-md hover:border-brand-200 transition-all group',
                'flex flex-col gap-3',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
                  {sem}
                </span>
                <span className="text-xs text-slate-400 group-hover:text-brand-500 transition-colors">
                  View →
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-700">{ordinal(sem)} Semester</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {courseCount > 0 ? `${courseCount} course${courseCount !== 1 ? 's' : ''}` : 'No courses yet'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
