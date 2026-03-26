import { useNavigate, useParams } from 'react-router-dom'
import { getCourses, getDept, getProgram } from '@/data/coursesData'
import CourseBreadcrumb from '../components/CourseBreadcrumb'
import clsx from 'clsx'

export default function SemestersPage() {
  const { programId, deptId } = useParams<{ programId: string; deptId: string }>()
  const navigate = useNavigate()

  const program = getProgram(programId ?? '')
  const dept    = program ? getDept(program, deptId ?? '') : undefined

  if (!program || !dept) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Program or department not found.</p>
        <button onClick={() => navigate('/academics/courses')} className="btn-secondary mt-4">
          Back to Programs
        </button>
      </div>
    )
  }

  const semesters = Array.from({ length: program.maxSemesters }, (_, i) => i + 1)

  const semesterLabel = (sem: number) => {
    const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
    return ordinals[sem - 1] ?? `${sem}th`
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <CourseBreadcrumb items={[
        { label: program.name, to: `/academics/courses/${program.id}` },
        { label: dept.shortName },
      ]} />

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${program.color} flex items-center justify-center flex-shrink-0 font-display font-bold text-sm ${program.textColor}`}>
          {dept.shortName}
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">{dept.name}</h2>
          <p className="text-sm text-slate-500">{program.name} · {program.fullName} · Select a semester</p>
        </div>
      </div>

      {/* Semester grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {semesters.map(sem => {
          const courses = getCourses(program.id, dept.id, sem)
          const hasCourses = courses.length > 0
          const totalCredits = courses.reduce((s, c) => s + c.credits, 0)
          const theoryCount = courses.filter(c => c.type === 'Theory' || c.type === 'Elective').length
          const labCount    = courses.filter(c => c.type === 'Lab').length

          return (
            <button
              key={sem}
              onClick={() => navigate(`/academics/courses/${program.id}/${dept.id}/${sem}`)}
              className={clsx(
                'card p-5 text-left transition-all duration-200 group',
                hasCourses
                  ? `border-2 ${program.borderColor} hover:-translate-y-0.5 hover:shadow-md`
                  : 'border-2 border-dashed border-slate-200 opacity-60 cursor-default'
              )}
              disabled={!hasCourses}
            >
              {/* Semester number */}
              <div className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg mb-3',
                hasCourses ? `${program.color} ${program.textColor}` : 'bg-slate-100 text-slate-400'
              )}>
                {sem}
              </div>

              <p className="font-semibold text-slate-800 text-sm">{semesterLabel(sem)} Semester</p>

              {hasCourses ? (
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <p>{courses.length} courses · {totalCredits} credits</p>
                  <p>{theoryCount} theory · {labCount} lab</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-1">Not configured</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
