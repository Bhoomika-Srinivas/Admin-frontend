import { useNavigate, useParams } from 'react-router-dom'
import { Users, ChevronRight, CalendarDays } from 'lucide-react'
import { getCourses, getDept, getProgram } from '@/data/coursesData'
import CourseBreadcrumb from '../components/CourseBreadcrumb'

export default function BatchSelectionPage() {
  const { programId, deptId, semester } = useParams<{
    programId: string
    deptId: string
    semester: string
  }>()
  const navigate = useNavigate()

  const sem     = Number(semester)
  const program = getProgram(programId ?? '')
  const dept    = program ? getDept(program, deptId ?? '') : undefined

  if (!program || !dept || isNaN(sem)) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Invalid selection.</p>
        <button onClick={() => navigate('/academics/courses')} className="btn-secondary mt-4">
          Back to Programs
        </button>
      </div>
    )
  }

  const courses      = getCourses(program.id, dept.id, sem)
  const totalCredits = courses.reduce((s, c) => s + c.credits, 0)

  // Encode batch label for URL (replace spaces/slashes with dashes)
  function encodeBatch(batch: string) {
    return batch.replace(/\//g, '-')
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <CourseBreadcrumb items={[
        { label: program.name, to: `/academics/courses/${program.id}` },
        { label: dept.shortName, to: `/academics/courses/${program.id}/${dept.id}` },
        { label: `Semester ${sem}` },
      ]} />

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${program.color} flex items-center justify-center flex-shrink-0 font-display font-bold text-lg ${program.textColor}`}>
          {sem}
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">
            Semester {sem} — {dept.shortName}
          </h2>
          <p className="text-sm text-slate-500">
            {program.name} · {courses.length} courses · {totalCredits} credits · Select a batch
          </p>
        </div>
      </div>

      {/* Batch cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {program.batches.map(batch => (
          <button
            key={batch}
            onClick={() => navigate(`/academics/courses/${program.id}/${dept.id}/${sem}/${encodeBatch(batch)}`)}
            className={`card p-5 text-left hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-2 ${program.borderColor} group flex items-center gap-4`}
          >
            <div className={`w-12 h-12 rounded-xl ${program.color} flex items-center justify-center flex-shrink-0`}>
              <CalendarDays size={20} className={program.textColor} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-base">{batch}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Users size={11} />
                <span>Batch of {batch.split('-')[0]}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {courses.length} courses · {totalCredits} total credits
              </p>
            </div>

            <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Courses preview */}
      {courses.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Semester {sem} — Course Preview ({courses.length} courses)
          </p>
          <div className="flex flex-wrap gap-2">
            {courses.map(c => (
              <span
                key={c.code}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium"
              >
                {c.code} · {c.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
