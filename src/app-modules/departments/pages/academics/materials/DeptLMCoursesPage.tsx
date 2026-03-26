import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, FileText } from 'lucide-react'
import { deptCourseService } from '@/app-modules/departments/api/deptAcademicsApi'
import { adminProgramService } from '@/app-modules/departments/api/adminCoursesApi'
import { useDeptContext } from '@/app-modules/departments/context/DepartmentContext'
import { useDepartmentSectionAsync } from '@/app-modules/departments/hooks/useDepartmentSection'
import type { DeptCourse } from '@/shared/types/models'
import clsx from 'clsx'

const TYPE_STYLE: Record<DeptCourse['type'], string> = {
  theory:   'bg-blue-50 text-blue-700',
  lab:      'bg-emerald-50 text-emerald-700',
  elective: 'bg-amber-50 text-amber-700',
}

export default function DeptLMCoursesPage() {
  const { deptId, programId, semester, batch } = useParams<{
    deptId: string; programId: string; semester: string; batch: string
  }>()
  const sem      = Number(semester)
  const batchName = decodeURIComponent(batch!)
  const navigate = useNavigate()
  const dept     = useDeptContext()
  const program  = adminProgramService.getById(programId!)
  const base     = `/departments/${deptId}/academics/materials/${programId}/${semester}/${encodeURIComponent(batchName)}`

  const { data: allCourses } = useDepartmentSectionAsync(
    () => deptCourseService.getAll(deptId!)
  )
  const courses = allCourses.filter(c => c.semester === sem)

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1 text-sm flex-wrap">
        <button onClick={() => navigate(`/departments/${deptId}/academics/materials`)}
          className="text-slate-500 hover:text-brand-600">Materials</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(`/departments/${deptId}/academics/materials/${programId}`)}
          className="text-slate-500 hover:text-brand-600">{program?.name}</button>
        <span className="text-slate-300">›</span>
        <button onClick={() => navigate(`/departments/${deptId}/academics/materials/${programId}/${semester}`)}
          className="text-slate-500 hover:text-brand-600">Sem {semester}</button>
        <span className="text-slate-300">›</span>
        <span className="text-slate-700 font-medium">{batchName}</span>
      </nav>

      <div>
        <h3 className="text-base font-display font-bold text-slate-800">
          {dept.shortName} · Sem {semester} · {batchName} — Courses
        </h3>
        <p className="text-sm text-slate-500">Select a course to manage its learning materials</p>
      </div>

      {courses.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center">
          <BookOpen size={28} className="text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No courses configured</p>
          <p className="text-xs text-slate-400 mt-1">
            Add courses in the <strong>Courses</strong> section first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {courses.map(course => {
            const chipCls = TYPE_STYLE[course.type]
            return (
              <button
                key={course.id}
                onClick={() => navigate(`${base}/${course.id}`)}
                className="card p-4 text-left hover:shadow-md hover:border-brand-200 transition-all group flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={clsx('font-mono text-xs font-bold px-1.5 py-0.5 rounded', chipCls)}>
                          {course.code}
                        </span>
                        <span className={clsx('text-xs px-1.5 py-0.5 rounded-full border capitalize', chipCls)}>
                          {course.type}
                        </span>
                      </div>
                      <p className="font-medium text-sm text-slate-800 mt-1 leading-tight">{course.name}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>{course.credits} credits</span>
                    {course.scheme && <><span>·</span><span>{course.scheme}</span></>}
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
